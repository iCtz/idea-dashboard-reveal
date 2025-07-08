"use client";

import { useState } from "react";
import type { Session } from "next-auth";
import { Idea, Profile, Evaluation } from "@/types/types";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SubmitterDashboard } from "./SubmitterDashboard";
import { EvaluatorDashboard } from "./EvaluatorDashboard";
import { ManagementDashboard } from "./ManagementDashboard";
import { ProfileSetup } from "./ProfileSetup";

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
  const [activeView, setActiveView] = useState("dashboard");

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

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
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header profile={profile} />
        <main className="flex-1 p-6">{renderDashboardByRole()}</main>
      </div>
    </div>
  );
}
