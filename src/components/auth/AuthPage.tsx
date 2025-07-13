
"use client";

import { useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { UserCog } from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuthPageSignIn } from "./LoginForm";
import { AuthPageSignUp } from "./SignUpForm";
import { AuthPageHero } from "./AuthHero";

export const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { t, isRTL } = useLanguage();

  const handleBrowseAsAdmin = async () => {
    setLoading(true);
    try {
      const adminEmail = "admin@browse.com";
      const adminPassword = process.env.NEXT_PUBLIC_TEST_USER_PASSWORD || "Abdu123+++";

      console.log("Browse as Admin: Starting admin login process");

      // First try to sign in
      const result = await signIn("credentials", {
        redirect: false,
        email: adminEmail,
        password: adminPassword,
      });

      if (result?.error) {
        throw new Error("Login failed. Please ensure the database has been seeded correctly.");
      }

      console.log("Browse as Admin: Login successful");
      toast({
        title: "Browse Mode Active",
        description: "Browsing with full admin privileges - instant access granted!",
      });
    } catch (error: unknown) {
      console.error("Browse as Admin error:", error);
      toast({
        title: "Browse Error",
        description: (error instanceof Error ? error.message : "Failed to enter browse mode"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Language Switcher - Top Left Corner */}
      <div className={`fixed top-4 z-50 ${isRTL ? 'right-4' : 'left-4'}`}>
        <LanguageSwitcher />
      </div>

      {/* Browse as Admin Button - Top Right Corner */}
      <div className={`fixed top-4 z-50 ${isRTL ? 'left-4' : 'right-4'}`}>
        <Button
          onClick={handleBrowseAsAdmin}
          disabled={loading}
          className="bg-you-purple hover:bg-you-purple/90 text-white font-medium shadow-lg"
          size="sm"
        >
          <UserCog className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {loading ? t('auth', 'loading') : t('auth', 'browse_as_admin')}
        </Button>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <AuthPageHero />

        {/* Auth Form */}
        <Card className="w-full max-w-md mx-auto shadow-xl border border-gray-200">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-poppins text-gray-900">{t('auth', 'welcome_back')}</CardTitle>
            <CardDescription className="text-base text-gray-600">
              {t('auth', 'signin_description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="font-medium">{t('auth', 'sign_in')}</TabsTrigger>
                <TabsTrigger value="signup" className="font-medium">{t('auth', 'sign_up')}</TabsTrigger>
              </TabsList>

              <AuthPageSignIn />

              <AuthPageSignUp />
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
