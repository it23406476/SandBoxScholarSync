'use client';

import React from 'react';
import { communityApi } from '@/lib/community/api';
import { formatDate } from '@/lib/community/helpers';
import { Trash2, Edit2, Reply, X, Check } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  author: { id: string; name: string };
  createdAt: Date | string;
  updatedAt: Date | string;
  isEdited?: boolean;
  parentCommentId?: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  currentUserId?: string;
  onCommentAdded?: (comment: Comment) => void;
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  postId: string;
  onCommentUpdated?: (comment: Comment) => void;
  onCommentDeleted?: (commentId: string) => void;
  isReply?: boolean;
}

function CommentItem({ comment, currentUserId, postId, onCommentUpdated, onCommentDeleted, isReply }: CommentItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(comment.content);
  const [isReplying, setIsReplying] = React.useState(false);
  const [replyContent, setReplyContent] = React.useState('');
  const [showReplies, setShowReplies] = React.useState(false);

  const isAuthor = currentUserId === comment.author.id;

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      const updated = await communityApi.editComment(comment.id, editContent);
      setIsEditing(false);
      onCommentUpdated?.(updated);
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await communityApi.deleteComment(comment.id);
      onCommentDeleted?.(comment.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !currentUserId) return;
    try {
      const reply = await communityApi.createComment(replyContent, postId, comment.id);
      setReplyContent('');
      setIsReplying(false);
      onCommentUpdated?.(reply);
    } catch (error) {
      console.error('Error replying:', error);
    }
  };

  return (
    <div className={`${isReply ? 'ml-4 md:ml-8' : 'ml-0'}`}>
      <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{comment.author.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(new Date(comment.createdAt))}
              {comment.isEdited && <span className="ml-2 italic text-gray-400">(edited)</span>}
            </p>
          </div>
          {isAuthor && !isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                title="Edit comment"
              >
                <Edit2 size={16} className="text-blue-600 dark:text-blue-400" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                title="Delete comment"
              >
                <Trash2 size={16} className="text-red-600 dark:text-red-400" />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2 mb-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              aria-label="Edit comment"
              placeholder="Edit your comment"
              className="w-full px-3 py-2 rounded bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 text-gray-900 dark:text-white resize-none"
              rows={3}
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                className="px-3 py-1 text-sm bg-gray-300 dark:bg-slate-600 text-gray-900 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-slate-500 transition-colors flex items-center gap-1"
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleEdit}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Check size={14} /> Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 mb-3">{comment.content}</p>
        )}

        {!isEditing && currentUserId && currentUserId !== comment.author.id && (
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <Reply size={14} /> Reply
          </button>
        )}

        {isReplying && (
          <div className="mt-3 space-y-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full px-3 py-2 rounded bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 text-gray-900 dark:text-white resize-none"
              rows={2}
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                }}
                className="px-3 py-1 text-sm bg-gray-300 dark:bg-slate-600 text-gray-900 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={!replyContent.trim()}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                Reply
              </button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {showReplies ? '▼' : '▶'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>
            {showReplies && (
              <div className="mt-2 space-y-3">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUserId={currentUserId}
                    postId={postId}
                    onCommentUpdated={onCommentUpdated}
                    onCommentDeleted={onCommentDeleted}
                    isReply={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentSection({ postId, comments, currentUserId, onCommentAdded }: CommentSectionProps) {
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [commentsList, setCommentsList] = React.useState(comments);
  const MAX_COMMENT_LENGTH = 500;
  const isCommentTooLong = input.length > MAX_COMMENT_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUserId) return;
    setLoading(true);
    try {
      const comment = await communityApi.createComment(input, postId);
      setInput('');
      setCommentsList([...commentsList, comment]);
      onCommentAdded?.(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeCommentRecursively = React.useCallback((items: Comment[], targetId: string): Comment[] => {
    return items
      .filter((item) => item.id !== targetId)
      .map((item) => ({
        ...item,
        replies: item.replies ? removeCommentRecursively(item.replies, targetId) : item.replies,
      }));
  }, []);

  const upsertCommentRecursively = React.useCallback((items: Comment[], updatedComment: Comment): Comment[] => {
    const isReply = !!updatedComment.parentCommentId;

    if (isReply) {
      return items.map((item) => {
        if (item.id === updatedComment.parentCommentId) {
          const currentReplies = item.replies ?? [];
          const existingIndex = currentReplies.findIndex((reply) => reply.id === updatedComment.id);

          if (existingIndex >= 0) {
            const nextReplies = [...currentReplies];
            nextReplies[existingIndex] = { ...nextReplies[existingIndex], ...updatedComment };
            return { ...item, replies: nextReplies };
          }

          return { ...item, replies: [updatedComment, ...currentReplies] };
        }

        return {
          ...item,
          replies: item.replies ? upsertCommentRecursively(item.replies, updatedComment) : item.replies,
        };
      });
    }

    let found = false;
    const nextItems = items.map((item) => {
      if (item.id === updatedComment.id) {
        found = true;
        return { ...item, ...updatedComment };
      }

      return {
        ...item,
        replies: item.replies ? upsertCommentRecursively(item.replies, updatedComment) : item.replies,
      };
    });

    return found ? nextItems : [updatedComment, ...nextItems];
  }, []);

  const handleCommentDeleted = (commentId: string) => {
    setCommentsList((prev) => removeCommentRecursively(prev, commentId));
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    setCommentsList((prev) => upsertCommentRecursively(prev, updatedComment));
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Comments ({commentsList.length})</h3>
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
        {commentsList.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          commentsList.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              postId={postId}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
}