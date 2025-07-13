import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
}

export function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString();
}

export function formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
}

export function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

export function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export function groupItemsByEquipmentType(items: any[]): Record<string, any[]> {
    return items.reduce((acc, item) => {
        const type = item.equipment_type;
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(item);
        return acc;
    }, {});
}

export function getStatusColor(status: string): string {
    switch (status) {
        case 'tracking':
            return 'bg-blue-100 text-blue-800';
        case 'missing':
            return 'bg-red-100 text-red-800';
        case 'found':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

export function getStatusIcon(status: string): string {
    switch (status) {
        case 'tracking':
            return '📍';
        case 'missing':
            return '⚠️';
        case 'found':
            return '✅';
        default:
            return '❓';
    }
}

export function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidNumber(value: string): boolean {
    return !isNaN(Number(value)) && Number(value) > 0;
}

export function parseNumberSafely(value: string, defaultValue: number = 0): number {
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
} 