import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db'
import { auth } from '@/server/auth'
import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '@/server/s3'
import { CreateBuckup } from '@/server/cors/CreateBuckup'

async function GET(req: NextRequest) {
    try {
        const session = await auth()
        const userId = session?.user.id

        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' })
        }

        const { searchParams } = new URL(req.url)
        const backupId = searchParams.get('backupId')

        if (!backupId) {
            return NextResponse.json({ success: false, message: 'Backup ID is required' })
        }

        const backup = await db.backup.findUnique({
            where: { id: backupId },
        })

        if (!backup) {
            return NextResponse.json({ success: false, message: 'Backup not found' }, { status: 404 })
        }

        if (backup.userId !== userId) {
            return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
        }


        const command = new GetObjectCommand({
            Bucket: backup.s3Bucket,
            Key: backup.s3Key,
        })

        const s3Response = await s3.send(command)

        if (!s3Response.Body) {
            return NextResponse.json({ success: false, message: 'File not found' })
        }

        const stream = s3Response.Body as ReadableStream

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'application/sql',
                'Content-Disposition': `attachment; filename="${backup.fileName}"`,
                'Content-Length': backup.fileSize.toString(),
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        })

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: 'Failed to download file',
        })
    }
}

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
        const { projectId } = body

        const createStatus = await CreateBuckup({ projectId, userId })

        return NextResponse.json(createStatus)


    } catch (error: any) {
        const logs = `Backup failed: Unable to connect to your database. Please check your database credentials and network settings. (${error.message})`;

        return NextResponse.json({
            success: true,
            status: "fail",
            message: logs,
        })
    }
}

async function DELETE(req: NextRequest) {
    try {
        const session = await auth()
        const userId = session?.user.id

        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' })
        }

        const { searchParams } = new URL(req.url)
        const backupId = searchParams.get('backupId')

        if (!backupId) {
            return NextResponse.json({ success: false, message: 'Backup ID is required' })
        }

        const backup = await db.backup.findUnique({
            where: { id: backupId },
        })

        if (!backup) {
            return NextResponse.json({ success: false, message: 'Backup not found' })
        }

        if (backup.userId !== userId) {
            return NextResponse.json({ success: false, message: 'Access denied' })
        }

        await s3.send(new DeleteObjectCommand({
            Bucket: backup.s3Bucket,
            Key: backup.s3Key,
        }))

        await db.backup.delete({
            where: { id: backupId },
        })

        return NextResponse.json({
            success: true,
            message: 'Backup deleted successfully',
        })

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: 'Internal server error',
        })
    }
}

export { GET, POST, DELETE }