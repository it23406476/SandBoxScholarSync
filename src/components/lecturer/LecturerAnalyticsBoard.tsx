'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { getLecturerAnalyticsData, type LecturerAnalyticsData } from '@/actions/lecturer.actions';

export function LecturerAnalyticsBoard() {
  const [data, setData] = useState<LecturerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    const result = await getLecturerAnalyticsData();
    if (!result.success) {
      setError(result.message);
      return;
    }

    setData(result.data);
    setError(null);
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      setLoading(true);
      await fetchAnalytics();
      if (active) {
        setLoading(false);
      }
    }

    init();

    const timer = setInterval(
      () => {
        fetchAnalytics();
      },
      3 * 60 * 1000
    );

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading analytics...
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          {error ?? 'Unable to load analytics.'}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Questions Per Module</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.questionsPerModule.length === 0 ? (
              <p className="text-sm text-muted-foreground">No questions yet.</p>
            ) : (
              data.questionsPerModule.map((item) => (
                <div key={item.moduleId} className="flex items-center justify-between text-sm">
                  <span>
                    {item.moduleCode} - {item.moduleName}
                  </span>
                  <Badge>{item.questionCount}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Popular Tags</CardTitle>
          </CardHeader>
          <CardContent>
            {data.popularTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tags yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.popularTags.map((tag) => (
                  <Badge key={tag.tag} variant="outline">
                    {tag.tag} ({tag.count})
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Participation Trend (Weekly)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.participationTrend.map((trend) => (
              <div key={trend.weekStart} className="flex items-center justify-between text-sm">
                <span>{trend.weekStart}</span>
                <span className="text-muted-foreground">
                  Q: {trend.questions} | A: {trend.answers} | Total: {trend.total}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Contributors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topContributors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contributors yet.</p>
            ) : (
              data.topContributors.map((contributor) => (
                <div
                  key={contributor.userId}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{contributor.name}</p>
                    <p className="text-xs text-muted-foreground">{contributor.role}</p>
                  </div>
                  <Badge>
                    {contributor.questionsCount}Q / {contributor.answersCount}A
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
