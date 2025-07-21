import { useState, useEffect, useCallback } from "react";
import type { Profile } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { forceSeedSampleData } from "@/utils/sampleDataSeeder";

export const useDashboardClient = (initialProfile: Profile | null) => {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleProfileUpdate = useCallback((updatedProfile: Profile) => {
    setProfile(updatedProfile);
  }, []);

  const handleForceSeed = useCallback(async () => {
    setSeeding(true);
    setLoading(true); // Also set loading to show a spinner for the whole page

    try {
      await forceSeedSampleData();
      toast({
        title: "Success",
        description: "Sample data has been seeded successfully!",
      });
    } catch (error) {
      console.error("Error seeding data:", error);
      toast({
        title: "Error",
        description: "Failed to seed sample data",
        variant: "destructive",
      });
    } finally {
      setSeeding(false);
      setLoading(false); // Reset loading state
    }
  }, [toast]);

  return { profile, loading, seeding, activeView, t, handleProfileUpdate, handleForceSeed, setActiveView };
};
