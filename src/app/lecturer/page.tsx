'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MessageCircle, Sparkles } from 'lucide-react';
import {
  getLecturerAssignedQuestions,
  lecturerRecommendQuestion,
  type RankedQuestion,
} from '@/actions/qna.actions';
import { LecturerInsights } from '@/components/lecturer/LecturerInsights';

const LecturerPage = () => {
  const [questions, setQuestions] = useState<RankedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRecommendId, setPendingRecommendId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      const data = await getLecturerAssignedQuestions();
      setQuestions(data);
      setIsLoading(false);
    }

    fetchQuestions();
  }, []);

  const handleRecommend = async (questionId: string) => {
    setPendingRecommendId(questionId);
    const result = await lecturerRecommendQuestion(questionId);

    if (!result.success || !('upvotes' in result) || typeof result.upvotes !== 'number') {
      alert(result.message ?? 'Unable to recommend this question.');
      setPendingRecommendId(null);
      return;
    }

    const refreshed = await getLecturerAssignedQuestions();
    setQuestions(refreshed);
    setPendingRecommendId(null);
  };

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Lecturer Question Forum</h1>
        <p className="text-sm text-muted-foreground">
          Questions from your assigned modules, sorted by rank (upvotes + bounty).
        </p>
      </div>

      <LecturerInsights />

      {questions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No questions found in your assigned modules.
          </CardContent>
        </Card>
      ) : (
        questions.map((question) => {
          const rank = question.upvotes + question.bounty;

          return (
            <Card key={question.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-tight">
                  <Link href={`/qna/${question.id}`} className="hover:text-primary">
                    {question.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{question.content}</p>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="secondary">{question.module.code}</Badge>
                  <Badge variant="outline">Rank: {rank}</Badge>
                  <span className="text-muted-foreground">
                    {question.upvotes} upvotes • {question.bounty} bounty
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRecommend(question.id)}
                    disabled={pendingRecommendId === question.id}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    {pendingRecommendId === question.id ? 'Recommending...' : 'Lecturer Recommend'}
                  </Button>
                  <Link href={`/qna/${question.id}`}>
                    <Button size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" /> Comment
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default LecturerPage;
