import React from 'react'
import Loading from './Loading';

interface LoadingDatosProps {
    loading: boolean;
    mensaje: string;
}

export default function LoadingDatos({ loading, mensaje }: LoadingDatosProps) {
    return (
        <>
            {loading ? (                
                <Loading />
            ) : (
                <div className='fixed inset-0 backdrop-blur-md flex items-center justify-center z-50'>
                    <div className='bg-yellow-400 p-6 rounded-xl shadow-xl text-center flex flex-col items-center'>

                        <h3 className="text-xl font-bold text-green-600">{mensaje}</h3>
                        <p className="mt-2 text-gray-600">Redirigiendo al inicio...</p>
                    </div>
                </div>
            )}
        </>
    )
}
