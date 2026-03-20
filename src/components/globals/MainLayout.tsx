"use client"
import Logo from '@/components/globals/Logo'
import type { Project } from '@prisma/client'
import UserAvatar from './UserAvatar'
import ProjectManger from '../project/ProjectManger'
import Link from 'next/link'

export default function MainLayout({ children, projects, user }: { children: React.ReactNode, projects: Project[], user: any}) {
    return (
        <div className="w-[100svw] h-[100svh] relative overflow-x-hidden">
            <div className='z-20 sticky top-0 w-full bg-black'>
                <div className='p-7 bg-primary/20'>
                    <div className='flex items-center justify-between max-w-4xl mx-auto'>
                        <div className='flex items-center justify-center gap-3'>
                            <Link href="/">
                                <Logo className="" />
                            </Link>
                            <p className='text-background/20 text-2xl font-medium'>/</p>
                            <ProjectManger projects={projects} />
                        </div>
                        <UserAvatar userData={user}/>
                    </div>
                </div>
            </div>
            <div className='w-full mx-auto '>
                {children}
            </div>
        </div>
    )
}
