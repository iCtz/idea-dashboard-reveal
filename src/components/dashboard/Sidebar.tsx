
import { 
  LayoutDashboard, 
  Lightbulb, 
  ClipboardCheck, 
  BarChart3, 
  Users, 
  Settings,
  LogOut,
  Plus
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
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">Spark Hub</h1>
        <p className="text-sm text-gray-600 mt-1">{profile.full_name}</p>
        <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                activeView === item.id && "bg-blue-600 hover:bg-blue-700"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
