
import { useEffect, useState } from "react";
// import { User } from "@supabase/supabase-js";
import type { Session } from "next-auth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SubmitterDashboard } from "./SubmitterDashboard";
import { EvaluatorDashboard } from "./EvaluatorDashboard";
import { ManagementDashboard } from "./ManagementDashboard";
import { ProfileSetup } from "./ProfileSetup";
import { useToast } from "@/hooks/use-toast";
import { seedSampleData } from "@/utils/sampleDataSeeder";

type Profile = Tables<"profiles">;

type DashboardProps = {
  user: Session["user"];
}

export function Dashboard({ user }: DashboardProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const { toast } = useToast();

  // useEffect(() => {
  //   fetchProfile();
  // }, [user.id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setProfile(data);

      // Seed sample data if this is a test user and profile exists
      if (data && data.role) {
        setTimeout(() => {
          seedSampleData();
        }, 1000);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile || !profile.role) {
    return <ProfileSetup user={user} onProfileUpdate={handleProfileUpdate} />;
  }

  const renderDashboard = () => {
    switch (profile.role) {
      case "submitter":
        return <SubmitterDashboard profile={profile} activeView={activeView} />;
      case "evaluator":
        return <EvaluatorDashboard profile={profile} activeView={activeView} />;
      case "management":
        return <ManagementDashboard profile={profile} activeView={activeView} />;
      default:
        return <SubmitterDashboard profile={profile} activeView={activeView} />;
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
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
};
