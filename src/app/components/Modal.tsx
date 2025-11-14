"use client";

import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    type?: 'success' | 'error' | 'info';
    showCloseButton?: boolean;
    autoClose?: boolean;
    autoCloseDelay?: number;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    message,
    type = 'success',
    showCloseButton = true,
    autoClose = false,
    autoCloseDelay = 3000,
}: ModalProps) {
    // Cerrar automáticamente si autoClose está activado
    useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, autoCloseDelay, onClose]);

    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Cerrar con Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const typeStyles = {
        success: {
            icon: '✅',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-500',
            iconBg: 'bg-green-100',
            titleColor: 'text-green-800',
            messageColor: 'text-green-700',
        },
        error: {
            icon: '⚠️',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-500',
            iconBg: 'bg-red-100',
            titleColor: 'text-red-800',
            messageColor: 'text-red-700',
        },
        info: {
            icon: 'ℹ️',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-500',
            iconBg: 'bg-blue-100',
            titleColor: 'text-blue-800',
            messageColor: 'text-blue-700',
        },
    };

    const styles = typeStyles[type];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
                // Cerrar al hacer clic fuera del modal
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            {/* Overlay con backdrop blur */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />
            
            {/* Modal */}
            <div
                className={`relative ${styles.bgColor} rounded-2xl shadow-2xl border-l-4 ${styles.borderColor} max-w-md w-full transform transition-all duration-300 scale-100 animate-[slideUp_0.3s_ease-out]`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    {/* Icono y título */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className={`${styles.iconBg} rounded-full p-3 flex-shrink-0`}>
                            <span className="text-3xl">{styles.icon}</span>
                        </div>
                        <div className="flex-1">
                            {title && (
                                <h3 className={`text-xl font-bold ${styles.titleColor} mb-2`}>
                                    {title}
                                </h3>
                            )}
                            <p className={`text-base ${styles.messageColor}`}>
                                {message}
                            </p>
                        </div>
                    </div>

                    {/* Botón de cerrar */}
                    {showCloseButton && (
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={onClose}
                                className={`px-6 py-2.5 ${type === 'success' ? 'bg-[#f6d748]' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'} text-gray-800 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    type === 'success' 
                                        ? 'focus:ring-[#f6d748] hover:bg-[#f5e4b8]' 
                                        : type === 'error'
                                        ? 'focus:ring-red-500 hover:bg-red-600 text-white'
                                        : 'focus:ring-blue-500 hover:bg-blue-600 text-white'
                                }`}
                            >
                                {autoClose ? 'Cerrar' : 'Aceptar'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

