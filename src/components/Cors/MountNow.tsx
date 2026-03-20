"use client"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { ArrowRight, RotateCcw, Database, AlertTriangle } from "lucide-react"
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

export default function MountNow({ backupId, color, oldBase, currentBase }: { backupId: string, color: any, currentBase: any, oldBase: any }) {

  type Status = "IDLE" | "PENDING" | "FINISH" | "ERROR"
  const [status, setStatus] = useState<Status>("IDLE")
  const [countdown, setCountdown] = useState<number>(0)
  const [error, setError] = useState("")

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

  const handleMount = async () => {
    setStatus("PENDING")
    setError("")
    try {

      const req = await fetch(`/api/cors/mount`, {
        method: "POST",
        body: JSON.stringify({ backupId }),
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
        setStatus("FINISH")
      }

    } catch (error: any) {
      setStatus("ERROR")
      toast.error(`🥲 ${error.message}`)
      setError(error.message)
    }

    router.refresh()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="default"
          className="text-white rounded-full opacity-90 hover:opacity-100"
          disabled={status === "PENDING"}
          style={{ backgroundColor: color }}
        >
          <Database size={20} className="mr-2" />
          {status === "PENDING" ? `Restoring ${formatTime(countdown)}` : "Restore Backup"}
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
              Are you sure you want to restore this backup to your database? This will replace all current data and cannot be undone.

              <div className="mb-4 mt-2">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">
                        Warning: Database Restore Operation
                      </h3>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                        All data from this backup will be mounted to the <span className="font-semibold">current database</span>, regardless of the backup's source database.
                      </p>
                      <div className="bg-white dark:bg-gray-900/50 rounded border border-amber-200 dark:border-amber-800/50 p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-600 dark:text-amber-500 font-medium">Source DB:</span>
                          <span className="font-mono text-foreground/80">{oldBase}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-600 dark:text-amber-500 font-medium">Target DB:</span>
                          <span className="font-mono text-foreground/80">{currentBase}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full flex">
            <AlertDialogCancel className="flex-1">
              Cancel
            </AlertDialogCancel>
            <Button onClick={handleMount} className="flex-1 text-white">
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
              <h1 className="text-lg font-medium">Restore in Progress <span className="text-white bg-primary px-1.5 text-sm rounded-full">{formatTime(countdown)}</span></h1>
              <p>Your database is being restored. Please wait...</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full">
            <AlertDialogCancel className="w-full" disabled>
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
              <h1 className="text-lg font-medium">Database Restored Successfully</h1>
              Your database has been restored from the backup successfully.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full flex">
            <AlertDialogCancel
              onClick={() => setTimeout(() => setStatus("IDLE"), 300)}
              className="w-full"
            >
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </>}
        {status === "ERROR" && <>
          <AlertDialogHeader>
            <AlertDialogDescription>
              <div className="mx-auto w-52 p-4 flex items-center justify-center">
                <ErrorUi />
              </div>
              <h1 className="text-lg font-medium">Restore Failed</h1>
              <p className="text-destructive p-4 bg-destructive/10 rounded-lg border border-destructive/40">{error || "An error occurred during the restore process. Please try again."}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full flex">
            <AlertDialogCancel
              onClick={() => setTimeout(() => setStatus("IDLE"), 300)}
              className="flex-1"
            >
              Close
            </AlertDialogCancel>
            <Button onClick={handleMount} className="flex-1 text-white">
              <RotateCcw size={20} />
              Retry
            </Button>
          </AlertDialogFooter>
        </>}
      </AlertDialogContent>
    </AlertDialog>
  )
}