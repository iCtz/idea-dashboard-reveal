
"use client";

import { useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Users, BarChart3, Zap,  UserCog } from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuthPageSignIn } from "./LoginForm";
import { AuthPageSignUp } from "./SignUpForm";

export const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { t, isRTL } = useLanguage();

  const handleBrowseAsAdmin = async () => {
    setLoading(true);
    try {
      const adminEmail = "admin@browse.com";
      const adminPassword = "BrowseAdmin123";

      console.log("Browse as Admin: Starting admin login process");

      // First try to sign in
      const { error: signInError } = await signIn("credentials", {
        redirect: false,
        email: adminEmail,
        password: adminPassword,
      });

      if (signInError) {
        console.log("Admin user doesn't exist, creating admin account...");

        // Create admin user with no email confirmation
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: adminEmail, password: adminPassword, fullName: "Browse Admin" }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          if (errorData.includes('already registered')) {
            throw new Error("Admin account exists but password is incorrect. Please contact support.");
          }
          throw new Error(errorData || "Failed to create Admin account.");
        }

        toast({
          title: "Admin Account Created",
          description: "You can now log in with your new credentials.",
        });

        // Wait for profile creation and then try to sign in
        await new Promise(resolve => setTimeout(resolve, 1500));

        const { error: finalSignInError } = await signIn("credentials", {
          redirect: false,
          email: adminEmail,
          password: adminPassword,
        });

        if (finalSignInError) {
          throw new Error(`Admin login failed after creation: ${finalSignInError.toString()}`);
        }
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
        <div className={`space-y-6 text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="space-y-4">
            <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
              <div className="p-2 bg-you-accent rounded-xl border border-you-accent">
                <Zap className="h-8 w-8 text-you-purple" />
              </div>
              <h1 className="text-4xl font-bold font-poppins text-gray-900">
                {t('auth', 'app_title')}
              </h1>
            </div>
            <p className="text-xl text-gray-600 font-light">
              {t('auth', 'app_description')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className={`flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm ${isRTL ? 'space-x-reverse' : ''}`}>
              <div className="p-2 bg-you-orange rounded-lg">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('auth', 'feature_submit_title')}</h3>
                <p className="text-sm text-gray-600">{t('auth', 'feature_submit_desc')}</p>
              </div>
            </div>

            <div className={`flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm ${isRTL ? 'space-x-reverse' : ''}`}>
              <div className="p-2 bg-you-green rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('auth', 'feature_evaluation_title')}</h3>
                <p className="text-sm text-gray-600">{t('auth', 'feature_evaluation_desc')}</p>
              </div>
            </div>

            <div className={`flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm ${isRTL ? 'space-x-reverse' : ''}`}>
              <div className="p-2 bg-you-blue rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('auth', 'feature_analytics_title')}</h3>
                <p className="text-sm text-gray-600">{t('auth', 'feature_analytics_desc')}</p>
              </div>
            </div>
          </div>
        </div>

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
