"use client"
import LoadingButton from '@/components/globals/LoadingButton'
import Logo from '@/components/globals/Logo'
import { Input } from '@/components/ui/input'
import { useFetch } from '@/hooks/useFetch'
import { setState } from '@/hooks/useState'
import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export default function page() {

    const router = useRouter()
    const [user, setUser] = useState({
        email: "",
    })

    const [isVerify, useVerify] = useFetch("/auth/user", "PUT", (res) => {
        if (res.success) {
            const currentTime = new Date().toISOString()
            localStorage.setItem('currentTime', currentTime)
            router.push(`/otp?email=${user.email.toLowerCase()}`)
        } else if (res.message.includes("Email not found")) {
            router.push(`/register`)
        }
    })

    return (
        <form onSubmit={(e) => e.preventDefault()} className=' max-w-5xl p-4 mx-auto  flex items-center flex-col lg:pt-[20svh] text-center'>
            <div className='scale-150 m-2'>
                <Logo />
            </div>
            <h1 className='mt-5 text-2xl font-bold'>Login to your account</h1>
            <p className='text-sm  text-foreground/60 mb-3'>Login to your account to access all the features <br />and functionality.</p>
            <Input autoFocus type='email' className='max-w-sm' placeholder='email@something.com' value={user.email} onChange={(e) => setState(setUser, "email", e.target.value)} />
            <LoadingButton type='submit' className='max-w-sm w-full mt-2 lg:hover:gap-4 ease-in-out duration-200' isLoading={isVerify} onClick={async () => await useVerify(user)}>
                Continuer
                <ChevronRight size={20} />
            </LoadingButton>
            <div className='mt-4 text-foreground/60 text-sm w-full flex items-center justify-center max-w-sm'>
                <p>Don't have an account?
                    <a className='underline hover:text-foreground mx-2' href="/register">
                        Create an account
                    </a>
                </p>
            </div>
        </form>
    )
}
