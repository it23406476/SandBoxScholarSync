import { useCommunityStore } from '@/lib/community/communityStore';

const mockPost = {
  id: 'post-1',
  title: 'Test Article',
  content: 'This is test content for the article.',
  category: 'general',
  likeCount: 0,
  commentCount: 0,
  createdAt: new Date(),
  author: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
};

describe('communityStore', () => {
  beforeEach(() => {
    useCommunityStore.getState().reset();
  });

  describe('posts state', () => {
    it('initialises with empty posts array', () => {
      expect(useCommunityStore.getState().posts).toEqual([]);
    });

    it('sets posts correctly', () => {
      useCommunityStore.getState().setPosts([mockPost]);
      expect(useCommunityStore.getState().posts).toHaveLength(1);
      expect(useCommunityStore.getState().posts[0].id).toBe('post-1');
    });

    it('replaces posts on setPosts', () => {
      useCommunityStore.getState().setPosts([mockPost]);
      const newPost = { ...mockPost, id: 'post-2', title: 'Second Article' };
      useCommunityStore.getState().setPosts([newPost]);
      expect(useCommunityStore.getState().posts).toHaveLength(1);
      expect(useCommunityStore.getState().posts[0].id).toBe('post-2');
    });
  });

  describe('filter and search state', () => {
    it('initialises with selectedCategory "all"', () => {
      expect(useCommunityStore.getState().selectedCategory).toBe('all');
    });

    it('sets category and resets page to 1', () => {
      useCommunityStore.getState().setPage(3);
      useCommunityStore.getState().setCategory('study');
      expect(useCommunityStore.getState().selectedCategory).toBe('study');
      expect(useCommunityStore.getState().currentPage).toBe(1);
    });

    it('sets search query and resets page to 1', () => {
      useCommunityStore.getState().setPage(5);
      useCommunityStore.getState().setSearch('react hooks');
      expect(useCommunityStore.getState().searchQuery).toBe('react hooks');
      expect(useCommunityStore.getState().currentPage).toBe(1);
    });

    it('sets sort option and resets page to 1', () => {
      useCommunityStore.getState().setPage(2);
      useCommunityStore.getState().setSort('most-liked');
      expect(useCommunityStore.getState().sortBy).toBe('most-liked');
      expect(useCommunityStore.getState().currentPage).toBe(1);
    });
  });

  describe('user likes state', () => {
    it('initialises with empty userLikedPosts set', () => {
      expect(useCommunityStore.getState().userLikedPosts.size).toBe(0);
    });

    it('sets user liked post IDs', () => {
      useCommunityStore.getState().setUserLikes(['post-1', 'post-2']);
      expect(useCommunityStore.getState().userLikedPosts.has('post-1')).toBe(true);
      expect(useCommunityStore.getState().userLikedPosts.has('post-2')).toBe(true);
    });

    it('adds a like to userLikedPosts', () => {
      useCommunityStore.getState().addUserLike('post-3');
      expect(useCommunityStore.getState().userLikedPosts.has('post-3')).toBe(true);
    });

    it('removes a like from userLikedPosts', () => {
      useCommunityStore.getState().setUserLikes(['post-1', 'post-2']);
      useCommunityStore.getState().removeUserLike('post-1');
      expect(useCommunityStore.getState().userLikedPosts.has('post-1')).toBe(false);
      expect(useCommunityStore.getState().userLikedPosts.has('post-2')).toBe(true);
    });

    it('addUserLike does not create duplicates', () => {
      useCommunityStore.getState().setUserLikes(['post-1']);
      useCommunityStore.getState().addUserLike('post-1');
      expect(useCommunityStore.getState().userLikedPosts.size).toBe(1);
    });
  });

  describe('loading and error state', () => {
    it('initialises loading as false', () => {
      expect(useCommunityStore.getState().loading).toBe(false);
    });

    it('sets loading state', () => {
      useCommunityStore.getState().setLoading(true);
      expect(useCommunityStore.getState().loading).toBe(true);
    });

    it('sets error message', () => {
      useCommunityStore.getState().setError('Something went wrong');
      expect(useCommunityStore.getState().error).toBe('Something went wrong');
    });

    it('clears error when set to null', () => {
      useCommunityStore.getState().setError('error');
      useCommunityStore.getState().setError(null);
      expect(useCommunityStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('resets all state back to initial values', () => {
      useCommunityStore.getState().setPosts([mockPost]);
      useCommunityStore.getState().setCategory('projects');
      useCommunityStore.getState().setSearch('next.js');
      useCommunityStore.getState().setUserLikes(['post-1']);
      useCommunityStore.getState().setLoading(true);

      useCommunityStore.getState().reset();

      const state = useCommunityStore.getState();
      expect(state.posts).toEqual([]);
      expect(state.selectedCategory).toBe('all');
      expect(state.searchQuery).toBe('');
      expect(state.userLikedPosts.size).toBe(0);
      expect(state.loading).toBe(false);
      expect(state.currentPage).toBe(1);
    });
  });
});
