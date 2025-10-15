"use client";

interface OfflineBadgeProps {
  isOffline?: boolean;
  className?: string;
}

export default function OfflineBadge({ isOffline, className = "" }: OfflineBadgeProps) {
  if (!isOffline) return null;

  return (
    <div className={`
      absolute top-2 right-2 
      bg-orange-500 text-white 
      text-xs px-2 py-1 rounded-full 
      font-medium shadow-sm
      ${className}
    `}>
      📱 Offline
    </div>
  );
}
