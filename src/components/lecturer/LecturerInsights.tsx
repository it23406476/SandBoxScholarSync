'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getLecturerAnalyticsData,
  getLecturerAnswerRateData,
  getLecturerDashboardData,
  type LecturerAnalyticsData,
  type LecturerAnswerRateData,
  type LecturerDashboardData,
} from '@/actions/lecturer.actions';
import { Loader2 } from 'lucide-react';

type DashboardState = {
  dashboard: LecturerDashboardData | null;
  answerRate: LecturerAnswerRateData | null;
  analytics: LecturerAnalyticsData | null;
  error: string | null;
  loading: boolean;
};

const initialState: DashboardState = {
  dashboard: null,
  answerRate: null,
  analytics: null,
  error: null,
  loading: true,
};

export function LecturerInsights() {
  const [state, setState] = useState<DashboardState>(initialState);

  const loadInsights = useCallback(async () => {
    const [dashboardResult, answerRateResult, analyticsResult] = await Promise.all([
      getLecturerDashboardData(),
      getLecturerAnswerRateData(),
      getLecturerAnalyticsData(),
    ]);

    if (!dashboardResult.success) {
      setState({
        ...initialState,
        loading: false,
        error: dashboardResult.message,
      });
      return;
    }

    if (!answerRateResult.success) {
      setState({
        ...initialState,
        loading: false,
        error: answerRateResult.message,
      });
      return;
    }

    if (!analyticsResult.success) {
      setState({
        ...initialState,
        loading: false,
        error: analyticsResult.message,
      });
      return;
    }

    setState({
      dashboard: dashboardResult.data,
      answerRate: answerRateResult.data,
      analytics: analyticsResult.data,
      error: null,
      loading: false,
    });
  }, []);

  useEffect(() => {
    let active = true;
    const initialTimer = window.setTimeout(() => {
      if (!active) return;
      loadInsights().catch((error) => {
        console.error('Failed to load lecturer insights:', error);
      });
    }, 0);

    const timer = setInterval(
      () => {
        if (!active) return;
        loadInsights().catch((error) => {
          console.error('Failed to refresh lecturer insights:', error);
        });
      },
      3 * 60 * 1000
    );

    return () => {
      active = false;
      clearTimeout(initialTimer);
      clearInterval(timer);
    };
  }, [loadInsights]);

  if (state.loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading lecturer insights...
        </CardContent>
      </Card>
    );
  }

  if (state.error || !state.dashboard || !state.answerRate || !state.analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          {state.error ?? 'Failed to load lecturer insights.'}
        </CardContent>
      </Card>
    );
  }

  const topTags = state.analytics.popularTags.slice(0, 5);
  const topContributors = state.analytics.topContributors.slice(0, 5);
  const moduleBreakdown = state.answerRate.byModule.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Assigned Modules" value={state.dashboard.modulesCount.toString()} />
        <MetricCard
          title="Assigned Questions"
          value={state.dashboard.assignedQuestionsCount.toString()}
        />
        <MetricCard
          title="Answered by You"
          value={state.dashboard.answeredQuestionsCount.toString()}
        />
        <MetricCard title="Answer Rate" value={`${state.answerRate.answerRatePercent}%`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Answer Rate by Module</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {moduleBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No module activity yet.</p>
            ) : (
              moduleBreakdown.map((item) => (
                <div
                  key={item.moduleId}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{item.moduleCode}</p>
                    <p className="text-xs text-muted-foreground">{item.moduleName}</p>
                  </div>
                  <Badge variant="secondary">
                    {item.answeredQuestions}/{item.totalQuestions} ({item.answerRatePercent}%)
                  </Badge>
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
            {topTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tags available yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topTags.map((tag) => (
                  <Badge key={tag.tag} variant="outline">
                    {tag.tag} ({tag.count})
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Contributors</CardTitle>
        </CardHeader>
        <CardContent>
          {topContributors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No contributions in assigned modules yet.
            </p>
          ) : (
            <div className="space-y-2">
              {topContributors.map((contributor) => (
                <div
                  key={contributor.userId}
                  className="flex items-center justify-between gap-2 rounded-md border p-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">{contributor.name}</p>
                    <p className="text-xs text-muted-foreground">{contributor.role}</p>
                  </div>
                  <Badge>
                    {contributor.questionsCount}Q / {contributor.answersCount}A
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
