'use client';

import React from 'react';
import { useCommunityStore } from '@/lib/community/communityStore';
import { CATEGORIES } from '@/lib/community/helpers';

export function FilterBar() {
  const { selectedCategory, setCategory, sortBy, setSort } = useCommunityStore();

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSort(e.target.value as 'recent' | 'trending' | 'most-liked' | 'most-commented')}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="recent">Most Recent</option>
          <option value="trending">Trending</option>
          <option value="most-liked">Most Liked</option>
          <option value="most-commented">Most Commented</option>
        </select>
      </div>
    </div>
  );
}
