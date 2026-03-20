"use client"
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {  LogOut, Settings2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link";

export default function UserAvatar({ userData }: any) {

    const user = userData
    return (
        <div className="flex items-center justify-center gap-3">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button>
                        <Avatar className="h-9 w-9">
                            <AvatarImage className="object-cover" src={user?.image} />
                            <AvatarFallback>
                                {user?.name
                                    ? user.name
                                        .split(" ")
                                        .map((w: any) => w[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase()
                                    : "US"}
                            </AvatarFallback>
                        </Avatar>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[220px]">
                    <div className="flex flex-col items-center px-4 py-3">
                        <Avatar className="h-12 w-12 mb-2">
                            <AvatarImage className="object-cover" src={user?.image} />
                            <AvatarFallback>
                                {user?.name
                                    ? user.name
                                        .split(" ")
                                        .map((w: any) => w[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase()
                                    : "US"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="font-medium text-base truncate w-full text-center">
                            {user?.name || "User"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate w-full text-center">
                            {user?.email || "No email"}
                        </div>
                    </div>
                    <DropdownMenuItem
                        className="flex items-center gap-2 text-foreground hover:!text-foreground hover:bg-foreground/20 ease-in-out duration-200 cursor-pointer">
                        <Link href="/app" className="flex gap-2 items-center">
                            <Settings2 className="text-foreground" size={16} />
                            Dashboard
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="flex items-center gap-2 text-destructive hover:!text-destructive hover:bg-destructive/20 ease-in-out duration-200 cursor-pointer"
                        onClick={() => signOut()}
                    >
                        <LogOut className="text-destructive" size={16} />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
