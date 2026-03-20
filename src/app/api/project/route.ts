import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { NextResponse, type NextRequest } from "next/server";

const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { projectName } = body;

        if (!projectName || typeof projectName !== "string" || !projectName.trim()) {
            return NextResponse.json({
                success: false,
                message: "Project name is required."
            });
        }

        const { user } = await auth() as any;

        const project = await db.project.create({
            data: {
                name: projectName,
                userId: user.id
            }
        });

        return NextResponse.json({
            success: true,
            message: "Project created successfully.",
            data: project
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "An error occurred"
        });
    }
}

export { POST }