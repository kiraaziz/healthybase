"use client"
import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter } from 'next/navigation'
import Logo from './Logo'

export default function OnboardingPopup() {

    const [open, setOpen] = useState(true)
    const router = useRouter()
    const pathName = usePathname()

    useEffect(() => {
        if (!open) {
            router.replace(`${pathName}?openSettings=true`)
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md rounded-3xl bg-gradient-to-tr shadow-none from-primary border-none backdrop-blur-3xl to-background via-background">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className='relative flex items-center justify-center h-44 backdrop-blur-3xl'>
                        <div className='absolute scale-[2.5] blur opacity-50'>
                            <Logo />
                        </div>
                        <div className='absolute scale-[2.5]'>
                            <Logo />
                        </div>
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl">
                            Welcome to Healthy Base!
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Secure automated backups for your PostgreSQL databases.
                            Let's get you set up with your first backup configuration.
                        </DialogDescription>
                    </DialogHeader>

                    <Button
                        onClick={() => setOpen(false)}
                        className="w-full mt-2 text-white rounded-full bg-foreground backdrop-blur-3xl hover:bg-foreground"
                        size="lg">
                        Get Started
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}