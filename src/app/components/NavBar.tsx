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
            label: "Inicio",
        },
        {
            id: 2,
            href: "/agregar",
            icon: TiPlusOutline,
            activeIcon: TiPlus,
            label: "Agregar",
        },        
    ];
    
    return (
        <nav className="fixed bottom-0 left-0 right-0 w-full bg-white border-t-2 border-[#e2d1a3] shadow-2xl z-50 safe-area-bottom">
            <div className="flex justify-around items-center h-16 ">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    const Icon = isActive ? tab.activeIcon : tab.icon;

                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={`flex flex-col justify-center items-center transition-all w-1/2 h-full ${
                                isActive 
                                    ? "bg-[#f6d748] text-gray-800 shadow-md" 
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <Icon className={`${isActive ? "text-2xl" : "text-xl"} transition-transform ${isActive ? "scale-110" : ""}`} />
                            <span className={`text-xs font-semibold mt-0.5 ${isActive ? "text-gray-800" : "text-gray-500"}`}>
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    )
}
