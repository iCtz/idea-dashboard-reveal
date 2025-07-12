
"use client";

import { useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Users, BarChart3, Zap, TestTube, AlertCircle, UserCog } from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

export const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();
  const router = useRouter();
  const { t, isRTL } = useLanguage();

  // Test user accounts with roles
  const testUsers = [
    {
      email: "submitter@you.com",
      name: "Hani Gazim",
      role: "Submitter",
      userRole: "submitter" as const,
      id: "11111111-1111-1111-1111-111111111111"
    },
    {
      email: "evaluator@you.com",
      name: "Abdurhman Alhakeem",
      role: "Evaluator",
      userRole: "evaluator" as const,
      id: "22222222-2222-2222-2222-222222222222"
    },
    {
      email: "management@you.com",
      name: "Osama Murshed",
      role: "Management",
      userRole: "management" as const,
      id: "33333333-3333-3333-3333-333333333333"
    },
    {
      email: "test@you.com",
      name: "Test User",
      role: "Admin",
      userRole: "management" as const,
      id: "44444444-4444-4444-4444-444444444444"
    },
  ];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to create account.");
      }

      toast({
        title: "Account Created",
        description: "You can now log in with your new credentials.",
      });
      setActiveTab("login"); // Switch to login tab on success
    } catch (error: unknown) {
      toast({
        title: "Registration Failed",
        description: (error instanceof Error ? error.message : "An unexpected error occurred."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Starting sign in process...");

      // const { error } = await supabase.auth.signInWithPassword({
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) throw new Error(`Sign in failed: ${result?.error.toString()}`);

      console.log("Sign in successful");
      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
    } catch (error: unknown) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in Error",
        description: (error instanceof Error ? error.message : "Failed to sign in"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (testUser: typeof testUsers[0]) => {
    setLoading(true);
    try {
      console.log(`Attempting login for ${testUser.name} (${testUser.email})`);

      // Try to sign in first
      const { error: signInError } = await signIn("credentials",{
        redirect: false,
        email: "testUser.email",
        password: "Abdu123+++",
      });

      // If sign in fails, create the user
      if (signInError) {
        console.log("User doesn't exist, creating...");

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "testUser.email", password: "Abdu123+++", fullName: "Abdulrahman AlHakeem" }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || "Failed to create account.");
        }

        toast({
          title: "Account Created",
          description: "You can now log in with your new credentials.",
        });

        // The profile should be created automatically by the trigger
        // Let's wait a moment and then sign in
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Now sign in
        const { error: finalSignInError } = await signIn("credentials", {
          redirect: false,
          email: testUser.email,
          password: "Abdu123+++",
        });

        if (finalSignInError) {
          throw new Error(`Final login failed: ${finalSignInError.toString()}`);
        }
      }

      console.log("Login successful for", testUser.name);
      toast({
        title: "Login Successful",
        description: `Logged in as ${testUser.name} (${testUser.role})`,
      });
    } catch (error: unknown) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: (error instanceof Error ? error.message : "Failed to login. Please try again."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccess = async () => {
    const testUser = testUsers.find(u => u.email === "test@you.com")!;
    await handleTestLogin(testUser);
  };

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
          body: JSON.stringify({ email: "testUser.email", password: "Abdu123+++", fullName: "Abdulrahman AlHakeem" }),
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

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{t('auth', 'email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('auth', 'email_placeholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`h-12 ${isRTL ? 'text-right' : 'text-left'}`}
                      dir={isRTL ? 'rtl' : 'ltr'}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{t('auth', 'password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t('auth', 'password_placeholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`h-12 ${isRTL ? 'text-right' : 'text-left'}`}
                      dir={isRTL ? 'rtl' : 'ltr'}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-gray-800 hover:bg-gray-900 font-medium" disabled={loading}>
                    {loading ? t('auth', 'signing_in') : t('auth', 'sign_in')}
                  </Button>
                </form>

                {/* Quick Access Button */}
                <div className="mt-4">
                  <Button
                    onClick={handleQuickAccess}
                    className="w-full h-12 bg-you-purple hover:bg-you-purple/90 font-medium"
                    disabled={loading}
                  >
                    {loading ? t('auth', 'accessing') : t('auth', 'quick_access')}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {t('auth', 'quick_access_desc')}
                  </p>
                </div>

                {/* Test Users Section */}
                  <div className="mt-6 pt-6 border-t">
                    <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <h4 className="font-medium text-sm text-gray-600">{t('auth', 'test_roles')}</h4>
                      <TestTube className="h-4 w-4 text-gray-400" />
                    </div>
                  <div className="space-y-2">
                    {testUsers.map((user, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className={`w-full h-auto p-3 border-gray-200 hover:bg-gray-50 ${isRTL ? 'justify-end text-right' : 'justify-start text-left'}`}
                          onClick={() => handleTestLogin(user)}
                          disabled={loading}
                        >
                          <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                            <div className={`w-3 h-3 rounded-full ${
                              user.role === 'Submitter' ? 'bg-you-blue' :
                              user.role === 'Evaluator' ? 'bg-you-green' :
                              user.role === 'Management' ? 'bg-you-orange' : 'bg-you-purple'
                            }`}></div>
                            <div>
                              <div className="font-medium text-sm text-gray-900">{user.name}</div>
                              <div className="text-xs text-gray-500">{user.role}</div>
                            </div>
                          </div>
                        </Button>
                    ))}
                  </div>
                    <div className={`flex items-center space-x-2 mt-3 p-2 bg-green-50 rounded-lg ${isRTL ? 'space-x-reverse' : ''}`}>
                      <AlertCircle className="h-4 w-4 text-green-600" />
                      <p className="text-xs text-green-700">
                        {t('auth', 'email_confirmation_disabled')}
                      </p>
                    </div>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{t('auth', 'full_name')}</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={t('auth', 'full_name_placeholder')}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`h-12 ${isRTL ? 'text-right' : 'text-left'}`}
                      dir={isRTL ? 'rtl' : 'ltr'}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{t('auth', 'email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('auth', 'email_placeholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`h-12 ${isRTL ? 'text-right' : 'text-left'}`}
                      dir={isRTL ? 'rtl' : 'ltr'}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{t('auth', 'password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t('auth', 'create_password_placeholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`h-12 ${isRTL ? 'text-right' : 'text-left'}`}
                      dir={isRTL ? 'rtl' : 'ltr'}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-gray-800 hover:bg-gray-900 font-medium" disabled={loading}>
                    {loading ? t('auth', 'creating_account') : t('auth', 'create_account')}
                  </Button>
                </form>
                <div className={`flex items-center space-x-2 mt-3 p-2 bg-green-50 rounded-lg ${isRTL ? 'space-x-reverse' : ''}`}>
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <p className="text-xs text-green-700">
                    {t('auth', 'no_email_confirmation')}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
