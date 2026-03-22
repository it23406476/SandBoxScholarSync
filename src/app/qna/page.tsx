'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionCard } from '@/components/QuestionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Loader2 } from 'lucide-react';
import {
  getRankedQuestions,
  getModules,
  type RankedQuestion,
  type QnaModule,
} from '@/actions/qna.actions';

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<RankedQuestion[]>([]);
  const [modules, setModules] = useState<QnaModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Fetch Real Data on Mount
  useEffect(() => {
    async function fetchData() {
      const fetchedQuestions = await getRankedQuestions();
      const fetchedModules = await getModules();
      setQuestions(fetchedQuestions);
      setModules(fetchedModules);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  // Filter the Ranked Questions locally
  const filtered = questions
    .filter((q) => selectedModule === 'all' || q.moduleId === selectedModule)
    .filter((q) => q.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold">Q&A Feed</h2>
        <Button size="sm" onClick={() => router.push('/ask')}>
          <PlusCircle className="h-4 w-4 mr-1" /> Ask Question
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search database..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter by module"
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Modules</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.code} - {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((q) => <QuestionCard key={q.id} question={q} />)
        ) : (
          <p className="text-center text-muted-foreground py-12">No questions found.</p>
        )}
      </div>
    </div>
  );
}
