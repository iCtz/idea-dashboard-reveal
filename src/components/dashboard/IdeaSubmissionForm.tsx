"use client";

import { useTransition, useRef } from "react";
// import { Profile } from "@/types/types";
import type { Profile } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb } from "lucide-react";
import { createIdea } from "@/app/dashboard/actions";
import { IdeaCategory } from "@prisma/client";

interface IdeaSubmissionFormProps {
  profile: Profile;
  onIdeaSubmitted: () => void;
}

export const IdeaSubmissionForm = ({ profile, onIdeaSubmitted }: IdeaSubmissionFormProps) => {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (formData: FormData) => {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as IdeaCategory;
    const implementation_cost = formData.get("implementation_cost") as string;
    const expected_roi = formData.get("expected_roi") as string;
    const strategic_alignment_score = formData.get("strategic_alignment_score") as string;

    if (!title || !description || !category) {
      toast({ title: "Missing required fields", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      const result = await createIdea({
        title,
        description,
        category,
        submitterId: profile.id,
        implementationCost: implementation_cost ? parseFloat(implementation_cost) : null,
        expectedRoi: expected_roi ? parseFloat(expected_roi) : null,
        strategicAlignmentScore: strategic_alignment_score ? parseInt(strategic_alignment_score) : null,
      });

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Your idea has been submitted successfully!",
        });
        formRef.current?.reset();
        onIdeaSubmitted(); // This can be called to trigger any client-side-only updates if needed
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-6 w-6 text-blue-600" />
            <CardTitle>Submit New Idea</CardTitle>
          </div>
          <CardDescription>
            Share your innovative idea with the evaluation team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Idea Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter a compelling title for your idea"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your idea in detail, including the problem it solves and proposed solution"
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="innovation">Innovation</SelectItem>
                    <SelectItem value="process_improvement">Process Improvement</SelectItem>
                    <SelectItem value="cost_reduction">Cost Reduction</SelectItem>
                    <SelectItem value="customer_experience">Customer Experience</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="sustainability">Sustainability</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="strategic_alignment_score">Strategic Alignment (1-10)</Label>
                <Select name="strategic_alignment_score">
                  <SelectTrigger>
                    <SelectValue placeholder="Rate alignment" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="implementation_cost">Implementation Cost ($)</Label>
                <Input
                  id="implementation_cost"
                  name="implementation_cost"
                  type="number"
                  placeholder="Estimated cost"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_roi">Expected ROI (%)</Label>
                <Input
                  id="expected_roi"
                  name="expected_roi"
                  type="number"
                  placeholder="Expected return"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? "Submitting..." : "Submit Idea"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Save as draft logic
                  toast({
                    title: "Draft Saved",
                    description: "Your idea has been saved as a draft",
                  });
                }}
              >
                Save as Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
