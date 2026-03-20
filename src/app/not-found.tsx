import Server from '@/components/Images/Server'
import Loader from "@/components/globals/Loader"
import Logo from "@/components/globals/Logo"
import OuterLayout from "@/components/globals/OuterLayout"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Suspense } from "react"

export const metadata = {
    title: '404 - Healthy Base',
}

export default function layout({ children }: { children: React.ReactNode }) {

    return (
        <Suspense fallback={(
            <div className="w-full h-[100svh] relative">
                <div className='sticky top-0 w-full bg-primary-foreground p-7'>
                    <div className='flex items-center justify-between max-w-4xl mx-auto'>
                        <div className='flex items-center justify-center gap-3'>
                            <Logo className="" />
                            <p className='text-background/20 text-2xl font-medium'>/</p>
                            <Button variant="ghost" className="animate-pulse hover:bg-primary/20 hover:text-primary bg-primary/10 text-primary border border-primary/20 min-w-36 flex items-center justify-between rounded-lg" />
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <button className="animate-pulse text-background/60 h-9 w-9 rounded-full bg-muted/10 border border-background/10 flex items-center justify-center" />
                            <button className="animate-pulse text-background/60 h-9 w-9 rounded-full bg-muted/10 border border-background/10 flex items-center justify-center" />
                        </div>
                    </div>
                </div>
                <div className='w-full mx-auto flex items-center justify-center min-h-[50svh]'>
                    <Loader />
                </div>
            </div>
        )}>
            <OuterLayout>
                <div className="flex items-center justify-center w-full min-h-[90svh]">
                    <div>
                        <div className='mx-auto w-64 p-6 flex flex-col gap-4 items-center justify-center text-center' >
                            <Server />
                            <h1 className='text-5xl'>404</h1>
                            <h1 className='text-lg'>Page Not found</h1>
                        </div>
                        <div className="mb-4 w-full flex items-center justify-center gap-2">
                            <Link href="/app">
                                <Button className='text-white rounded-full'>
                                    Go to dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </OuterLayout>
        </Suspense>
    )
}
