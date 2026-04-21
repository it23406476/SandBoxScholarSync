'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, MessageCircle, ArrowLeft, Flag, X, FileText, Download } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { communityApi } from '@/lib/community/api';
import { formatDate } from '@/lib/community/helpers';
import { CommentSection } from '@/components/community/CommentSection';
import { useCommunityStore } from '@/lib/community/communityStore';

interface Attachment {
  name: string;
  data: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  attachments?: string;
  author: { id: string; name: string; email: string };
  createdAt: string;
  likeCount: number;
  commentCount: number;
  comments?: Comment[];
}

interface Comment {
  id: string;
  content: string;
  author: { id: string; name: string };
  createdAt: Date;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [post, setPost] = React.useState<Post | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { userLikedPosts, addUserLike, removeUserLike, loadUserLikes } = useCommunityStore();
  const [likeCount, setLikeCount] = React.useState(0);
  const isLiked = userLikedPosts.has(postId);
  const [showFlagForm, setShowFlagForm] = React.useState(false);
  const [flagReason, setFlagReason] = React.useState('');
  const [flagMessage, setFlagMessage] = React.useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const FLAG_REASONS = [
    'Spam or misleading',
    'Harassment or hate speech',
    'Inappropriate content',
    'Off-topic',
    'Other',
  ];

  React.useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await communityApi.getPost(postId);
        setPost(data);
        setLikeCount(data.likeCount || 0);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadUserLikesData = async () => {
      if (currentUserId) {
        await loadUserLikes(currentUserId);
      }
    };

    fetchPost();
    loadUserLikesData();
  }, [postId, currentUserId, loadUserLikes]);

  const handleLike = async () => {
    if (!currentUserId) {
      router.push('/login');
      return;
    }
    try {
      const result = await communityApi.toggleLike(postId, currentUserId);
      if (result.liked) {
        addUserLike(postId);
        setLikeCount((prev) => prev + 1);
      } else {
        removeUserLike(postId);
        setLikeCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleFlagPost = async () => {
    if (!flagReason.trim()) return;
    try {
      await communityApi.flagContent(flagReason, postId);
      setShowFlagForm(false);
      setFlagReason('');
      setFlagMessage({ type: 'success', text: 'Article has been flagged for review.' });
      setTimeout(() => setFlagMessage(null), 3000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to flag';
      setFlagMessage({ type: 'error', text: msg });
      setTimeout(() => setFlagMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">Article not found</p>
        <Link href="/community" className="text-blue-600 hover:text-blue-700">
          Go back to community
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link
          href="/community"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Community
        </Link>

        <article className="bg-white dark:bg-slate-800 rounded-lg shadow p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-slate-700 mb-6">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{post.author.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(new Date(post.createdAt))}
              </p>
            </div>
          </div>

          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg mb-6"
            />
          )}

          <div className="prose dark:prose-invert max-w-none mb-8">
            <div
              className="text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {(() => {
            let attachments: Attachment[] = [];
            try {
              attachments = post.attachments ? JSON.parse(post.attachments) : [];
            } catch {
              /* ignore parse errors */
            }
            if (attachments.length === 0) return null;
            return (
              <div className="mb-8 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FileText size={16} />
                  Attachments
                </h3>
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <a
                      key={index}
                      href={file.data}
                      download={file.name}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors group"
                    >
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <FileText size={20} className="text-red-600 dark:text-red-400" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {file.name}
                      </span>
                      <Download
                        size={18}
                        className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                      />
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}

          {flagMessage && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                flagMessage.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
              }`}
            >
              {flagMessage.text}
            </div>
          )}

          <div className="flex gap-4 py-6 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="font-medium">{likeCount} Likes</span>
            </button>

            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg">
              <MessageCircle size={20} />
              <span className="font-medium">{post.commentCount || 0} Comments</span>
            </div>

            {currentUserId && currentUserId !== post.author.id && (
              <button
                onClick={() => setShowFlagForm(!showFlagForm)}
                title="Flag this article"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg transition-colors ml-auto"
              >
                <Flag size={20} />
                <span className="font-medium">Flag</span>
              </button>
            )}
          </div>

          {showFlagForm && (
            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-orange-700 dark:text-orange-300">
                  Flag this article
                </p>
                <button
                  type="button"
                  onClick={() => setShowFlagForm(false)}
                  aria-label="Close flag form"
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-2 mb-3">
                {FLAG_REASONS.map((reason) => (
                  <label key={reason} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="post-flag-reason"
                      value={reason}
                      checked={flagReason === reason}
                      onChange={() => setFlagReason(reason)}
                      className="text-orange-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{reason}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={handleFlagPost}
                disabled={!flagReason.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors text-sm"
              >
                Submit Flag
              </button>
            </div>
          )}

          <CommentSection
            postId={postId}
            comments={(post.comments || []).map((comment) => ({
              ...comment,
              createdAt: new Date(comment.createdAt),
            }))}
            currentUserId={currentUserId}
            onCommentAdded={(comment) => {
              setPost((prev: Post | null) =>
                prev
                  ? {
                      ...prev,
                      comments: [comment, ...(prev.comments || [])],
                      commentCount: (prev.commentCount || 0) + 1,
                    }
                  : null
              );
            }}
            onCommentUpdated={(updatedComment) => {
              setPost((prev: Post | null) =>
                prev
                  ? {
                      ...prev,
                      comments: (prev.comments || []).map((c) =>
                        c.id === updatedComment.id ? updatedComment : c
                      ),
                    }
                  : null
              );
            }}
            onCommentDeleted={(commentId) => {
              setPost((prev: Post | null) =>
                prev
                  ? {
                      ...prev,
                      comments: (prev.comments || []).filter((c) => c.id !== commentId),
                      commentCount: Math.max((prev.commentCount || 0) - 1, 0),
                    }
                  : null
              );
            }}
          />
        </article>
      </div>
    </div>
  );
}
