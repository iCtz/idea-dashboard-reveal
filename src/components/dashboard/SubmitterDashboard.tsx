
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { IdeaSubmissionForm } from "./IdeaSubmissionForm";
import { IdeaCard } from "./IdeaCard";

type Profile = Tables<"profiles">;
type Idea = Tables<"ideas">;

interface SubmitterDashboardProps {
  profile: Profile;
  activeView: string;
}

export const SubmitterDashboard = ({ profile, activeView }: SubmitterDashboardProps) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserIdeas();
  }, [profile.id]);

  const fetchUserIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("submitter_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setIdeas(data || []);
      
      const stats = {
        total: data?.length || 0,
        pending: data?.filter(idea => ["submitted", "under_review"].includes(idea.status)).length || 0,
        approved: data?.filter(idea => idea.status === "approved").length || 0,
        rejected: data?.filter(idea => idea.status === "rejected").length || 0,
      };
      
      setStats(stats);
    } catch (error) {
      console.error("Error fetching ideas:", error);
    } finally {
      setLoading(false);
    }
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
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : ideas.length > 0 ? (
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
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : ideas.length > 0 ? (
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
      return <IdeaSubmissionForm profile={profile} onIdeaSubmitted={fetchUserIdeas} />;
    case "my-ideas":
      return renderMyIdeas();
    case "ideas":
      return renderMyIdeas();
    default:
      return renderDashboardOverview();
  }
};
