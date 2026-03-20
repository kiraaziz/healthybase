import cron from "node-cron"
import dotenv from "dotenv"

dotenv.config()

const appUrl = process.env.APP_URL
if (!appUrl) {
    throw new Error("APP_URL is not defined in the environment variables")
}

const jobKey = process.env.JOB_KEY
if (!jobKey) {
    throw new Error("JOB_KEY is not defined in the environment variables")
}

const SCHEDULE_INTERVAL = "0 */1 * * * *"

cron.schedule(SCHEDULE_INTERVAL, async () => {
    console.log("[CRON] Running hourly backup job...")
    try {
        const res = await fetch(`${appUrl}/api/create-backup`, {
            headers: {
                'Authorization': `Bearer ${jobKey}`,
            },
        })
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }
        console.log("[CRON] Backup done:", res.status, res.statusText || "")
    } catch (error) {
        console.error("[CRON] Backup failed:", error)
    }
})
