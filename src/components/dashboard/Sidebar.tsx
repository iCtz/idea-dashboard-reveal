
import { 
  LayoutDashboard, 
  Lightbulb, 
  ClipboardCheck, 
  BarChart3, 
  Users, 
  Settings,
  LogOut,
  Plus,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type Profile = Tables<"profiles">;

interface SidebarProps {
  profile: Profile;
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ profile, activeView, onViewChange }: SidebarProps) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const getNavigationItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "ideas", label: "Ideas", icon: Lightbulb },
    ];

    switch (profile.role) {
      case "submitter":
        return [
          ...baseItems,
          { id: "submit", label: "Submit Idea", icon: Plus },
          { id: "my-ideas", label: "My Ideas", icon: ClipboardCheck },
        ];
      case "evaluator":
        return [
          ...baseItems,
          { id: "pending-evaluations", label: "Pending Reviews", icon: ClipboardCheck },
          { id: "analytics", label: "Analytics", icon: BarChart3 },
        ];
      case "management":
        return [
          ...baseItems,
          { id: "analytics", label: "Analytics", icon: BarChart3 },
          { id: "users", label: "Users", icon: Users },
          { id: "settings", label: "Settings", icon: Settings },
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="w-64 bg-sidebar shadow-xl flex flex-col border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-sidebar-primary rounded-xl">
            <Zap className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground font-poppins">YOU</h1>
            <p className="text-sm text-sidebar-foreground/80 font-medium">Innovation Hub</p>
          </div>
        </div>
        <div className="bg-sidebar-accent/20 rounded-lg p-3">
          <p className="text-sm font-medium text-sidebar-foreground">{profile.full_name}</p>
          <p className="text-xs text-sidebar-foreground/70 capitalize">{profile.role}</p>
          {profile.department && (
            <p className="text-xs text-sidebar-foreground/60">{profile.department}</p>
          )}
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-12 font-medium transition-all duration-200",
                activeView === item.id 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-sidebar-border/20">
        <Button
          variant="ghost"
          className="w-full justify-start h-12 text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
