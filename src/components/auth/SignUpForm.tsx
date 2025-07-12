
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const AuthPageSignUp = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();
  const router = useRouter();
  const { t, isRTL } = useLanguage();

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

  return (
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
  );
};
