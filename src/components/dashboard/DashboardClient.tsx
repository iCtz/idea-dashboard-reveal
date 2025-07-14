"use client";

import { useState } from "react";
import type { Session } from "next-auth";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SubmitterDashboard } from "./SubmitterDashboard";
import { EvaluatorDashboard } from "./EvaluatorDashboard";
import { ManagementDashboard } from "./ManagementDashboard";
import { ProfileSetup } from "./ProfileSetup";
import type { Idea, Profile, Evaluation, User } from "@prisma/client";
import { seedSampleData, forceSeedSampleData } from "@/utils/sampleDataSeeder";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database } from "lucide-react";

interface DashboardProps {
  user: User;
}

interface DashboardClientProps {
  user: Session["user"];
  profile: Profile | null;
  ideas: Idea[];
  evaluations: Evaluation[];
  allIdeas: Idea[];
  userCount: number;
}

export function DashboardClient({
  user,
  profile: initialProfile,
  ideas,
  evaluations,
  allIdeas,
  userCount,
}: DashboardClientProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const { toast } = useToast();
  const { t } = useLanguage();


  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  const handleForceSeed = async () => {
    setSeeding(true);
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
  if (!profile || !profile.role) {
    return <ProfileSetup user={user} onProfileUpdate={handleProfileUpdate} />;
  }

  const renderDashboardByRole = () => {
    // The user object from the session is the source of truth for the role.
    const userRole = user.role || profile.role;

    switch (userRole) {
      case "submitter":
        return (
          <SubmitterDashboard
            user={user}
            profile={profile}
            initialIdeas={ideas}
            activeView={activeView}
          />
        );
      case "evaluator":
        return (
          <EvaluatorDashboard
            user={user}
            profile={profile}
            pendingIdeas={ideas}
            evaluations={evaluations}
            activeView={activeView}
          />
        );
      case "management":
        return (
          <ManagementDashboard
            user={user}
            allIdeas={allIdeas}
            userCount={userCount}
            activeView={activeView}
          />
        );
      default:
        return (
          <SubmitterDashboard
            user={user}
            profile={profile}
            initialIdeas={ideas}
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
