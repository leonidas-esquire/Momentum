export const isSameDay = (d1: Date, d2: Date): boolean => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

export const isToday = (someDate: string | null): boolean => {
    if (!someDate) return false;
    const today = new Date();
    const date = new Date(someDate);
    return isSameDay(today, date);
};

export const isYesterday = (someDate: string | null): boolean => {
    if (!someDate) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = new Date(someDate);
    return isSameDay(yesterday, date);
};

export const getTodayDateString = (): string => {
    return new Date().toISOString().split('T')[0];
};