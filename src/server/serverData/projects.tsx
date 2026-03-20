import { auth } from "../auth"
import { db } from "../db"
import { Pool } from 'pg';

const useGetProjects = async () => {

    const userId = (await auth())?.user?.id
    if (!userId) {
        return []
    }

    let projects
    projects = await db.project.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    if (projects.length === 0) {
        const project = await db.project.create({
            data: {
                userId: userId,
                name: "Default"
            }
        })

        projects = [project]
    }

    return projects
}

const useGetFullProject = async (id: string, stopPropagation: boolean = false) => {
    const { user } = await auth() as any

    let project = await db.project.findFirst({
        where: {
            id: id,
            userId: user.id
        },
        include: {
            settings: {
                orderBy: {
                    createdAt: "desc"
                }
            },
            currentSetting: true
        }
    })

    if (!stopPropagation && project && project.settings.length === 0) {
        const settings = await db.projectSetting.create({
            data: {
                projectId: project.id
            }
        })

        project = await db.project.update({
            where: {
                id: id,
                userId: user.id
            },
            data: {
                currentSettingId: settings.id
            },
            include: {
                settings: {
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                currentSetting: true
            }
        })
    }

    let dbHealthCheck: any | undefined;

    if (project && (project as any).currentSetting) {
        const { dbHost, dbPort, dbUser, dbPassword, dbName } = (project as any).currentSetting;

        dbHealthCheck = await checkPostgresHealth(
            dbHost,
            dbPort,
            dbUser,
            dbPassword,
            dbName
        );
    }

    if(!user.onBoarding){
        await db.user.update({
            where: {
                id: user.id
            },
            data: {
                onBoarding: true
            }
        })
    }

    return {
        onBoarding: user.onBoarding,
        ...project,
        dbHealthCheck
    };
}

async function checkPostgresHealth(
    host: string,
    port: number,
    user: string,
    password: string,
    database: string
) {
    const startTime = Date.now();
    const connectionUrl = `postgresql://${user}:${password}@${host}:${port}/${database}`;
    const pool = new Pool({ connectionString: connectionUrl });

    try {
        const connectionInfo = { host, port, database, user };

        const client = await pool.connect();

        const queries = await Promise.all([
            client.query('SELECT version()'),
            client.query('SELECT current_database(), current_user, current_timestamp'),
            client.query('SELECT count(*) as active FROM pg_stat_activity'),
            client.query('SHOW max_connections'),
        ]);

        client.release();

        const responseTime = Date.now() - startTime;

        return {
            isHealthy: true,
            responseTime,
            connectionInfo,
            serverInfo: {
                version: queries[0].rows[0].version,
                currentDatabase: queries[1].rows[0].current_database,
                currentUser: queries[1].rows[0].current_user,
                currentTimestamp: queries[1].rows[0].current_timestamp,
                activeConnections: parseInt(queries[2].rows[0].active),
                maxConnections: parseInt(queries[3].rows[0].max_connections),
            },
        };
    } catch (error) {
        const responseTime = Date.now() - startTime;

        return {
            isHealthy: false,
            responseTime,
            error: error instanceof Error ? error.message : 'Unknown error',
            connectionInfo: { host, port, database, user },
        };
    } finally {
        await pool.end();
    }
}

export { useGetProjects, useGetFullProject }