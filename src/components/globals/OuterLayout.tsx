import Logo from './Logo'
import Link from 'next/link'

export default function OuterLayout({ children }: any) {
    return (
        <div className="w-full h-[100svh] relative">
            <div className='sticky top-0 w-full bg-primary-foreground h-20 px-7 z-20'>
                <div className='flex items-center justify-between max-w-4xl mx-auto h-full'>
                    <div className='flex items-center justify-center gap-3'>
                        <Link href="/" className="flex items-center justify-center gap-2">
                            <Logo />
                            <h1 className="font-brand text-base font-semibold text-white/80 ml-2 translate-y-0.5">Healthy Base</h1>
                        </Link>
                    </div>
                </div>
            </div>
            {children}
        </div>
    )
}
