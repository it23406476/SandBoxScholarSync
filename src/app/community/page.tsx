'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { CommunityTimeline } from '@/components/community/CommunityTimeline';
import { SearchBar } from '@/components/community/SearchBar';
import { FilterBar } from '@/components/community/Filterbar';

const CURRENT_USER_ID = 'user-123';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Community</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Share knowledge and learn from your peers
            </p>
          </div>
          <Link
            href="/community/write"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Write Article
          </Link>
        </div>
        <div className="mb-8 space-y-4">
          <SearchBar />
          <FilterBar />
        </div>
        <CommunityTimeline currentUserId={CURRENT_USER_ID} />
      </div>
    </div>
  );
}
