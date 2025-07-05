// src/components/dashboard/DashboardPage.tsx

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ManagementDashboard } from './ManagementDashboard';
import { SubmitterDashboard } from './SubmitterDashboard';
import { EvaluatorDashboard } from './EvaluatorDashboard';
import { ProfileSetup } from './ProfileSetup';
import { BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Session } from 'inspector';
import { User, Profile } from 'next-auth';
import { Database } from '@/integrations/supabase/types';

interface DashboardPageProps {
  user: Session['user'];
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const { toast } = useToast();

  return (
    <div className="flex h-screen">
      <Sidebar user={user} activeView={activeView} onViewChange={setActiveView}/>
      <div className="flex-1 overflow-y-auto">
        <Header user={user} />
        <div className="p-4">
          <BreadcrumbPage>
            <span>Dashboard</span>
          </BreadcrumbPage>
          <div className="mt-4">
            {user.role === 'management' ? (
              <ManagementDashboard user={user} activeView={activeView} />
            ) : user.role === 'submitter' ? (
              <SubmitterDashboard user={user} activeView={activeView} />
            ) : user.role === 'evaluator' ? (
              <EvaluatorDashboard user={user} activeView={activeView} />
            ) : (
              <ProfileSetup user={user} onProfileUpdate={function (profile: { created_at: string | null; department: string | null; email: string | null; full_name: string | null; id: string; role: Database['public']['Enums']['user_role']; updated_at: string | null; }): void {
										  throw new Error('Function not implemented.');
									  } } />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
