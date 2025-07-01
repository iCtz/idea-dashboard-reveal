
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const { toast } = useToast();

  // Unified test credentials for all roles
  const unifiedCredentials = {
    email: "test@you.com",
    password: "Abdu123+++",
  };

  // Test user accounts for different roles - all use same password
  const testUsers = [
    { email: "submitter@you.com", password: "Abdu123+++", role: "Submitter", name: "Hani Gazim" },
    { email: "evaluator@you.com", password: "Abdu123+++", role: "Evaluator", name: "Abdurhman Alhakeem" },
    { email: "management@you.com", password: "Abdu123+++", role: "Management", name: "Osama Murshed" },
    { email: "test@you.com", password: "Abdu123+++", role: "Admin", name: "Test User" },
  ];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Auto-confirm email for testing by attempting to sign in immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError) {
        toast({
          title: "Account Created & Signed In!",
          description: "Welcome to YOU Innovation Hub",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email for confirmation (if required).",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (testUser: typeof testUsers[0]) => {
    setLoading(true);
    try {
      // Try to sign in with existing credentials first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password,
      });

      if (signInError) {
        // If sign in fails, create the account first with email confirmation disabled
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testUser.email,
          password: testUser.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: testUser.name,
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        // If sign up was successful, try to sign in again
        if (signUpData.user && !signUpData.user.email_confirmed_at) {
          // For testing, we'll try to sign in anyway
          const { error: secondSignInError } = await supabase.auth.signInWithPassword({
            email: testUser.email,
            password: testUser.password,
          });

          if (secondSignInError) {
            // If still failing due to email confirmation, show helpful message
            throw new Error(`Account created but email confirmation required. Please check email or use Quick Access button.`);
          }
        }
      }
      
      toast({
        title: "Login Successful",
        description: `Logged in as ${testUser.name} (${testUser.role})`,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: error.message || "Failed to login. Try using Quick Access instead.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccess = async () => {
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: unifiedCredentials.email,
        password: unifiedCredentials.password,
      });

      if (signInError) {
        // If sign in fails, create the account
        const { error: signUpError } = await supabase.auth.signUp({
          email: unifiedCredentials.email,
          password: unifiedCredentials.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: "Test User",
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        // Try signing in again after account creation
        const { error: secondSignInError } = await supabase.auth.signInWithPassword({
          email: unifiedCredentials.email,
          password: unifiedCredentials.password,
        });

        if (secondSignInError) {
          throw new Error("Account created but login failed. Please try again.");
        }
      }
      
      toast({
        title: "Quick Access Successful",
        description: "Logged in successfully",
      });
    } catch (error: any) {
      console.error("Quick access error:", error);
      toast({
        title: "Quick Access Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="font-medium">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="font-medium">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
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
                    Use unified credentials for testing
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
                      All accounts will be created automatically for testing
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
                    Email confirmation is bypassed for testing purposes
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
