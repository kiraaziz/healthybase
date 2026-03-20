"use client"
import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings, Database, Loader2, CheckCircle, Trash2, Plus, Edit2, Link2, CheckCheck } from "lucide-react"
import { useFetch } from "@/hooks/useFetch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// 10 good color options for ProjectSetting.color
const PROJECT_SETTING_COLORS = [
  "#72e3ad", // default green
  "#5b9cf6", // blue
  "#f6c85b", // yellow
  "#f67280", // pink/red
  "#a17cf6", // purple
  "#f6a35b", // orange
  "#5bf6c8", // teal
  "#f65b9c", // magenta
  "#7cf65b", // lime
  "#5bcef6", // cyan
]

function parsePostgresUrl(url: string) {
  try {
    if (!url.startsWith("postgres://")) return null
    const withoutProtocol = url.replace("postgres://", "")
    const [userinfo, hostAndDb]: any = withoutProtocol.split("@")
    if (!hostAndDb) return null
    const [user, ...passwordParts] = userinfo.split(":")
    const password = passwordParts.join(":")
    const [hostPort, ...dbParts] = hostAndDb.split("/")
    const dbName = dbParts.join("/")
    const [host, port] = hostPort.split(":")
    return {
      dbUser: decodeURIComponent(user || ""),
      dbPassword: decodeURIComponent(password || ""),
      dbHost: decodeURIComponent(host || ""),
      dbPort: port ? parseInt(port) : 5432,
      dbName: decodeURIComponent(dbName || ""),
    }
  } catch (e) {
    return null
  }
}

function ProjectSettingsList({
  project,
  setTrigger,
}: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-sm">All Settings</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setTrigger({
            dbHost: "localhost",
            dbPort: 5432,
            dbUser: "postgres",
            dbPassword: "",
            dbName: "postgres",
            color: PROJECT_SETTING_COLORS[0], // default color
            cronFrequency: "none",
          })}
          className="gap-1"
        >
          <Plus size={16} /> New
        </Button>
      </div>
      <div className="border rounded-lg bg-muted/50 divide-y">
        {project.settings.length === 0 && (
          <div className="p-4 text-muted-foreground text-sm">No settings yet.</div>
        )}
        {project.settings.map((setting: any) => (
          <ProjectRecord
            key={setting.id}
            setting={setting}
            projectId={project.id}
            isActive={setting.id === project.currentSettingId}
            setTrigger={setTrigger}
          />
        ))}
      </div>
    </div>
  )
}

const ProjectRecord = ({ setting, projectId, isActive, setTrigger }: any) => {

  const [setDefaultLoading, setDefault] = useFetch("/settings", "PUT")
  const [deleteLoading, deleteSetting] = useFetch("/settings", "DELETE")

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${isActive && "bg-primary/20"} bg-muted`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: setting.color || PROJECT_SETTING_COLORS[0] }} />
          <span className="font-mono text-xs text-muted-foreground">
            {setting.dbUser}@{setting.dbHost}:{setting.dbPort}/{setting.dbName}
          </span>
        </div>
      </div>
      {(deleteLoading || setDefaultLoading) ?
        <Button
          size="icon"
          variant="ghost"
          title="Actions"
          disabled={true}
          className="focus:outline-none"
        >
          <Loader2 className="animate-spin" size={16} />
        </Button>
        : <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              title="Actions"
              className="focus:outline-none"
            >
              <Settings size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={async (e) => {
                e.preventDefault();
                if (!isActive) {
                  await setDefault({ id: setting.id, projectId: projectId });
                }
              }}
              disabled={setDefaultLoading || isActive}
              className="flex items-center gap-2"
            >
              <CheckCheck size={16} />
              <span>{isActive ? "Default" : "Set as default"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setTrigger(setting);
              }}
              className="flex items-center gap-2"
            >
              <Edit2 size={16} />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={async (e) => {
                e.preventDefault();
                await deleteSetting({ id: setting.id, projectId: projectId });
              }}
              disabled={deleteLoading || isActive}
              className="flex items-center gap-2 text-destructive hover:!text-destructive hover:!bg-destructive/20 transition-all ease-in-out duration-200"
            >
              <Trash2 size={16} className="text-destructive" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>}
    </div>
  )
}

function ProjectSettingsForm({
  formData,
  setTrigger,
  projectId,
}: any) {
  const [pending, setSettings] = useFetch(
    "/settings",
    "POST",
    (res) => {
      setTrigger(null)
    }
  )

  const [urlInput, setUrlInput] = useState("")
  const [parsedData, setParsedData] = useState<any>(null)

  function onInputChange(field: string, value: any) {
    setTrigger((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  }

  // Color selection logic
  function onColorChange(color: string) {
    setTrigger((prev: any) => ({
      ...prev,
      color,
    }));
  }

  async function handleApplyUrl() {

    try {
      const parsed = parsePostgresUrl(urlInput)
      if (parsed) {
        setParsedData(parsed)
        toast.success("PostgreSQL URL imported successfully.")

        setTrigger((prev: any) => ({
          ...prev,
          ...parsed,
        }))
      } else {
        setParsedData(null)
        toast.error("Invalid PostgreSQL URL")
      }
    } catch (err: any) {
      setParsedData(null)
      toast.error("Invalid PostgreSQL URL")
    }
  }

  return (
    <div className="space-y-2">
      <div className="space-y-2 bg-muted/20 p-2 rounded-lg border">
        <label className="text-sm font-medium flex items-center gap-1">
          <Link2 size={16} /> Import From PostgreSQL URL
        </label>
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="postgres://user:password@host:5432/dbname"
            autoComplete="off"
          />
          <button
            type="button"
            className="px-6 py-1 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
            onClick={handleApplyUrl}
            disabled={!urlInput}
          >
            Import
          </button>
        </div>
        <div className="text-xs text-muted-foreground">
          Paste your full PostgreSQL connection URL to auto-fill the fields below.
        </div>
      </div>

      {/* Color Picker */}
      <div className="flex items-center gap-3 mt-4">
        <label className="text-sm font-medium">Color</label>
        <div className="flex gap-2">
          {PROJECT_SETTING_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition
                ${formData.color === color ? "border-primary ring-2 ring-primary" : "border-muted"}
                hover:scale-110`}
              style={{ background: color }}
              aria-label={`Select color ${color}`}
              onClick={() => onColorChange(color)}
            >
              {formData.color === color && (
                <CheckCircle size={16} className="text-primary-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <label className="text-sm font-medium">Cron Frequency</label>
        <div className="flex">
          {["none", "hourly", "daily"].map((c) => (
            <button className={`${c === formData.cronFrequency && "bg-primary/10 border-primary border text-primary-foreground"} border px-3 py-1 bg-muted/70 text-foreground/80`} onClick={() => onInputChange("cronFrequency", c)}>
              <h1 className="capitalize">{c}</h1>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-7">
        <div className="space-y-2">
          <label className="text-sm font-medium">Host</label>
          <Input
            value={formData.dbHost}
            onChange={(e) => onInputChange("dbHost", e.target.value)}
            placeholder="localhost"
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Port</label>
          <Input
            type="number"
            value={formData.dbPort}
            onChange={(e) => onInputChange("dbPort", parseInt(e.target.value) || 5432)}
            placeholder="5432"
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Username</label>
          <Input
            value={formData.dbUser}
            onChange={(e) => onInputChange("dbUser", e.target.value)}
            placeholder="postgres"
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            value={formData.dbPassword}
            onChange={(e) => onInputChange("dbPassword", e.target.value)}
            placeholder="Enter password"
            autoComplete="off"
          />
        </div>
        <div className="space-y-2 col-span-full">
          <label className="text-sm font-medium">Database Name</label>
          <Input
            value={formData.dbName}
            onChange={(e) => onInputChange("dbName", e.target.value)}
            placeholder="postgres"
            autoComplete="off"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => {
            setTrigger(null)
            setUrlInput("")
          }}
        >
          Reset
        </Button>
        <Button
          onClick={async () => {
            await setSettings({
              ...formData,
              projectId,
              id: formData.id,
            })
          }}
          disabled={pending}
          className="min-w-24"
        >
          {pending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <CheckCircle size={16} />
          )}
          {formData.id ? "Update" : "Add"}
        </Button>
      </div>
    </div>
  )
}

export default function ProjectSettings({ project, isOnBorading }: any) {
  const [trigger, setTrigger] = useState(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (searchParams?.get("openSettings") === "true" && isOnBorading) {
      setOpen(true)
      const params = new URLSearchParams(searchParams.toString())
      params.delete("openSettings")
      const newQuery = params.toString()
      router.replace(`${pathname}${newQuery ? "?" + newQuery : ""}`)
    }
  }, [searchParams, pathname, router])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Settings size={20} />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database size={20} />
            Project Database Settings
          </DialogTitle>
          <DialogDescription>
            Manage all your database connection settings for this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {!trigger ? (
            <ProjectSettingsList
              project={project}
              setTrigger={(e: any) => setTrigger({ cronFrequency: project.cronFrequency, ...e })}
            />
          ) : (
            <ProjectSettingsForm
              projectId={project.id}
              formData={trigger}
              setTrigger={setTrigger}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
