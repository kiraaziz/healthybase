"use client"
import React, { useState } from "react"
import { MoreHorizontal, Trash2, Download, Loader } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useFetch } from "@/hooks/useFetch"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function BucketActions({ bucketId, showDownload }: { bucketId: string, showDownload: boolean }) {

    const router = useRouter()
    const [isDeleting, deleteBackup] = useFetch(
        `/cors?backupId=${bucketId}`,
        "DELETE"
    )

    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownload = async () => {
        setIsDownloading(true)
        try {
            const res = await fetch(`/api/cors?backupId=${bucketId}`)
            console.log(res.headers.get("Content-Type"))
            if (res.headers.get("Content-Type")?.includes("application/json")) {
                const data = await res.json()
                if (!data.success) {
                    toast.error("🥲 " + data.message || "Failed to download backup")
                    return
                }
            } else {
                const blob = await res.blob()
                const disposition = res.headers.get("Content-Disposition")

                let filename = "backup.sql"
                if (disposition) {
                    const match = disposition.match(/filename="(.+)"/)
                    if (match && match[1]) filename = match[1]
                    else filename = `${bucketId}.sql`
                } else {
                    filename = `${bucketId}.sql`
                }
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = filename
                document.body.appendChild(a)
                a.click()

                setTimeout(() => {
                    window.URL.revokeObjectURL(url)
                    a.remove()
                }, 100)

                toast.success("✨🎉 Download started successfully")
                router.refresh()
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to download backup")
        } finally {
            setIsDownloading(false)
        }
    }

    if (isDownloading || isDeleting) {
        return (
            <div className="flex items-center justify-center w-10 h-10">
                <Loader size={20} className="animate-spin" />
            </div>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                    <MoreHorizontal size={18} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {showDownload && <DropdownMenuItem
                    onClick={handleDownload}
                    className="flex items-center gap-2"
                >
                    <Download size={16} className="mr-2" />
                    Download
                </DropdownMenuItem>}
                <DropdownMenuItem
                    onClick={() => deleteBackup({}, true)}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                    <Trash2 size={16} className="mr-2 !text-destructive" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
