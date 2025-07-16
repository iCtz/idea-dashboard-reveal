
import { Search, Bell, Filter, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import type { Profile } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/hooks/useLanguage";

interface HeaderProps {
  profile: Profile;
}

export const Header = ({ profile }: HeaderProps) => {
  const { t, isRTL } = useLanguage();									 
  const getInitials = (name: string) => {
    return (name || "")
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
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
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className={`absolute top-3 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              placeholder={t('header', 'search_placeholder')}
              className={`h-12 border-gray-300 focus:border-you-accent focus:ring-you-accent ${
                isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
              }`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
        </div>

        <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
          <LanguageSwitcher />
          
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 hover:bg-you-accent/20">
            <Filter className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
            {t('header', 'filter')}
          </Button>
          
          <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-gray-800 hover:bg-you-accent/20">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto h-2 w-2 bg-you-orange rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>				 
              <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                <Avatar className={`h-10 w-10 ${getRoleColor(profile.role || 'submitter')}`}>
                  <AvatarFallback className="text-white font-semibold">
                    {getInitials(profile.full_name || 'User')}
                  </AvatarFallback>
                </Avatar>
                <div className={isRTL ? 'text-left' : 'text-right'}>
                  <p className="text-sm font-semibold text-gray-900">{profile.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
