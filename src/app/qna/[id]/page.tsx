'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronUp, CheckCircle2, MessageCircle, Loader2 } from 'lucide-react';
import { getQuestionById, type QuestionDetail } from '@/actions/qna.actions';

export default function QuestionDetail() {
  const params = useParams();
  const id = params.id as string;

  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestion() {
      const data = await getQuestionById(id);
      setQuestion(data);
      setIsLoading(false);
    }
    fetchQuestion();
  }, [id]);

  if (isLoading)
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  if (!question)
    return (
      <div className="p-6 text-center text-muted-foreground">Question not found in database.</div>
    );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="space-y-6">
        {/* Main Question Card */}
        <Card>
          <CardContent className="p-4 md:p-6 flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <ChevronUp className="h-6 w-6" />
              </button>
              <span className="text-lg font-bold">{question.upvotes}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-lg md:text-xl font-bold mb-3">{question.title}</h1>
              <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">
                {question.content}
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary">{question.module.code}</Badge>
                {question.bounty > 0 && (
                  <Badge className="bg-orange-500">💰 {question.bounty} pts</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Asked by {question.author.name}</p>
            </div>
          </CardContent>
        </Card>

        {/* Answers Section */}
        <h3 className="font-semibold flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          {question.answers.length} Answers
        </h3>

        {question.answers.map((answer) => (
          <Card key={answer.id} className={answer.isVerified ? 'ring-2 ring-success' : ''}>
            <CardContent className="p-4 md:p-6 flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <span className="font-semibold">{answer.upvotes}</span>
              </div>
              <div className="flex-1">
                {answer.isVerified && (
                  <Badge className="bg-success text-success-foreground text-xs gap-1 mb-2">
                    <CheckCircle2 className="h-3 w-3" /> Lecturer Verified
                  </Badge>
                )}
                <p className="text-sm whitespace-pre-wrap">{answer.content}</p>
                <p className="text-xs text-muted-foreground mt-3">
                  Answered by {answer.author.name}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Reply Box */}
        <Card>
          <CardContent className="p-4 md:p-6 space-y-4">
            <h3 className="font-semibold">Your Answer</h3>
            <Textarea placeholder="Write your answer..." rows={4} />
            <Button>Post Answer</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
