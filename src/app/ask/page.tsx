'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  checkSimilarQuestions,
  createQuestion,
  getModules,
  type QnaModule,
} from '@/actions/qna.actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SimilarQuestion = {
  id: string;
  title: string;
  upvotes: number;
  score: number;
};

export default function AskQuestionPage() {
  const router = useRouter();

  // FOrm State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [bounty, setBounty] = useState(0);
  const [modules, setModules] = useState<QnaModule[]>([]);
  const [selectedModuleCode, setSelectedModuleCode] = useState<string>('');

  // Smart search state
  const [similarQuestions, setSimilarQuestions] = useState<SimilarQuestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchModules() {
      const fetchedModules = await getModules();
      setModules(fetchedModules);
      if (fetchedModules.length > 0) {
        setSelectedModuleCode(fetchedModules[0].code);
      }
    }

    fetchModules();
  }, []);

  // This useEffect runs the duplicate Detection Algorith
  useEffect(() => {
    // Only search after a meaningful title length.
    if (title.trim().length < 10 || !selectedModuleCode) {
      return;
    }

    // "debounce" the search to it doesn't query the DB on every single keystroke
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await checkSimilarQuestions(title, selectedModuleCode);
      setSimilarQuestions(results);
      setIsSearching(false);
    }, 500); // wait for 500ms of inactivity before searching

    return () => clearTimeout(timer);
  }, [title, selectedModuleCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Hardcoding test data for the Mock Environment
    // In production, you would fetch these from your Auth system
    const result = await createQuestion({
      title,
      content,
      tags: tags.split(',').map((tag) => tag.trim()),
      bounty: Number(bounty),
      moduleId: selectedModuleCode,
    });

    if (result.success) {
      router.push('/qna'); // Redirect to the Q&A page after successful submission
    } else {
      alert('Failed to submit question: ' + result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Ask a Question</h1>

      <div className="grid gap-6">
        {/* DUPLICATE WARNING WIDGET */}
        {similarQuestions.length > 0 && (
          <Card className="border-warning bg-warning/10 animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-warning flex items-center text-lg">
                <AlertCircle className="mr-2 h-5 w-5" />
                Wait! Has this been asked before?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                We found these similar questions in the {selectedModuleCode || 'selected'} module.
                Check them out before posting:
              </p>
              <ul className="space-y-2">
                {similarQuestions.map((q) => (
                  <li
                    key={q.id}
                    className="text-sm font-medium hover:underline cursor-pointer text-primary"
                    onClick={() => router.push(`/qna/${q.id}`)}
                  >
                    {q.title} ({q.upvotes} upvotes)
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* THE MAIN FORM */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="space-y-6 pt-6">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Question Title</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g., When is the final sprint deployment?"
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={title}
                    onChange={(e) => {
                      const nextTitle = e.target.value;
                      setTitle(nextTitle);
                      if (nextTitle.length < 10) {
                        setSimilarQuestions([]);
                      }
                    }}
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Be specific. Our engine will check for duplicates automatically.
                </p>
              </div>

              {/* Module Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Module</label>
                <Select
                  value={selectedModuleCode}
                  onValueChange={(value) => {
                    setSelectedModuleCode(value);
                    setSimilarQuestions([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.code}>
                        {module.code} - {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Content Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Details</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Explain your problem, what you've tried, and what you need help with..."
                  className="w-full flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Tags Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="react, deployment, nextjs"
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>

                {/* Bounty Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Attach Bounty (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={bounty}
                    onChange={(e) => setBounty(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    Available balance: 500 pts
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !selectedModuleCode}
              >
                {isSubmitting
                  ? 'Posting...'
                  : `Post Question${selectedModuleCode ? ` to ${selectedModuleCode}` : ''}`}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
