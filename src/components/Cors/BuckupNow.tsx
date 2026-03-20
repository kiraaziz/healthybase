"use client"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { ArrowRight, Download, RotateCcw, Save } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Question from "../Images/Question"
import Clock from "../Images/Clock"
import Success from "../Images/Success"
import ErrorUi from "../Images/Error"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function BuckupNow({ projectId }: { projectId: string }) {

  type Status = "IDLE" | "PENDING" | "FINISH" | "ERROR"
  const [status, setStatus] = useState<Status>("IDLE")
  const [countdown, setCountdown] = useState<number>(0)
  const [error, setError] = useState("")
  const [bucketId, setBucketId] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)


  const router = useRouter()

  useEffect(() => {
    if (status === "PENDING") {
      setCountdown(0)
      const timer = setInterval(() => {
        setCountdown((prev) => prev + 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [status])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0")
    const s = (seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  const handleBuckup = async () => {
    setStatus("PENDING")
    setError("")
    try {

      const req = await fetch(`/api/cors`, {
        method: "POST",
        body: JSON.stringify({ projectId }),
        headers: {
          "Content-Type": "application/json"
        },
        cache: "no-cache"
      })

      if (!req.ok) {
        throw new Error(`HTTP error! Status: ${req.status}`);
      }

      const res: any = await req.json()

      if (res.status === "fail") {
        toast.error(`🥲 ${res.message}`)
        setStatus("ERROR")
        setError(res.message)
      } else {
        toast.success(`✨🎉 ${res.message}`)
        setBucketId(res?.backupRecord?.id)
        setStatus("FINISH")
      }

    } catch (error: any) {
      setStatus("ERROR")
      toast.error(`🥲 ${error.message}`)
      setError(error.message)
    }

    router.refresh()
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const res = await fetch(`/api/cors?backupId=${bucketId}`)
      if (!res.ok) throw new Error("Failed to download backup")
      const blob = await res.blob()
      const disposition = res.headers.get("Content-Disposition")
      let filename: string = "backup.sql"
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
    } catch (err) {
      toast.error("Failed to download backup")
    } finally {
      setIsDownloading(false)
    }
  }


  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="default" className="text-white">
          <Save size={20} className="mr-2" />
          {status === "PENDING" ? `Backup ${formatTime(countdown)}` : "Backup Now"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        {status === "IDLE" && <>
          <AlertDialogHeader>
            <AlertDialogDescription>
              <div className="mx-auto w-52 p-4 flex items-center justify-center" >
                <Question />
              </div>
              <h1 className="text-lg font-medium">Are you sure?</h1>
              Are you sure you want to backup your database? It may take time and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full flex">
            <AlertDialogCancel className="flex-1">
              Cancel
            </AlertDialogCancel>
            <Button onClick={handleBuckup} className="flex-1 text-white">
              Continue
              <ArrowRight size={20} />
            </Button>
          </AlertDialogFooter>
        </>}
        {status === "PENDING" && <>
          <AlertDialogHeader>
            <AlertDialogDescription>
              <div className="mx-auto w-52 p-4 flex items-center justify-center" >
                <Clock />
              </div>
              <h1 className="text-lg font-medium">Backup in Progress <span className="text-white bg-primary px-1.5 text-sm rounded-full">{formatTime(countdown)}</span></h1>
              <p>Your backup is running.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full">
            <AlertDialogCancel className="w-full">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </>}
        {status === "FINISH" && <>
          <AlertDialogHeader>
            <AlertDialogDescription>
              <div className="mx-auto w-52 p-4 flex items-center justify-center">
                <Success />
              </div>
              <h1 className="text-lg font-medium">Congratulations, your backup is ready</h1>
              Your backup is complete and ready to download.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full flex">
            <AlertDialogCancel
              onClick={() => setTimeout(() => setStatus("IDLE"), 300)}
              className="flex-1"
            >
              Close
            </AlertDialogCancel>
            {bucketId && <Button disabled={isDownloading} onClick={handleDownload} className="flex-1 text-white">
              Download
              <Download size={20} />
            </Button>}
          </AlertDialogFooter>
        </>}
        {status === "ERROR" && <>
          <AlertDialogHeader>
            <AlertDialogDescription>
              <div className="mx-auto w-52 p-4 flex items-center justify-center">
                <ErrorUi />
              </div>
              <h1 className="text-lg font-medium">Error Occurred</h1>
              <p className="text-destructive p-4 bg-destructive/10 rounded-lg border border-destructive/40">{error || "An error occurred during the backup process. Please try again."}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full flex">
            <AlertDialogCancel className="flex-1">
              Close
            </AlertDialogCancel>
            <Button onClick={handleBuckup} className="flex-1 text-white">
              <RotateCcw size={20} />
              Retry
            </Button>
          </AlertDialogFooter>
        </>}
      </AlertDialogContent>
    </AlertDialog>
  )
}
