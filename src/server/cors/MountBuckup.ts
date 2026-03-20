import { db } from "../db";
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '@/server/s3';
import { exec } from 'child_process';
import { useSendNotification } from "@/hooks/useSendNotification";

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME;

async function createMountLog(
    backupId: string,
    logText: string,
    isSuccess: boolean,
    status: string,
    duration?: number
) {
    await db.mountLog.create({
        data: {
            backupId,
            logText,
            isSuccess,
            status,
            duration,
        },
    });
}

async function MountBackup({ backupId, userId }: {
    backupId: string;
    userId: string;
    targetDbSettings?: {
        dbHost: string;
        dbPort: number;
        dbUser: string;
        dbPassword: string;
        dbName: string;
    };
}) {
    const startTime = Date.now();
    let logs = "";

    await createMountLog(
        backupId,
        "Restore process started",
        false,
        "in_progress"
    );

    try {
        if (!backupId) {
            const errorMsg = 'Backup ID is required';
            await createMountLog(backupId, errorMsg, false, "fail");
            return {
                success: false,
                status: "fail",
                message: errorMsg
            };
        }

        const backup = await db.backup.findUnique({
            where: { id: backupId },
            include: {
                project: {
                    include: {
                        currentSetting: true
                    }
                }
            }
        });

        if (!backup) {
            const errorMsg = 'Backup not found';
            await createMountLog(backupId, errorMsg, false, "fail");
            return {
                success: false,
                status: "fail",
                message: errorMsg
            };
        }

        if (userId && backup.userId !== userId) {
            const errorMsg = 'Access denied';
            await createMountLog(backupId, errorMsg, false, "fail");
            return {
                success: false,
                status: "fail",
                message: errorMsg
            };
        }

        const dbSettings = backup.project.currentSetting;

        if (!dbSettings) {
            const errorMsg = 'No database settings available for restore';
            await createMountLog(backupId, errorMsg, false, "fail");
            return {
                success: false,
                status: "fail",
                message: errorMsg
            };
        }

        const getObjectParams = {
            Bucket: backup.s3Bucket || BUCKET_NAME,
            Key: backup.s3Key,
        };

        let s3Response;
        try {
            s3Response = await s3.send(new GetObjectCommand(getObjectParams));
        } catch (s3Error: any) {
            logs = `Failed to retrieve backup from S3: ${s3Error?.message || s3Error}`;

            await createMountLog(backupId, logs, false, "fail", Date.now() - startTime);

            await useSendNotification({
                userId,
                title: `Restore Failed: ${backup.project.name}`,
                text: logs,
                image: null,
                link: `${backup.projectId}`
            });

            return {
                success: false,
                status: "fail",
                message: logs
            };
        }

        const chunks: Uint8Array[] = [];
        const stream = s3Response.Body as any;

        for await (const chunk of stream) {
            chunks.push(chunk);
        }

        const backupBuffer = Buffer.concat(chunks);

        const env = {
            ...process.env,
            PGPASSWORD: dbSettings.dbPassword,
        };

        const psqlCommand = `psql --no-password -h ${dbSettings.dbHost} -p ${dbSettings.dbPort} -U ${dbSettings.dbUser} -d ${dbSettings.dbName} -f -`;

        let errorLog = ""
        await new Promise<void>((resolve, reject) => {
            const restoreProcess = exec(psqlCommand, {
                env,
                maxBuffer: 1024 * 1024 * 300
            }, (error, stdout, stderr) => {
                if (error) {
                    logs = `Failed to restore database: ${error.message}\nStderr: ${stderr}`;
                    reject(new Error(logs));
                } else {
                    console.log('PSQL Output:', stdout);
                    if (stderr) {
                        // errorLog = stderr
                        console.log(stderr)
                    }
                    resolve();
                }
            });

            restoreProcess.stdin?.write(backupBuffer);
            restoreProcess.stdin?.end();
        });

        const endTime = Date.now();
        const restoreTimeMs = endTime - startTime;
        const restoreTimeSec = (restoreTimeMs / 1000).toFixed(2);

        if (errorLog) {

            await createMountLog(backupId, errorLog, false, "fail", Number(restoreTimeSec));

            await useSendNotification({
                userId,
                title: `Restore Failed`,
                text: errorLog,
                image: null,
                link: backupId
            });

            return {
                success: false,
                status: "fail",
                message: errorLog
            };
        }

        logs = `Database restored successfully in ${restoreTimeSec}s`;

        await createMountLog(backupId, logs, true, "success", restoreTimeMs);

        await useSendNotification({
            userId,
            title: `Restore Completed: ${backup.project.name}`,
            text: `Successfully restored database ${dbSettings.dbName} from backup ${backup.fileName}. Time taken: ${restoreTimeSec}s`,
            image: null,
            link: `${backup.projectId}`
        });

        return {
            success: true,
            status: "success",
            message: 'Database restored successfully',
            restoreTimeMs,
            backupFileName: backup.fileName
        };

    } catch (error: any) {
        logs = `Restore failed: ${error?.message || error}`;
        const duration = Date.now() - startTime;

        await createMountLog(backupId, logs, false, "fail", duration);

        await useSendNotification({
            userId,
            title: `Restore Failed`,
            text: logs,
            image: null,
            link: backupId
        });

        return {
            success: false,
            status: "fail",
            message: logs
        };
    }
}

export { MountBackup };