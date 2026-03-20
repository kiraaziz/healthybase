import Loader from '@/components/globals/Loader'
import Logo from '@/components/globals/Logo'
import { Button } from '@/components/ui/button'
import React from 'react'

export default function loader() {
  return (
    <div className="w-full h-[100svh] relative bg-[#040B08]">
      <div className='sticky top-0 w-full p-7'>
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
  )
}
