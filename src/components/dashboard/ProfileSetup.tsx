
import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Profile, User, UserRole } from "@prisma/client";
import { updateProfile } from "@/app/dashboard/actions";

interface ProfileSetupProps {
  user: User;
  profile: Profile | null;
  onProfileUpdate: (profile: Profile) => void;
}

export function ProfileSetup({ user, profile, onProfileUpdate }: Readonly<ProfileSetupProps>) {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<UserRole>("submitter");
  const { toast } = useToast();

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setFullName(
      formData.get("fullName") as string,
    );

    setDepartment(
      formData.get("department") as string,
    );

    setRole(
      formData.get("role") as UserRole,
    );

    if (!fullName || !role || !user.id || !user.email) {
      return;
    }

    // Start Transition
    startTransition(async () => {
      const result = await updateProfile({
        id: user.id,
        email: user.email || "",
        fullName,
        department,
        role: role as string as "submitter" | "evaluator" | "management",
      });

    if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully set up.",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Set up your profile to access the Idea Management Hub
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                type="text"
                placeholder="Enter your department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitter">Idea Submitter</SelectItem>
                  <SelectItem value="evaluator">Idea Evaluator</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {(isPending || loading) ? "Setting up..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
