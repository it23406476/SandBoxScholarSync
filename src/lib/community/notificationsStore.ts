import { create } from 'zustand';
import { communityApi } from './api';

interface Notification {
  id: string;
  type: 'POST_LIKED' | 'POST_COMMENTED' | 'COMMENT_LIKED';
  message: string;
  isRead: boolean;
  createdAt: string;
  post?: {
    id: string;
    title: string;
    author: { id: string; name: string };
  };
  comment?: {
    id: string;
    content: string;
    author: { id: string; name: string };
  };
  like?: {
    id: string;
    user: { id: string; name: string };
  };
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: (page?: number) => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  clearError: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await communityApi.getNotifications(page);
      const notifications = response.notifications || [];
      const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

      set({
        notifications: page === 1 ? notifications : [...get().notifications, ...notifications],
        unreadCount,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
        loading: false,
      });
    }
  },

  markAsRead: async (notificationIds: string[]) => {
    try {
      await communityApi.markNotificationsAsRead(notificationIds);
      const notifications = get().notifications.map((notification) =>
        notificationIds.includes(notification.id) ? { ...notification, isRead: true } : notification
      );
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      set({ notifications, unreadCount });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark notifications as read',
      });
    }
  },

  markAllAsRead: async () => {
    try {
      const unreadIds = get()
        .notifications.filter((n) => !n.isRead)
        .map((n) => n.id);
      if (unreadIds.length > 0) {
        await communityApi.markNotificationsAsRead(unreadIds);
        const notifications = get().notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }));
        set({ notifications, unreadCount: 0 });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark all notifications as read',
      });
    }
  },

  addNotification: (notification: Notification) => {
    const notifications = [notification, ...get().notifications];
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    set({ notifications, unreadCount });
  },

  clearError: () => set({ error: null }),
}));
