import { create } from 'zustand';

export type Post = {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    email: string;
  };
};

interface CommunityStore {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  error: string | null;
  selectedCategory: string;
  searchQuery: string;
  sortBy: 'recent' | 'trending' | 'most-liked' | 'most-commented';
  currentPage: number;
  userLikedPosts: Set<string>;

  setPosts: (posts: Post[]) => void;
  setCurrentPost: (post: Post | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCategory: (category: string) => void;
  setSearch: (query: string) => void;
  setSort: (sort: 'recent' | 'trending' | 'most-liked' | 'most-commented') => void;
  setPage: (page: number) => void;
  addUserLike: (postId: string) => void;
  removeUserLike: (postId: string) => void;
  reset: () => void;
}

export const useCommunityStore = create<CommunityStore>((set) => ({
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'recent',
  currentPage: 1,
  userLikedPosts: new Set(),

  setPosts: (posts) => set({ posts }),
  setCurrentPost: (post) => set({ currentPost: post }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCategory: (category) => set({ selectedCategory: category, currentPage: 1 }),
  setSearch: (query) => set({ searchQuery: query, currentPage: 1 }),
  setSort: (sort) => set({ sortBy: sort, currentPage: 1 }),
  setPage: (page) => set({ currentPage: page }),

  addUserLike: (postId) =>
    set((state) => {
      const newLikes = new Set(state.userLikedPosts);
      newLikes.add(postId);
      return { userLikedPosts: newLikes };
    }),

  removeUserLike: (postId) =>
    set((state) => {
      const newLikes = new Set(state.userLikedPosts);
      newLikes.delete(postId);
      return { userLikedPosts: newLikes };
    }),

  reset: () =>
    set({
      posts: [],
      currentPost: null,
      loading: false,
      error: null,
      selectedCategory: 'all',
      searchQuery: '',
      sortBy: 'recent',
      currentPage: 1,
      userLikedPosts: new Set(),
    }),
}));
