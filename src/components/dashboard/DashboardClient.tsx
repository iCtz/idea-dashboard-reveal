"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SubmitterDashboard } from "./SubmitterDashboard";
import { EvaluatorDashboard } from "./EvaluatorDashboard";
import { ManagementDashboard } from "./ManagementDashboard";
import { ProfileSetup } from "./ProfileSetup";
import type { Idea, Profile, Evaluation, User } from "@prisma/client";
import { forceSeedSampleData } from "@/utils/sampleDataSeeder";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database } from "lucide-react";
import type { EvaluatorDashboardData } from "@/app/dashboard/actions";

interface DashboardClientProps {
  user: User;
  profile: Profile | null;
  evaluatorData: EvaluatorDashboardData | null;
  allIdeas: Idea[];
  userCount: number;
}

export function DashboardClient({
  user,
  profile: initialProfile,
  evaluatorData,
  allIdeas,
  userCount,
}: Readonly<DashboardClientProps>) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  const handleForceSeed = async () => {
    setSeeding(true);
    setLoading(true);

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
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If the profile is not set up, force the user to complete it.
  if (!profile?.role) {
    return <ProfileSetup user={user} profile={profile} onProfileUpdate={handleProfileUpdate} />;
  }

  const renderDashboardByRole = () => {
    // The user object from the session is the source of truth for the role.
    const userRole = user.role || profile.role;

    switch (userRole) {
      case "evaluator":
        return (
          <EvaluatorDashboard
            user={user}
            profile={profile}
            evaluatorData={evaluatorData}
            activeView={activeView}
          />
        );
      case "management":
        return (
          <ManagementDashboard/>
        );
      default:
        return (
          <SubmitterDashboard
            profile={profile}
            activeView={activeView}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        profile={profile}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <div className="flex-1 flex flex-col">
        <Header profile={profile} />
        <main className="flex-1 p-6">
          {/* Sample Data Seeding Button */}
          <div className="mb-4 flex justify-end">
            <Button
              onClick={handleForceSeed}
              disabled={seeding}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              {seeding ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              <span>{seeding ? t('dashboard', 'seeding') : t('dashboard', 'seed_sample_data')}</span>
            </Button>
          </div>

          {renderDashboardByRole()}
        </main>
      </div>
    </div>
  );
}
