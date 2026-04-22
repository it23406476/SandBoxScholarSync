'use client';

import React from 'react';
import { ArticleEditor } from '@/components/community/ArticleEditor';

const CURRENT_USER_ID = 'user-123';

export default function WritePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Write an Article</h1>
        <ArticleEditor currentUserId={CURRENT_USER_ID} />
      </div>
    </div>
  );
}
