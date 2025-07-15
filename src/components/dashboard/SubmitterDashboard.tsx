
import { useMemo } from "react";
import type { Idea, Profile } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { IdeaSubmissionForm } from "./IdeaSubmissionForm";
import { IdeaCard } from "./IdeaCard";
import { Session } from "next-auth";

interface SubmitterDashboardProps {
  user: Session['user'];
  profile: Profile;
  initialIdeas: Idea[];
  activeView: string;
}

export const SubmitterDashboard: React.FC<SubmitterDashboardProps> = ({ user, profile, initialIdeas, activeView }) => {
  // The ideas are now passed as props, no need for local state to hold them.
  const ideas = initialIdeas;

  // Calculate stats based on the initialIdeas prop.
  // useMemo ensures this expensive calculation only runs when ideas change.
  const stats = useMemo(() => {
    return {
      total: ideas.length,
      pending: ideas.filter(idea => ["submitted", "under_review"].includes(idea.status)).length,
      approved: ideas.filter(idea => idea.status === "approved").length,
      rejected: ideas.filter(idea => idea.status === "rejected").length,
    };
  }, [ideas]);

  // After submitting an idea, we no longer need to fetch.
  // The server action will revalidate the path, and Next.js will re-render with fresh data.
  const handleIdeaSubmitted = () => {
    // This function is kept for prop consistency but the main logic
    // is now handled by server-side revalidation.
  };

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Ideas</CardTitle>
          <CardDescription>Your latest idea submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {ideas.length > 0 ? (
            <div className="space-y-4">
              {ideas.slice(0, 5).map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No ideas yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by submitting your first idea.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderMyIdeas = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Ideas</h2>
        <Badge variant="secondary">{ideas.length} total</Badge>
      </div>

      {ideas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} detailed />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Lightbulb className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No ideas submitted yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Start by submitting your first innovative idea to the platform.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  switch (activeView) {
    case "submit":
      return <IdeaSubmissionForm profile={profile} onIdeaSubmitted={handleIdeaSubmitted} />;
    case "my-ideas":
      return renderMyIdeas();
    case "ideas":
      return renderMyIdeas();
    default:
      return renderDashboardOverview();
  }
};
