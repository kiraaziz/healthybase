import { auth } from "@/server/auth"
import { MountBackup } from "@/server/cors/MountBuckup"
import { NextResponse, type NextRequest } from "next/server"

async function POST(req: NextRequest) {
    try {
        const session = await auth()
        const userId = session?.user.id

        if (!userId) {
            return NextResponse.json({
                success: true,
                status: "fail",
                message: 'Unauthorized'
            })
        }

        const body = await req.json()
        const { backupId } = body

        const mountStatus = await MountBackup({ backupId, userId })

        return NextResponse.json(mountStatus)


    } catch (error: any) {
        const logs = `Restore failed: Unable to process the request. `

        console.log(error)
        return NextResponse.json({
            success: true,
            status: "fail",
            message: logs,
        })
    }
}

export { POST }