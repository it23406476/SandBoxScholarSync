'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, FileText, Download } from 'lucide-react';
import { formatDate, truncateContent } from '@/lib/community/helpers';
import { useCommunityStore } from '@/lib/community/communityStore';
import { communityApi } from '@/lib/community/api';

type PostAttachment = {
  name: string;
  data: string;
};

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
    attachments?: PostAttachment[];
  };
  currentUserId?: string;
}

export function ArticleCard({ post, currentUserId }: ArticleCardProps) {
  const { userLikedPosts, addUserLike, removeUserLike } = useCommunityStore();
  const isLiked = userLikedPosts.has(post.id);
  const [likeCount, setLikeCount] = React.useState(post.likeCount);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    try {
      const result = await communityApi.toggleLike(post.id);
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
      <article className="h-full bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-slate-700 cursor-pointer overflow-hidden flex flex-col">
        {/* Image */}
        {post.imageUrl && (
          <div className="w-full h-40 overflow-hidden bg-linear-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col grow p-4">
          {/* Author Info */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
              by {post.author.name}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">
              {formatDate(new Date(post.createdAt))}
            </p>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">
            {post.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 grow">
            {truncateContent(post.content, 120)}
          </p>

          {/* PDF Attachment indicator */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mb-2">
              <FileText size={12} />
              <span>{post.attachments.length} PDF attachment{post.attachments.length > 1 ? 's' : ''}</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const attachment = post.attachments![0];
                  const link = document.createElement('a');
                  link.href = attachment.data;
                  link.download = attachment.name.endsWith('.pdf') ? attachment.name : `${attachment.name}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="ml-auto flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Download size={10} />
                PDF
              </button>
            </div>
          )}

          {/* Footer with Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-700 mt-auto">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-sm transition-colors ${
                isLiked
                  ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-xs font-semibold">{likeCount}</span>
            </button>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 px-2 py-1.5 text-sm">
              <MessageCircle size={16} />
              <span className="text-xs font-semibold">{post.commentCount}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
