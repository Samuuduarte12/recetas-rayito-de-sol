import Image from 'next/image'
import React from 'react'

export default function Loading() {
    return (
        <div className="h-[600px] w-full flex flex-col justify-center items-center">
            <Image src="/rayito-de-sol.png" alt="" width={200}  height={200}/>
            <span className="loader "></span>
        </div>
    )
}
