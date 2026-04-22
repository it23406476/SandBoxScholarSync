'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { useCommunityStore } from '@/lib/community/communityStore';

export function SearchBar() {
  const { setSearch, searchQuery } = useCommunityStore();
  const [input, setInput] = React.useState(searchQuery);
  const debounceTimer = React.useRef<NodeJS.Timeout>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearch(value);
    }, 300);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 text-gray-400" size={20} />
      <input
        type="text"
        placeholder="Search articles..."
        value={input}
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
