import { useState, useEffect, useMemo, useCallback } from "react";
import type { Idea } from "@prisma/client";
import { useLanguage } from "@/hooks/useLanguage";
import type { EvaluatorDashboardData } from "@/app/dashboard/actions";

export const useEvaluatorDashboard = (data: EvaluatorDashboardData | null) => {
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const { t, isRTL } = useLanguage();

  const { ideasForEvaluation = [], myEvaluations: evaluations = [] } = data || {};

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleEvaluationSubmitted = useCallback(() => {
    setShowEvaluationForm(false);
    setSelectedIdea(null);
    // Data will be re-fetched by the server component on the next page load
    // due to revalidatePath in the server action.
  }, []);

  const handleEvaluateIdea = useCallback((idea: Idea) => {
    setSelectedIdea(idea);
    setShowEvaluationForm(true);
  }, []);

  const evaluatedIdeaIds = useMemo(() => {
    return new Set(evaluations.map((e) => e.idea_id));
  }, [evaluations]);

  const isIdeaEvaluated = useCallback(
    (ideaId: string) => evaluatedIdeaIds.has(ideaId),
    [evaluatedIdeaIds]
  );

  const stats = useMemo(() => {
    const pendingIdeas = ideasForEvaluation.filter((idea) => !isIdeaEvaluated(idea.id));
    const evaluatedIdeas = ideasForEvaluation.filter((idea) => isIdeaEvaluated(idea.id));

    return {
      total: ideasForEvaluation.length,
      pending: pendingIdeas.length,
      evaluated: evaluatedIdeas.length,
      totalEvaluations: evaluations.length,
    };
  }, [ideasForEvaluation, evaluations, isIdeaEvaluated]);

  return { loading, selectedIdea, showEvaluationForm, t, isRTL, ideasForEvaluation, evaluations, handleEvaluationSubmitted, handleEvaluateIdea, isIdeaEvaluated, stats };
};
