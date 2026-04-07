'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { communityApi } from '@/lib/community/api';
import { formatDate } from '@/lib/community/helpers';
import { CommentSection } from '@/components/community/CommentSection';
import { useCommunityStore } from '@/lib/community/communityStore';

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
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
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.content}</p>
          </div>

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
          </div>

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
          />
        </article>
      </div>
    </div>
  );
}
