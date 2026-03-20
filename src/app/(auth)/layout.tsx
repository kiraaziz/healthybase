import Loader from "@/components/globals/Loader"
import Logo from "@/components/globals/Logo"
import OuterLayout from "@/components/globals/OuterLayout"
import { Button } from "@/components/ui/button"
import { auth } from "@/server/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export const metadata = {
  title: 'Signin - Healthy Base',
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
      <Renderer>
        {children}
      </Renderer>
    </Suspense>
  )
}
async function Renderer({ children }: { children: React.ReactNode }) {

  const session: any = await auth()
  if (session?.user) return redirect("/app")

  return <OuterLayout>
    <div className='w-full mx-auto flex items-center justify-center h-[calc(100svh_-_5rem)]'>
      <div className="w-full h-full overflow-hidden hidden lg:flex items-center justify-center p-16 relative">
        <div
          className="absolute h-[90%] w-[90%] bg-primary/20 shadow-2xs transition-transform duration-500 ease-in-out translate-x-10"
          style={{ transform: 'perspective(800px) rotateY(30deg) rotateX(12deg)' }}
        />
        <div className="absolute">
          <img src="/svg/login-image.svg" className="h-92" />
          <p className="max-w-md text-center text-foreground/70">
            By clicking continue, you agree to our{" "}
            <Link href="/#" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/#" className="underline hover:text-foreground">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
      <div className="w-full h-full py-10">
        {children}
        <p className="block lg:hidden max-w-md text-center text-foreground/70 mx-auto mt-10 px-5">
          By clicking continue, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>.
        </p>
      </div>
    </div>
  </OuterLayout>
}