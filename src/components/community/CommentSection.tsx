'use client';

import React from 'react';
import { communityApi } from '@/lib/community/api';
import { formatDate } from '@/lib/community/helpers';

interface Comment {
  id: string;
  content: string;
  author: { id: string; name: string };
  createdAt: Date;
}

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  currentUserId?: string;
  onCommentAdded?: (comment: Comment) => void;
}

export function CommentSection({ postId, comments, currentUserId, onCommentAdded }: CommentSectionProps) {
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const MAX_COMMENT_LENGTH = 300;
  const isCommentTooLong = input.length > MAX_COMMENT_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUserId) return;
    setLoading(true);
    try {
      const comment = await communityApi.createComment(input, postId, currentUserId);
      setInput('');
      onCommentAdded?.(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Comments ({comments.length})</h3>
      {currentUserId && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a comment..."
              className={`w-full px-4 py-3 rounded-lg border dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 resize-none ${
                isCommentTooLong
                  ? 'border-yellow-300 focus:ring-yellow-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              rows={3}
            />
            <div className="flex items-center justify-between mt-2">
              <div>
                {isCommentTooLong && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                    💡 Consider keeping comments shorter for better readability
                  </p>
                )}
              </div>
              <span className={`text-xs ${
                isCommentTooLong
                  ? 'text-yellow-600 dark:text-yellow-400 font-medium'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {input.length}/{MAX_COMMENT_LENGTH}
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600">
            <div className="flex items-start justify-between mb-2">
              <p className="font-semibold text-gray-900 dark:text-white">{comment.author.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(new Date(comment.createdAt))}</p>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}