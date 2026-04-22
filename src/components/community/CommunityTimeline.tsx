'use client';

import React from 'react';
import { ArticleCard } from './ArticleCard';
import { useCommunityStore } from '@/lib/community/communityStore';
import { communityApi } from '@/lib/community/api';

interface CommunityTimelineProps {
  currentUserId?: string;
}

export function CommunityTimeline({ currentUserId }: CommunityTimelineProps) {
  const {
    posts,
    setPosts,
    loading,
    setLoading,
    selectedCategory,
    searchQuery,
    sortBy,
    currentPage,
  } = useCommunityStore();

  React.useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await communityApi.getPosts(
          currentPage,
          selectedCategory,
          searchQuery,
          sortBy
        );
        setPosts(data.posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory, searchQuery, sortBy, currentPage, setPosts, setLoading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No articles found. Be the first to write one!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <ArticleCard key={post.id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
