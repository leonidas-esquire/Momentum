import { Habit } from '../types';
import { isToday } from './date';

let permissionGranted: boolean | null = null;
const scheduledNotifications = new Map<string, number>();

export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    permissionGranted = false;
    return false;
  }

  // Avoid asking for permission if it's already known
  if (Notification.permission !== 'default') {
      permissionGranted = Notification.permission === 'granted';
      return permissionGranted;
  }

  const permission = await Notification.requestPermission();
  permissionGranted = permission === 'granted';
  return permissionGranted;
};

const scheduleNotification = (habit: Habit) => {
    if (permissionGranted !== true || !habit.reminder || habit.reminder.type !== 'time' || !habit.reminder.time) {
        return;
    }
    
    // Clear any existing notification for this habit
    if (scheduledNotifications.has(habit.id)) {
        clearTimeout(scheduledNotifications.get(habit.id));
        scheduledNotifications.delete(habit.id);
    }
    
    const isCompletedToday = isToday(habit.lastCompleted);
    if (isCompletedToday) return;

    const [hours, minutes] = habit.reminder.time.split(':').map(Number);
    const now = new Date();
    let notificationTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);

    // If the time has already passed for today, schedule it for tomorrow
    if (notificationTime.getTime() < now.getTime()) {
        notificationTime.setDate(notificationTime.getDate() + 1);
    }

    const delay = notificationTime.getTime() - now.getTime();
    
    if (delay > 0) {
        const timeoutId = window.setTimeout(() => {
            new Notification('Momentum Reminder', {
                body: `Time for your habit: "${habit.title}"`,
                icon: '/vite.svg', // Using a generic icon from the project
                tag: habit.id, // Use habit ID as tag to prevent multiple notifications for the same habit
            });
            scheduledNotifications.delete(habit.id);
            // Re-schedule for the next day
            scheduleNotification(habit);
        }, delay);
        scheduledNotifications.set(habit.id, timeoutId);
    }
};

export const scheduleAllHabitNotifications = (habits: Habit[]) => {
    if (permissionGranted !== true) return;
    
    // Clear all existing timeouts before rescheduling
    for (const timeoutId of scheduledNotifications.values()) {
        clearTimeout(timeoutId);
    }
    scheduledNotifications.clear();

    habits.forEach(scheduleNotification);
};
