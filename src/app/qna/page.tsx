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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

function parseTags(value: string | string[]) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || '[]') as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<RankedQuestion[]>([]);
  const [modules, setModules] = useState<QnaModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | 'week' | 'month'>('all');
  const [search, setSearch] = useState('');

  const normalizedSearch = search.trim().toLowerCase();

  // Fetch Real Data on Mount
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const fetchedQuestions = await getRankedQuestions(selectedTimeRange);
      const fetchedModules = await getModules();
      setQuestions(fetchedQuestions);
      setModules(fetchedModules);
      setIsLoading(false);
    }
    fetchData();
  }, [selectedTimeRange]);

  // Filter the Ranked Questions locally
  const filtered = questions
    .filter((q) => selectedModule === 'all' || q.moduleId === selectedModule)
    .filter((q) => {
      if (!normalizedSearch) return true;

      const haystack = [q.title, q.content, parseTags(q.tags).join(' '), q.module.code]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });

  return (
    <div className="p-4 md:p-6 animate-fade-in flex flex-col h-full min-h-0 gap-4">
      <div className="max-w-4xl mx-auto w-full shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">All Questions</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/qna/my')}>
              My Questions
            </Button>
            <Button size="sm" onClick={() => router.push('/ask')}>
              <PlusCircle className="h-4 w-4 mr-1" /> Ask Question
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-52">
            <Select
              value={selectedTimeRange}
              onValueChange={(value) => setSelectedTimeRange(value as 'all' | 'week' | 'month')}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-52">
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger>
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.code} - {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 min-h-0 overflow-y-auto pr-1">
        <div className="space-y-3 pb-4">
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
    </div>
  );
}
