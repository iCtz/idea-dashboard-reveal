"use client";

import type { Profile } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { IdeaSubmissionForm } from "./IdeaSubmissionForm";
import { IdeaCard } from "./IdeaCard";
import { type SubmitterDashboardData } from "@/app/dashboard/actions";
import { useSubmitterDashboard } from "@/hooks/dashboard/useSubmitterDashboard";

interface SubmitterDashboardProps {
  profile: Profile;
  activeView: string;
  // Use a more specific type that reflects the serialized data
  submitterData: SubmitterDashboardData | null;
}

export const SubmitterDashboard: React.FC<SubmitterDashboardProps> = ({ profile, activeView, submitterData }) => {
  const {
    loading,
    dashboardData,
    t,
  } = useSubmitterDashboard(submitterData);

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard', 'total_ideas')}</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard', 'under_review')}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{dashboardData.stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard', 'approved')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardData.stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard', 'success_rate')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData.stats.total > 0 ? Math.round((dashboardData.stats.approved / dashboardData.stats.total) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard', 'recent_ideas')}</CardTitle>
          <CardDescription>{t('dashboard', 'latest_submissions')}</CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            if (loading) {
              return (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              );
            }

            if (dashboardData.ideas.length > 0) {
              return (
                <div className="space-y-4">
                  {dashboardData.ideas.slice(0, 5).map((idea) => (
                    <IdeaCard key={idea.id} idea={idea} />
                  ))}
                </div>
              );
            }

            return (
              <div className="text-center py-8">
                <Lightbulb className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('common', 'no_ideas_yet')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('common', 'get_started_submitting')}</p>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );

  const renderMyIdeas = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('dashboard', 'my_ideas_title')}</h2>
        <Badge variant="secondary">{dashboardData.ideas.length} {t('dashboard', 'total_count')}</Badge>
      </div>

      {(() => {
        if (loading) {
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          );
        }

        if (dashboardData.ideas.length > 0) {
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.ideas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} detailed />
              ))}
            </div>
          );
        }

        return (
          <Card>
            <CardContent className="text-center py-12">
              <Lightbulb className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">{t('dashboard', 'no_ideas_submitted')}</h3>
              <p className="mt-2 text-sm text-gray-500">
                {t('dashboard', 'start_submitting')}
              </p>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );

  switch (activeView) {
    case "submit":
      return <IdeaSubmissionForm profile={profile} onIdeaSubmitted={() => { /* Re-fetch handled by server */ }} />;
    case "my-ideas":
      return renderMyIdeas();
    case "ideas":
      return renderMyIdeas();
    default:
      return renderDashboardOverview();
  }
};
