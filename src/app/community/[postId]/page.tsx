'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Heart, MessageCircle, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { jsPDF } from 'jspdf';
import { communityApi } from '@/lib/community/api';
import { formatDate } from '@/lib/community/helpers';
import { CommentSection } from '@/components/community/CommentSection';
import { useCommunityStore } from '@/lib/community/communityStore';

type PostAttachment = {
  name: string;
  data: string;
};

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  attachments?: PostAttachment[];
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
  createdAt: Date | string;
  updatedAt: Date | string;
  isEdited?: boolean;
  parentCommentId?: string;
  replies?: Comment[];
}

export default function ArticleDetailPage() {
  const params = useParams();
  const postId = params.postId as string;
  const { data: session } = useSession();
  const [post, setPost] = React.useState<Post | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { userLikedPosts, addUserLike, removeUserLike } = useCommunityStore();
  const [likeCount, setLikeCount] = React.useState(0);
  const isLiked = userLikedPosts.has(postId);

  const parseAttachments = React.useCallback((rawAttachments: unknown): PostAttachment[] => {
    if (Array.isArray(rawAttachments)) {
      return rawAttachments.filter(
        (item): item is PostAttachment =>
          typeof item === 'object' &&
          item !== null &&
          'name' in item &&
          'data' in item &&
          typeof (item as PostAttachment).name === 'string' &&
          typeof (item as PostAttachment).data === 'string'
      );
    }

    if (typeof rawAttachments === 'string') {
      try {
        const parsed = JSON.parse(rawAttachments);
        return Array.isArray(parsed)
          ? parsed.filter(
              (item): item is PostAttachment =>
                typeof item === 'object' &&
                item !== null &&
                'name' in item &&
                'data' in item &&
                typeof (item as PostAttachment).name === 'string' &&
                typeof (item as PostAttachment).data === 'string'
            )
          : [];
      } catch {
        return [];
      }
    }

    return [];
  }, []);

  React.useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await communityApi.getPost(postId);
        const normalizedPost: Post = {
          ...data,
          attachments: parseAttachments((data as { attachments?: unknown }).attachments),
        };
        setPost(normalizedPost);
        setLikeCount(data.likeCount || 0);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId, parseAttachments]);

  const handleLike = async () => {
    if (!session?.user?.id) return;

    try {
      const result = await communityApi.toggleLike(postId);
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

  const handleAttachmentDownload = (attachment: PostAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name.endsWith('.pdf') ? attachment.name : `${attachment.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleArticlePdfDownload = () => {
    if (!post) return;

    const doc = new jsPDF();
    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxTextWidth = pageWidth - margin * 2;

    doc.setFontSize(18);
    doc.text(post.title, margin, 20);
    doc.setFontSize(11);
    doc.text(`By ${post.author.name} • ${new Date(post.createdAt).toLocaleString()}`, margin, 28);

    const lines = doc.splitTextToSize(post.content, maxTextWidth);
    let cursorY = 38;

    lines.forEach((line: string) => {
      if (cursorY > 280) {
        doc.addPage();
        cursorY = 20;
      }

      doc.text(line, margin, cursorY);
      cursorY += 6;
    });

    const safeTitle = post.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    doc.save(`${safeTitle || 'article'}.pdf`);
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

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              type="button"
              onClick={handleArticlePdfDownload}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
            >
              <Download size={16} />
              Download This Article as PDF
            </button>
            {!!post.attachments?.length && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {post.attachments.length} attachment{post.attachments.length === 1 ? '' : 's'}
              </span>
            )}
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

          {!!post.attachments?.length && (
            <div className="mb-8 p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/30">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">PDF Attachments</h3>
              <div className="space-y-2">
                {post.attachments.map((attachment, index) => (
                  <div
                    key={`${attachment.name}-${index}`}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{attachment.name}</span>
                    <button
                      type="button"
                      onClick={() => handleAttachmentDownload(attachment)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-gray-300 dark:border-slate-600 text-sm hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      <Download size={14} /> Download
                    </button>
                  </div>
                ))}
              </div>
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
          </div>

          <CommentSection
            postId={postId}
            comments={post.comments || []}
            currentUserId={session?.user?.id}
            onCommentAdded={(comment) => {
              setPost((prev: Post | null) => (
                prev ? {
                  ...prev,
                  comments: [comment, ...(prev.comments || [])],
                  commentCount: (prev.commentCount || 0) + 1,
                } : null
              ));
            }}
          />
        </article>
      </div>
    </div>
  );
}
