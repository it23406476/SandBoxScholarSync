'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { ArticleEditor } from '@/components/community/ArticleEditor';

export default function WritePage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Write an Article</h1>
        <ArticleEditor currentUserId={currentUserId} />
      </div>
    </div>
  );
}
