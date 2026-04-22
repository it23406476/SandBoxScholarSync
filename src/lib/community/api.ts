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
    authorId: string,
    attachments?: Array<{ name: string; data: string }>
  ) {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, category, imageUrl, authorId, attachments: attachments || [] }),
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
  },

  async toggleLike(postId: string, userId: string) {
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to toggle like');
    return res.json();
  },

  async createComment(content: string, postId: string, authorId: string) {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, postId, authorId }),
    });
    if (!res.ok) throw new Error('Failed to create comment');
    return res.json();
  },
};
