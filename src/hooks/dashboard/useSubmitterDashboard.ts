import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { SubmitterDashboardData } from "@/app/dashboard/actions";

  const initialData: SubmitterDashboardData = {
  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  },
  ideas: [],
};

export const useSubmitterDashboard = (data: SubmitterDashboardData | null) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<SubmitterDashboardData>(data || initialData);
  const { t } = useLanguage();

  useEffect(() => {
    if (data) {
      setDashboardData(data);
    }
    setLoading(false);
  }, [data]);

  return { loading, dashboardData, t };
};
