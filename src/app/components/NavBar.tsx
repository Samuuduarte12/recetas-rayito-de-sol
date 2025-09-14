"use client"
import React from 'react'
import { usePathname } from 'next/navigation';
import { IoHomeOutline, IoHomeSharp } from "react-icons/io5";
import { TiPlusOutline, TiPlus } from "react-icons/ti";
import Link from 'next/link'

export default function NavBar() {
    const pathname = usePathname();

    const tabs = [
        {
            id: 1,
            href: "/",
            icon: IoHomeOutline,
            activeIcon: IoHomeSharp,
        },
        {
            id: 2,
            href: "/agregar",
            icon: TiPlusOutline,
            activeIcon: TiPlus,
        },
    ];
    return (
        <nav className="fixed bottom-0 left-0 w-full bg-[#f6d748] border-t border-black shadow-lg">
            <div className="flex justify-around items-center h-12">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    const Icon = isActive ? tab.activeIcon : tab.icon;

                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={`flex justify-center items-center transition-colors w-1/2 h-full ${isActive ? "text-white text-4xl" : "text-gray-500 text-4xl"}`}
                        >
                            <Icon />
                        </Link>
                    );
                })}
            </div>
        </nav>

    )
}
