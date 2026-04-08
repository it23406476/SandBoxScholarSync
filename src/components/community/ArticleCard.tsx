'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle } from 'lucide-react';
import { formatDate, truncateContent } from '@/lib/community/helpers';
import { useCommunityStore } from '@/lib/community/communityStore';
import { communityApi } from '@/lib/community/api';

interface ArticleCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    likeCount: number;
    commentCount: number;
    createdAt: Date;
    author: { id: string; name: string };
  };
  currentUserId?: string;
}

export function ArticleCard({ post, currentUserId }: ArticleCardProps) {
  const router = useRouter();
  const { userLikedPosts, addUserLike, removeUserLike } = useCommunityStore();
  const isLiked = userLikedPosts.has(post.id);
  const [likeCount, setLikeCount] = React.useState(post.likeCount);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId) {
      router.push('/login');
      return;
    }
    try {
      const result = await communityApi.toggleLike(post.id, currentUserId);
      if (result.liked) {
        addUserLike(post.id);
        setLikeCount((prev) => prev + 1);
      } else {
        removeUserLike(post.id);
        setLikeCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <Link href={`/community/${post.id}`}>
      <article className="bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-shadow p-4 border border-gray-200 dark:border-slate-700 cursor-pointer">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          by {post.author.name} • {formatDate(new Date(post.createdAt))}
        </p>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-48 object-cover rounded-md my-3"
          />
        )}
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
          {truncateContent(post.content, 150)}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              isLiked
                ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 px-3 py-2">
            <MessageCircle size={18} />
            <span className="text-sm font-medium">{post.commentCount}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
