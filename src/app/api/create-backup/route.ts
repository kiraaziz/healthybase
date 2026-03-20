import { NextRequest, NextResponse } from "next/server"
import { db } from "@/server/db"
import { CreateBuckup } from "@/server/cors/CreateBuckup";

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');
        
        if (!token || token !== process.env.JOB_KEY) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 })
        }

        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const projects = await db.project.findMany({
            where: {
                AND: [
                    { failStrick: { lt: 3 } },
                    { cronFrequency: { not: "none" } },
                    {
                        OR: [
                            {
                                cronFrequency: "hourly",
                                lastJob: { lt: oneHourAgo }
                            },
                            {
                                cronFrequency: "daily",
                                lastJob: { lt: oneDayAgo }
                            },
                            {
                                lastJob: null
                            }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                userId: true
            }
        });

        await Promise.all(projects.map(async (project) => {
            await CreateBuckup({ projectId: project.id, userId: project.userId, isJob: true })
        }))

        return NextResponse.json({
            success: true,
            processedProjects: projects.length
        })
    } catch (error: any) {
        console.error("Backup cron job error:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to create backup"
        }, { status: 500 })
    }
}