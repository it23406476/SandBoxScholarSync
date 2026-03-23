'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronUp, ChevronDown, CheckCircle2, MessageCircle, Loader2 } from 'lucide-react';
import {
  addAnswer,
  getQuestionById,
  getSimilarQuestionsByModule,
  voteAnswer,
  voteQuestion,
  type QuestionDetail,
  type RankedQuestion,
} from '@/actions/qna.actions';
import { useAuthStore } from '@/lib/store';

export default function QuestionDetail() {
  const params = useParams();
  const id = params.id as string;
  const currentUserEmail = useAuthStore((state) => state.currentUser.email);

  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [similarQuestions, setSimilarQuestions] = useState<RankedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const refreshQuestion = useCallback(async () => {
    const data = await getQuestionById(id);
    setQuestion(data);

    if (data) {
      const similar = await getSimilarQuestionsByModule(data.moduleId, data.id);
      setSimilarQuestions(similar);
    }
  }, [id]);

  useEffect(() => {
    async function fetchQuestion() {
      await refreshQuestion();
      setIsLoading(false);
    }
    fetchQuestion();
  }, [refreshQuestion]);

  const handleVoteQuestion = async (direction: 'up' | 'down') => {
    if (!question) return;
    const result = await voteQuestion(question.id, direction, currentUserEmail);
    if (!result.success) {
      alert(result.message ?? 'Unable to cast vote.');
      return;
    }
    await refreshQuestion();
  };

  const handleVoteAnswer = async (answerId: string, direction: 'up' | 'down') => {
    await voteAnswer(answerId, direction);
    await refreshQuestion();
  };

  const handlePostAnswer = async () => {
    if (!question || !answerText.trim()) return;

    setIsSubmittingAnswer(true);
    const result = await addAnswer({
      questionId: question.id,
      content: answerText,
      authorEmail: currentUserEmail,
    });

    if (!result.success) {
      alert(result.message ?? 'Failed to post answer.');
      setIsSubmittingAnswer(false);
      return;
    }

    setAnswerText('');
    await refreshQuestion();
    setIsSubmittingAnswer(false);
  };

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
    <div className="p-4 md:p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Main Question Card */}
          <Card>
            <CardContent className="p-4 md:p-6 flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleVoteQuestion('up')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Upvote question"
                >
                  <ChevronUp className="h-6 w-6" />
                </button>
                <span className="text-lg font-bold">{question.upvotes}</span>
                <button
                  onClick={() => handleVoteQuestion('down')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Downvote question"
                >
                  <ChevronDown className="h-6 w-6" />
                </button>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Posted on {new Date(question.createdAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Discussion Thread */}
          <h3 className="font-semibold flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {question.answers.length} Comments / Answers
          </h3>

          {question.answers.map((answer) => (
            <Card key={answer.id} className={answer.isVerified ? 'ring-2 ring-success' : ''}>
              <CardContent className="p-4 md:p-6 flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleVoteAnswer(answer.id, 'up')}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Upvote answer"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <span className="font-semibold">{answer.upvotes}</span>
                  <button
                    onClick={() => handleVoteAnswer(answer.id, 'down')}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Downvote answer"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(answer.createdAt).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Reply Box */}
          <Card>
            <CardContent className="p-4 md:p-6 space-y-4">
              <h3 className="font-semibold">Your Answer</h3>
              <Textarea
                placeholder="Write your answer..."
                rows={4}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
              />
              <Button
                onClick={handlePostAnswer}
                disabled={isSubmittingAnswer || !answerText.trim()}
              >
                {isSubmittingAnswer ? 'Posting...' : 'Post Answer'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-sm">Similar Questions</h3>
              {similarQuestions.length > 0 ? (
                <ul className="space-y-2">
                  {similarQuestions.map((item) => (
                    <li key={item.id}>
                      <Link href={`/qna/${item.id}`} className="text-sm hover:text-primary">
                        {item.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {item.upvotes} votes • {item.answers.length} answers
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No similar questions yet.</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
