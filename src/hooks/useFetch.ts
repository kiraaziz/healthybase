import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

type FetchRequest = [boolean, (data: any, showInfo?: boolean) => Promise<void>]
type FetchResponse = {
    success: boolean
    message: string
    data: any
}

export function useFetch(
    path: string,
    method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH",
    action: (data: any) => void = () => {},
    canRefrech: boolean = true,
    showToaster: boolean = true
): FetchRequest {

    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const Run = async (data: any, showInfo: boolean = true): Promise<void> => {

        startTransition(async () => {
            try {

                const req = await fetch(`/api${path}`, {
                    method: method,
                    body: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json"
                    },
                    cache: "no-cache"
                })

                if (!req.ok) {
                    throw new Error(`HTTP error! Status: ${req.status}`);
                }

                const res: FetchResponse = await req.json()


                if (!res.success) {
                    showInfo && showToaster && toast.error(`🥲 ${res.message}`)
                } else {
                    showInfo && showToaster && toast.success(`✨🎉 ${res.message}`)
                    action(res)
                    if (canRefrech) {
                        router.refresh()
                    }
                }

            } catch (error: any) {
                console.error(error)
                showToaster && toast.error(`🥲 ${error.message}`)
            }
        })
    }

    return [isPending, Run]
}

