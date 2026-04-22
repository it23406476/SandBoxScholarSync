export const communityApi = {
  async getPosts(page: number = 1, category?: string, search?: string, sort: string = 'recent') {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    params.append('sort', sort);

    const res = await fetch(`/api/posts?${params}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  },

  async getPost(postId: string) {
    const res = await fetch(`/api/posts/${postId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch post');
    return res.json();
  },

  async createPost(
    title: string,
    content: string,
    category: string,
    imageUrl: string | undefined,
    attachments?: Array<{ name: string; data: string }>
  ) {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, category, imageUrl, attachments: attachments || [] }),
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
  },

  async toggleLike(postId: string) {
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to toggle like');
    return res.json();
  },

  async createComment(content: string, postId: string, parentCommentId?: string) {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, postId, parentCommentId }),
    });
    if (!res.ok) throw new Error('Failed to create comment');
    return res.json();
  },

  async editComment(commentId: string, content: string) {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Failed to edit comment');
    return res.json();
  },

  async deleteComment(commentId: string) {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete comment');
    return res.json();
  },

  async getNotifications(page: number = 1, limit: number = 20) {
    const res = await fetch(`/api/notifications?page=${page}&limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationsAsRead(notificationIds: string[]) {
    const res = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationIds }),
    });
    if (!res.ok) throw new Error('Failed to mark notifications as read');
    return res.json();
  },

  async markNotificationAsRead(notificationId: string) {
    const res = await fetch(`/api/notifications/${notificationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: true }),
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return res.json();
  },

  async getUnreadNotificationCount() {
    const res = await fetch('/api/notifications/unread', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch unread count');
    return res.json();
  },

  async getCurrentUserLikedPostIds() {
    const res = await fetch('/api/posts/user/me/likes', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch liked posts');
    return res.json() as Promise<{ likedPostIds: string[] }>;
  },
};
