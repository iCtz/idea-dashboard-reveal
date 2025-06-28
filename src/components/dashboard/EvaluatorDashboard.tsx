
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Star, TrendingUp, Users } from "lucide-react";

type Profile = Tables<"profiles">;
type Idea = Tables<"ideas">;

interface EvaluatorDashboardProps {
  profile: Profile;
  activeView: string;
}

export const EvaluatorDashboard = ({ profile, activeView }: EvaluatorDashboardProps) => {
  const [pendingIdeas, setPendingIdeas] = useState<Idea[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    evaluated: 0,
    avgScore: 0,
    topRated: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingIdeas();
    fetchEvaluatorStats();
  }, [profile.id]);

  const fetchPendingIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .in("status", ["submitted", "under_review"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingIdeas(data || []);
    } catch (error) {
      console.error("Error fetching pending ideas:", error);
    }
  };

  const fetchEvaluatorStats = async () => {
    try {
      const { data: evaluations, error } = await supabase
        .from("evaluations")
        .select("*")
        .eq("evaluator_id", profile.id);

      if (error) throw error;

      const avgScore = evaluations?.length 
        ? evaluations.reduce((sum, eval) => sum + (eval.overall_score || 0), 0) / evaluations.length
        : 0;

      const topRated = evaluations?.filter(eval => (eval.overall_score || 0) >= 8).length || 0;

      setStats({
        pending: pendingIdeas.length,
        evaluated: evaluations?.length || 0,
        avgScore: Math.round(avgScore * 10) / 10,
        topRated,
      });
    } catch (error) {
      console.error("Error fetching evaluator stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluated</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.evaluated}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score Given</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.avgScore}/10</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Rated Ideas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.topRated}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Evaluations</CardTitle>
          <CardDescription>Ideas waiting for your review</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : pendingIdeas.length > 0 ? (
            <div className="space-y-4">
              {pendingIdeas.slice(0, 5).map((idea) => (
                <div key={idea.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h3 className="font-medium">{idea.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{idea.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">{idea.category.replace("_", " ")}</Badge>
                      <Badge variant="secondary">{idea.status.replace("_", " ")}</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(idea.created_at!).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending evaluations</h3>
              <p className="mt-1 text-sm text-gray-500">All ideas have been reviewed.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return renderDashboardOverview();
};
