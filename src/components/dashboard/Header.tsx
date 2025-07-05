
import { Search, Bell, Filter, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Profile } from "@/lib/types";

interface HeaderProps {
  profile: Profile;
}

export const Header = ({ profile }: HeaderProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'submitter':
        return 'bg-you-blue';
      case 'evaluator':
        return 'bg-you-green';
      case 'management':
        return 'bg-you-orange';
      default:
        return 'bg-you-accent';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search ideas, users, or projects..."
              className="pl-10 pr-4 h-12 border-gray-300 focus:border-you-accent focus:ring-you-accent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 hover:bg-you-accent/20">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>

          <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-gray-800 hover:bg-you-accent/20">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-you-orange rounded-full"></span>
          </Button>

          <div className="flex items-center space-x-3">
            <Avatar className={`h-10 w-10 ${getRoleColor(profile.role || 'submitter')}`}>
              <AvatarFallback className="text-white font-semibold">
                {getInitials(profile.full_name || 'User')}
              </AvatarFallback>
            </Avatar>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{profile.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
