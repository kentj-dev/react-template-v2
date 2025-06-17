export function dateNow(): string {
    return formatDateFull(new Date());
}

export function formatDateFull(datetime: Date | string): string {
    const date = typeof datetime === 'string' ? new Date(datetime) : datetime;

    return date
        .toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        })
        .replace(',', ' at');
}

export function formatDateShort(datetime: Date | string): string {
    const date = typeof datetime === 'string' ? new Date(datetime) : datetime;

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatDateRange(start: Date | string, end: Date | string): string {
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;

    if (startDate.getFullYear() === endDate.getFullYear()) {
        if (startDate.getMonth() === endDate.getMonth()) {
            const month = startDate.toLocaleString('en-US', { month: 'long' });
            return `${month} ${startDate.getDate()} - ${endDate.getDate()}, ${startDate.getFullYear()}`;
        } else {
            const startMonth = startDate.toLocaleString('en-US', { month: 'long' });
            const endMonth = endDate.toLocaleString('en-US', { month: 'long' });
            return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${startDate.getFullYear()}`;
        }
    } else {
        const startStr = startDate.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });

        const endStr = endDate.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });

        return `${startStr} - ${endStr}`;
    }
}
