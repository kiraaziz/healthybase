import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "../ui/button"
import type { Project } from '@prisma/client'
import { usePathname, useRouter } from "next/navigation"
import { CheckCheck, ChevronsUpDown, Loader2, PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "../ui/input"
import { useFetch } from "@/hooks/useFetch"

export default function ProjectManger({ projects }: { projects: Project[] }) {

  const [openCreateProject, setOpenCreateProject] = useState(false)
  const router = useRouter()
  const pathName = usePathname()
  const selectedProject = projects.find((project) => project.id === pathName.split("/")[2])
  const currentProject = selectedProject

  useEffect(() => {
    if (!selectedProject) {
      router.push(`/app/${projects[0]?.id}`)
    }
  }, [projects])

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="hover:bg-primary/20 hover:text-primary bg-primary/10 text-primary border border-primary/20 min-w-36 flex items-center justify-between rounded-lg">
            <p>{currentProject?.name}</p>
            <ChevronsUpDown size={20} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56 mt-2">
          <DropdownMenuItem onClick={() => setOpenCreateProject(true)}>
            <PlusIcon size={20} />
            New Project
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              className={cn(currentProject?.id === project.id && "bg-muted/80")}
              onClick={() => router.push(`/app/${project.id}`)}
            >
              <p>{project.name}</p>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateProject open={openCreateProject} setOpen={setOpenCreateProject} />
    </div>
  )
}


const CreateProject = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {

  const router = useRouter()
  const [name, setName] = useState("")
  const [pending, createBase] = useFetch("/project", "POST", async (e) => {
    if (e.data) {
      setOpen(false)
      setName("")
      router.push(`/app/${e.data.id}?openSettings=true`)
    }
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect your database</DialogTitle>
          <DialogDescription>
            <form onSubmit={(e) => {
              e.preventDefault()
            }}>
              <Input
                placeholder="Project Name"
                className="placeholder:text-foreground/60"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <div className="flex items-center justify-end">
                <Button disabled={pending} type="submit" onClick={async () => await createBase({ projectName: name })} className="mt-2">
                  {pending ? <Loader2 className="animate-spin" size={20} /> : <CheckCheck size={20} />}
                  Create
                </Button>
              </div>
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}