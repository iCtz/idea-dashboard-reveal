
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { AuthPageTestUserPanel } from "./TestUserPanel";
import { logger } from '@/lib/logger';

export const AuthPageSignIn = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      logger.auth("Starting sign in process...");

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) throw new Error(`Sign in failed: ${result?.error.toString()}`);

      logger.auth("Sign in successful");
      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
    } catch (error: unknown) {
      logger.error("Sign in error:", error as string);
      toast({
        title: "Sign in Error",
        description: (error instanceof Error ? error.message : "Failed to sign in"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
      <AuthPageTestUserPanel />
    </TabsContent>
  );
};
