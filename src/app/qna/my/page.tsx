'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionCard } from '@/components/QuestionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, PlusCircle, Search } from 'lucide-react';
import {
  deleteQuestion,
  getMyQuestions,
  getModules,
  updateQuestion,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type EditDraft = {
  id: string;
  title: string;
  content: string;
  tags: string;
  bounty: number;
};

export default function MyQuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<RankedQuestion[]>([]);
  const [modules, setModules] = useState<QnaModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<EditDraft | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const normalizedSearch = search.trim().toLowerCase();

  useEffect(() => {
    async function fetchData() {
      const fetchedQuestions = await getMyQuestions();
      const fetchedModules = await getModules();
      setQuestions(fetchedQuestions);
      setModules(fetchedModules);
      setIsLoading(false);
    }

    fetchData();
  }, []);

  const filtered = questions
    .filter((q) => selectedModule === 'all' || q.moduleId === selectedModule)
    .filter((q) => {
      if (!normalizedSearch) return true;

      const haystack = [q.title, q.content, q.tags.join(' '), q.module.code]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });

  const handleDeleteQuestion = async (question: RankedQuestion) => {
    const shouldDelete = window.confirm('Delete this question permanently?');
    if (!shouldDelete) return;

    const result = await deleteQuestion(question.id);
    if (!result.success) {
      alert(result.message ?? 'Failed to delete question.');
      return;
    }

    setQuestions((prev) => prev.filter((q) => q.id !== question.id));
  };

  const handleEditQuestion = (question: RankedQuestion) => {
    setEditingQuestion({
      id: question.id,
      title: question.title,
      content: question.content,
      tags: question.tags.join(', '),
      bounty: question.bounty,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion) return;

    const title = editingQuestion.title.trim();
    const content = editingQuestion.content.trim();
    const tags = editingQuestion.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!title || !content) {
      alert('Title and content are required.');
      return;
    }

    setIsSavingEdit(true);
    const result = await updateQuestion({
      id: editingQuestion.id,
      title,
      content,
      tags,
      bounty: editingQuestion.bounty,
    });

    if (!result.success) {
      alert(result.message ?? 'Failed to update question.');
      setIsSavingEdit(false);
      return;
    }

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === editingQuestion.id
          ? {
              ...q,
              title,
              content,
              tags,
              bounty: editingQuestion.bounty,
            }
          : q
      )
    );

    setEditingQuestion(null);
    setIsSavingEdit(false);
  };

  return (
    <div className="p-4 md:p-6 animate-fade-in flex flex-col h-full min-h-0 gap-4">
      <div className="max-w-4xl mx-auto w-full flex-shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">My Questions</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/qna')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> All Questions
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
              placeholder="Search my questions..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
            filtered.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                showActions
                onEdit={handleEditQuestion}
                onDelete={handleDeleteQuestion}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-12">No questions found.</p>
          )}
        </div>
      </div>

      <Dialog
        open={Boolean(editingQuestion)}
        onOpenChange={(open) => !open && setEditingQuestion(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Update the title, details, and tags for your question.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question Title</label>
              <Input
                value={editingQuestion?.title ?? ''}
                onChange={(e) =>
                  setEditingQuestion((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                }
                placeholder="Question title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Details</label>
              <Textarea
                rows={6}
                value={editingQuestion?.content ?? ''}
                onChange={(e) =>
                  setEditingQuestion((prev) => (prev ? { ...prev, content: e.target.value } : prev))
                }
                placeholder="Explain your question details"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <Input
                value={editingQuestion?.tags ?? ''}
                onChange={(e) =>
                  setEditingQuestion((prev) => (prev ? { ...prev, tags: e.target.value } : prev))
                }
                placeholder="react, deployment, nextjs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingQuestion(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSavingEdit}>
              {isSavingEdit ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
