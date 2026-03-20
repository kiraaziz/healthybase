import React from 'react'

export function LocalTimeRender({ dateTime }: any) {

    function formatDate(dateStr: string) {
        if (!dateStr) {
            return new Date().toLocaleString();
        }
        const date = new Date(dateStr);
        return date.toLocaleString();
    }

    return (
        <>
            {formatDate(dateTime)}
        </>
    )
}


export function LocalTimeAgo({ dateTime }: any) {

    return (
        <span>
            {(() => {
                const seconds = Math.floor((Date.now() - new Date(dateTime).getTime()) / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);

                if (days > 0) return `${days}d ago`;
                if (hours > 0) return `${hours}h ago`;
                if (minutes > 0) return `${minutes}m ago`;
                return `${seconds}s ago`;
            })()}
        </span>
    )
}