'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Clock, Bell } from 'lucide-react';
import { useNotificationsStore } from '@/lib/community/notificationsStore';
import { formatDate } from '@/lib/community/helpers';

interface NotificationItemProps {
  notification: {
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
  };
  onClick: () => void;
}

function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const { markAsRead } = useNotificationsStore();

  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead([notification.id]);
    }
    onClick();
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'POST_LIKED':
        return <Heart size={16} className="text-red-500" />;
      case 'POST_COMMENTED':
        return <MessageCircle size={16} className="text-blue-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  return (
    <Link
      href={notification.post ? `/community/${notification.post.id}` : '#'}
      onClick={handleClick}
      className={`block p-4 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
        !notification.isRead ? 'bg-blue-50 dark:bg-slate-700' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-1">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatDate(new Date(notification.createdAt))}
          </p>
        </div>
        {!notification.isRead && (
          <div className="shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </div>
    </Link>
  );
}

interface NotificationListProps {
  onClose: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const { notifications, loading, error, fetchNotifications } = useNotificationsStore();
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage);
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => fetchNotifications(1)}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Try again
        </button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell size={32} className="text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          You&apos;ll be notified when someone likes or comments on your posts
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onClick={onClose} />
      ))}

      {notifications.length >= 20 && (
        <div className="p-4 text-center border-t border-gray-100 dark:border-slate-700">
          <button
            onClick={loadMore}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
