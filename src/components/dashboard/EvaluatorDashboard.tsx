import { useState, useEffect, useMemo, useCallback } from "react";
import type { Idea, Profile, Evaluation, User } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Eye, Star, Clock, CheckCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { EvaluationForm } from "./EvaluationForm";
import { type EvaluatorDashboardData } from "@/app/dashboard/actions";

interface EvaluatorDashboardProps {
  user: User;
  profile: Profile;
  evaluatorData: EvaluatorDashboardData | null;
  activeView: string;
}

export const EvaluatorDashboard: React.FC<EvaluatorDashboardProps> = ({ user, profile, evaluatorData, activeView }) => {
const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const { t, isRTL } = useLanguage();
  const { ideasForEvaluation = [], myEvaluations: evaluations = [] } = evaluatorData || {};

  // This is now just for simulating a loading state on initial render.
  useEffect(() => {
    setLoading(false);
  }, []);

  const handleEvaluationSubmitted = () => {
    setShowEvaluationForm(false);
    setSelectedIdea(null);
    // Data will be re-fetched by the server component on the next page load
    // due to revalidatePath in the server action.
    // For an immediate UI update, you might consider a client-side state update here.
  };

  const handleEvaluateIdea = (idea: Idea) => {
    setSelectedIdea(idea);
    setShowEvaluationForm(true);
  };

  const evaluatedIdeaIds = useMemo(() => {
    return new Set(evaluations.map(e => e.idea_id));
  }, [evaluations]);

  const isIdeaEvaluated = useCallback((ideaId: string) => {
    return evaluatedIdeaIds.has(ideaId);
  }, [evaluatedIdeaIds]);


  const stats = useMemo(() => {
    const pendingIdeas = ideasForEvaluation.filter(ideasForEvaluation => !isIdeaEvaluated(ideasForEvaluation.id));
    const evaluatedIdeas = ideasForEvaluation.filter(ideasForEvaluation => isIdeaEvaluated(ideasForEvaluation.id));

    return {
      total: ideasForEvaluation.length,
      pending: pendingIdeas.length,
      evaluated: evaluatedIdeas.length,
      totalEvaluations: evaluations.length,

    };
  }, [ideasForEvaluation, evaluations, isIdeaEvaluated]);

  if (showEvaluationForm && selectedIdea) {
    return (
      <EvaluationForm
        idea={selectedIdea}
        profile={profile}
        onEvaluationSubmitted={handleEvaluationSubmitted}
      />
    );
  }

  const renderIdeasContent = () => {
    if (loading) {
      return <div className="text-center py-8">{t('common', 'loading')}</div>;
    }

    if (ideasForEvaluation.length === 0) {
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">{t('dashboard', 'no_ideas_assigned')}</p>
            <p className="text-muted-foreground">
              {t('dashboard', 'evaluate') ?? 'Evaluate Idea'}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {ideasForEvaluation.map((idea) => {
          const isEvaluated = isIdeaEvaluated(idea.id);
          return (
            <Card key={idea.id} className={isEvaluated ? "opacity-75" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{idea.title}</h3>
                      {idea.idea_reference_code && (
                        <Badge variant="outline" className="text-xs font-mono">
                          {idea.idea_reference_code}
                        </Badge>
                      )}
                      {isEvaluated && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t('dashboard', 'evaluated')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {idea.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline">
                          {idea.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      {idea.submitted_at && (
                        <span>
                          {t('dashboard', 'submitted_at')}: {new Date(idea.submitted_at).toLocaleDateString()}
                        </span>
                      )}
                      {idea.average_evaluation_score && idea.average_evaluation_score.toNumber() > 0.0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{idea.average_evaluation_score.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isEvaluated && (
                      <Button
                        onClick={() => handleEvaluateIdea(idea)}
                        className="gap-2"
                      >
                        <ClipboardCheck className="h-4 w-4" />
                        {t('dashboard', 'evaluate')}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      {t('dashboard', 'view_details')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className={`text-3xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('dashboard', 'evaluator_dashboard')}
          </h1>
          <p className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('dashboard', 'review_evaluate_ideas')}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
              <div>

                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{t('dashboard', 'ideas_to_review')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>

                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">{t('dashboard', 'pending_evaluation')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">

              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>

                <p className="text-2xl font-bold">{stats.evaluated}</p>
                <p className="text-xs text-muted-foreground">{t('dashboard', 'evaluated_today')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">

              <Star className="h-5 w-5 text-yellow-600" />
              <div>

                <p className="text-2xl font-bold">{stats.totalEvaluations}</p>
                <p className="text-xs text-muted-foreground">{t('dashboard', 'total_evaluations')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ideas List */}
      <div>
        <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('dashboard', 'ideas_for_evaluation')}
        </h2>

        {renderIdeasContent()}
      </div>
    </div>
  );

  return renderDashboardOverview();
};
