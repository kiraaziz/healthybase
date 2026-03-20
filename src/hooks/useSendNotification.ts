import { db } from "@/server/db"
import { useSendEmail } from "./useSendEmail"
import { sendMessage } from "@/server/email"

export async function useSendNotification({ userId, title, text, image, link }: any) {
    try {
        const user = await db.user.findUnique({
            where: { id: userId }
        })

        if (user?.email) {
            return useSendEmail(
                user.email,
                title,
                sendMessage(title, text, link)
            )
        }
    } catch (error) {
        console.error("useSendNotification error:", error)
        return null
    }
}