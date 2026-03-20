import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { NextResponse, type NextRequest } from "next/server"

const POST = async (req: NextRequest) => {
    try {
        const body = await req.json()
        const { id, projectId, dbHost, dbPort, dbUser, dbPassword, dbName, color, cronFrequency } = body

        if (!projectId) {
            return NextResponse.json({
                success: false,
                message: "Project ID is required."
            })
        }

        const { user } = await auth() as any

        const project = await db.project.findUnique({
            where: { id: projectId, userId: user.id },
            include: { settings: true }
        })

        if (!project) {
            return NextResponse.json({
                success: false,
                message: "Project not found"
            })
        }

        let setting
        if (id) {
            setting = await db.projectSetting.update({
                where: { id },
                data: {
                    dbHost,
                    dbPort,
                    dbUser,
                    dbPassword,
                    dbName,
                    color,
                }
            })
        } else {
            setting = await db.projectSetting.create({
                data: {
                    projectId,
                    dbHost: dbHost ?? "localhost",
                    dbPort: dbPort ?? 5432,
                    dbUser: dbUser ?? "postgres",
                    dbPassword: dbPassword ?? "",
                    dbName: dbName ?? "postgres",
                    color: color ?? "#72e3ad"
                }
            })

            await db.project.update({
                where: { id: projectId },
                data: { currentSettingId: setting.id }
            })
        }

          if (cronFrequency !== undefined) {
            const updateData: any = {
                cronFrequency
            }

            if (cronFrequency === "hourly" || cronFrequency === "daily") {
                updateData.failStrick = 0
                updateData.lastJob = new Date()
            }

            await db.project.update({
                where: { id: projectId },
                data: updateData
            })
        }

        return NextResponse.json({
            success: true,
            message: id ? "Settings updated successfully." : "Settings created successfully.",
            data: setting
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "An error occurred",
        })
    }
}

const DELETE = async (req: NextRequest) => {
    try {
        const body = await req.json()
        const { id, projectId } = body

        if (!id || !projectId) {
            return NextResponse.json({
                success: false,
                message: "Setting ID and Project ID are required."
            })
        }

        const { user } = await auth() as any

        const project = await db.project.findUnique({
            where: { id: projectId, userId: user.id },
            include: { settings: true }
        })

        if (!project) {
            return NextResponse.json({
                success: false,
                message: "Project not found"
            })
        }

        await db.projectSetting.delete({
            where: { id }
        })

        const count = await db.projectSetting.count({
            where: { projectId }
        });

        if (count === 0) {
            const defaultSetting = await db.projectSetting.create({
                data: {
                    projectId,
                }
            });
            
            await db.project.update({
                where: { id: projectId },
                data: { currentSettingId: defaultSetting.id }
            });
        }

        return NextResponse.json({
            success: true,
            message: "Setting deleted successfully.",
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "An error occurred",
        })
    }
}

const PUT = async (req: NextRequest) => {
    try {
        const body = await req.json()
        const { id, projectId } = body

        if (!id || !projectId) {
            return NextResponse.json({
                success: false,
                message: "Setting ID and Project ID are required."
            })
        }

        const { user } = await auth() as any

        const project = await db.project.findUnique({
            where: { id: projectId, userId: user.id }
        })

        if (!project) {
            return NextResponse.json({
                success: false,
                message: "Project not found."
            })
        }

        await db.project.update({
            where: { id: projectId },
            data: { currentSettingId: id }
        })

        return NextResponse.json({
            success: true,
            message: "Current setting updated.",
            currentSettingId: id
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "An error occurred",
            error: (error as any)?.message
        })
    }
}

export { POST, DELETE, PUT }