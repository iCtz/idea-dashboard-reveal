
"use client";

import { useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TestTube, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { testUsers } from "./constants";

export const AuthPageTestUserPanel = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { t, isRTL } = useLanguage();

  const testUserPassword = process.env.NEXT_PUBLIC_TEST_USER_PASSWORD || "Abdu123+++";

  const handleTestLogin = async (testUser: typeof testUsers[0]) => {
    setLoading(true);
    try {
      console.log(`Attempting login for ${testUser.name} (${testUser.email})`);

      const result = await signIn("credentials",{
        redirect: false,
        email: testUser.email,
        password: testUserPassword,
      });

      if (result?.error) {
        throw new Error("Login failed. Please ensure you have run the database seed script.");
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

  return (
    <div className="space-y-4">
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
    </div>
  );
};
