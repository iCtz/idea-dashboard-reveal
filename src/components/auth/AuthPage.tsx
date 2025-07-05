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
import { Lightbulb, Users, BarChart3, Zap, TestTube, AlertCircle } from "lucide-react";

export const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();
  const router = useRouter();


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
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
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
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        // Successful login, refresh the page to update the session state
        // and trigger the server component to re-render.
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "An unexpected error occurred.",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (testUser: typeof testUsers[0]) => {
    setLoading(true);
    try {
      // This function now uses the NextAuth credentials provider.
      // It assumes the test users exist in your local database with the password "Abdu123+++".
      const result = await signIn("credentials", {
        redirect: false,
        email: testUser.email,
        password: "Abdu123+++",
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Login Successful",
        description: `Logged in as ${testUser.name} (${testUser.role})`,
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Test Login Error",
        description: error.message || "Failed to login. Ensure test users are in the database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccess = async () => {
    // Re-purposing this button to use the primary test user.
    const testUser = testUsers.find(u => u.email === "test@you.com")!;
    await handleTestLogin(testUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="space-y-6 text-gray-800">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-you-accent rounded-xl border border-you-accent">
                <Zap className="h-8 w-8 text-you-purple" />
              </div>
              <h1 className="text-4xl font-bold font-poppins text-gray-900">
                YOU Innovation Hub
              </h1>
            </div>
            <p className="text-xl text-gray-600 font-light">
              Transform ideas into reality with our comprehensive innovation management platform
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
              <div className="p-2 bg-you-orange rounded-lg">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Submit & Track Ideas</h3>
                <p className="text-sm text-gray-600">Share innovative thoughts and monitor progress</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
              <div className="p-2 bg-you-green rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Collaborative Evaluation</h3>
                <p className="text-sm text-gray-600">Expert review and strategic alignment assessment</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
              <div className="p-2 bg-you-blue rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Analytics & Insights</h3>
                <p className="text-sm text-gray-600">Data-driven decisions and performance tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <Card className="w-full max-w-md mx-auto shadow-xl border border-gray-200">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-poppins text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="font-medium">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="font-medium">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-gray-800 hover:bg-gray-900 font-medium" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                {/* Quick Access Button */}
                <div className="mt-4">
                  <Button
                    onClick={handleQuickAccess}
                    className="w-full h-12 bg-you-purple hover:bg-you-purple/90 font-medium"
                    disabled={loading}
                  >
                    {loading ? "Accessing..." : "Quick Access"}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    One-click testing access
                  </p>
                </div>

                {/* Test Users Section */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-sm text-gray-600">Test Different Roles</h4>
                    <TestTube className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    {testUsers.map((user, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start h-auto p-3 text-left border-gray-200 hover:bg-gray-50"
                        onClick={() => handleTestLogin(user)}
                        disabled={loading}
                      >
                        <div className="flex items-center space-x-3">
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
                  <div className="flex items-center space-x-2 mt-3 p-2 bg-blue-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <p className="text-xs text-blue-700">
                      All accounts will be created automatically with proper roles
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="font-medium">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-gray-800 hover:bg-gray-900 font-medium" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Email confirmation is automatically handled for testing
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
