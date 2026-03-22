'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ChevronUp } from 'lucide-react';
import type { RankedQuestion } from '@/actions/qna.actions';
import { Button } from '@/components/ui/button';

export function QuestionCard({
  question,
  showActions = false,
  onEdit,
  onDelete,
}: {
  question: RankedQuestion;
  showActions?: boolean;
  onEdit?: (question: RankedQuestion) => void;
  onDelete?: (question: RankedQuestion) => void;
}) {
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer mb-3">
      <Link href={`/qna/${question.id}`}>
        <CardContent className="p-4 flex gap-4">
          {/* Upvotes Column */}
          <div className="flex flex-col items-center gap-1 min-w-12">
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold text-lg">{question.upvotes}</span>
          </div>

          {/* Content Column */}
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {question.title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2">{question.content}</p>

            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{question.module.code}</Badge>

              {question.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}

              {/* THE BOUNTY BADGE */}
              {question.bounty > 0 && (
                <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
                  💰 {question.bounty} pts
                </Badge>
              )}

              <div className="flex items-center gap-1 ml-auto">
                <MessageCircle className="h-3 w-3" />
                <span>{question.answers?.length || 0} answers</span>
                <span className="mx-1">•</span>
                <span>{question.author.name}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>

      {showActions && (
        <div className="px-4 pb-4 flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit?.(question);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete?.(question);
            }}
          >
            Delete
          </Button>
        </div>
      )}
    </Card>
  );
}
