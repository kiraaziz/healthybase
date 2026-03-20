import { db } from "../db";
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '@/server/s3'
import { exec } from 'child_process'
import { PassThrough } from 'stream'
import { useSendNotification } from "@/hooks/useSendNotification";

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME

async function CreateBuckup({ projectId, userId, isJob }: any) {
    let backupRecord = null;
    let backupId: string | null = null;
    let backupFileName = "";
    let s3Key = "";
    let backupSize = 0;
    let estimatedTimeMs = 0;
    let settings: any = null;
    let project: any = null;
    let color = "";
    let status = "pending";
    let logs = "";
    const startTime = Date.now();

    try {
        if (!projectId) {
            return {
                success: true,
                status: "fail",
                message: 'Project ID is required'
            }
        }

        project = await db.project.findUnique({
            where: { id: projectId },
            include: {
                currentSetting: true,
            },
        })

        if (!project) {
            return {
                success: true,
                status: "fail",
                message: 'Project not found'
            }
        }

        if (userId && project.userId !== userId) {
            return {
                success: true,
                status: "fail",
                message: 'Access denied'
            }
        }

        if (!project.currentSetting) {
            return {
                success: true,
                status: "fail",
                message: 'Project has no active database settings'
            }
        }

        settings = project.currentSetting

        const today = new Date()
        const dateFolder = today.toISOString().split('T')[0]

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        backupFileName = `${project.name}_${settings.dbName}_${timestamp}.sql`

        s3Key = `backups/${dateFolder}/${userId}/${backupFileName}`

        color = settings.color

        backupRecord = await db.backup.create({
            data: {
                projectId: projectId,
                userId: userId,
                fileName: backupFileName,
                s3Key: s3Key,
                s3Bucket: BUCKET_NAME || "",
                fileSize: 0,
                createdAt: new Date(),
                estimatedTime: 0,
                color: color,
                setting: `${settings.dbHost}:${settings.dbPort}/${settings.dbName}`,
                status: "pending",
                logs: "",
            },
        });

        if (isJob) {
            await db.project.update({
                where: {
                    id: projectId,
                },
                data: {
                    lastJob: new Date()
                }
            })
        }

        backupId = backupRecord.id;

        const env = {
            ...process.env,
            PGPASSWORD: settings.dbPassword,
            PGSSLMODE: "disable",   
        }

        const pgDumpCommand = `pg_dump -h ${settings.dbHost} -p ${settings.dbPort} -U ${settings.dbUser} -d ${settings.dbName} -F p --clean --if-exists`;

        let backupProcess
        try {
            backupProcess = exec(pgDumpCommand, {
                env,
                maxBuffer: 1024 * 1024 * 300 // 300Mo buffer
            })
        } catch (execError: any) {
            status = "failed";
            logs = `Failed to start database backup process: ${execError?.message || execError}`;
            if (backupId) {
                await db.backup.update({
                    where: { id: backupId },
                    data: { status, logs }
                });

                if (isJob) {
                    await db.project.update({
                        where: {
                            id: projectId,
                        },
                        data: {
                            failStrick: {
                                increment: 1
                            }
                        }
                    })
                }

                await useSendNotification({
                    userId,
                    title: `Backup Failed: ${project.name}`,
                    text: `Failed to start backup process for database ${settings.dbName}. ${execError?.message || 'Unknown error'}`,
                    image: null,
                    link: `${projectId}`
                });
            }
            return {
                success: true,
                status: "fail",
                message: 'Failed to start database backup process',
            }
        }

        backupProcess.stderr?.on('data', (data) => {
            console.log("pg_dump error:", data.toString());
        });
        backupProcess.stdout?.on('data', (data) => {
            console.log("pg_dump output:", data.toString());
        });


        const passThrough = new PassThrough()
        backupProcess.stdout?.pipe(passThrough)

        const chunks: Buffer[] = []
        passThrough.on('data', (chunk) => chunks.push(chunk))

        await new Promise((resolve, reject) => {
            backupProcess.on('close', (code) => {
                if (code === 0) resolve(code)
                else reject(new Error(`pg_dump exited with code ${code}`))
            })
            backupProcess.on('error', reject)
        })

        const backupBuffer = Buffer.concat(chunks)
        backupSize = backupBuffer.length

        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: backupBuffer,
            ContentType: 'application/sql',
            Metadata: {
                'user-id': userId,
                'project-id': projectId,
                'project-name': project.name,
                'db-name': settings.dbName,
                'created-at': new Date().toISOString(),
            },
        }

        await s3.send(new PutObjectCommand(uploadParams))

        const endTime = Date.now();
        estimatedTimeMs = endTime - startTime;

        status = "success";
        logs = "";

        backupRecord = await db.backup.update({
            where: { id: backupId },
            data: {
                fileSize: backupSize,
                estimatedTime: estimatedTimeMs,
                status,
                logs,
            },
        });

        if (isJob) {
            await db.project.update({
                where: {
                    id: projectId,
                },
                data: {
                    failStrick: 0
                }
            })
        }

        const fileSizeInMB = (backupSize / (1024 * 1024)).toFixed(2);
        const estimatedTimeSec = (estimatedTimeMs / 1000).toFixed(2);

        await useSendNotification({
            userId,
            title: `Backup Completed: ${project.name}`,
            text: `Successfully backed up database ${settings.dbName}. File size: ${fileSizeInMB}MB. Time taken: ${estimatedTimeSec}s`,
            image: null,
            link: `${projectId}`
        });

        return {
            success: true,
            status: "success",
            message: 'Backup created successfully',
            backupRecord
        }

    } catch (error: any) {
        status = "failed";
        logs = `Backup failed: Unable to connect to your database. Please check your database credentials and network settings. (${error.message})`;

        if (backupId) {
            await db.backup.update({
                where: { id: backupId },
                data: {
                    status,
                    logs,
                },
            });

            if (isJob) {
                await db.project.update({
                    where: {
                        id: projectId,
                    },
                    data: {
                        failStrick: {
                            increment: 1
                        }
                    }
                })
            }

            await useSendNotification({
                userId,
                title: `Backup Failed: ${project?.name || 'Unknown Project'}`,
                text: logs,
                image: null,
                link: `${projectId}`
            });
        }
        return {
            success: true,
            status: "fail",
            message: logs,
        }
    }
}


export { CreateBuckup }