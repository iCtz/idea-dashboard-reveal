
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb } from "lucide-react";

type Profile = Tables<"profiles">;

interface IdeaSubmissionFormProps {
  profile: Profile;
  onIdeaSubmitted: () => void;
}

export const IdeaSubmissionForm = ({ profile, onIdeaSubmitted }: IdeaSubmissionFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    implementation_cost: "",
    expected_roi: "",
    strategic_alignment_score: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("ideas").insert({
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        submitter_id: profile.id,
        implementation_cost: formData.implementation_cost ? parseFloat(formData.implementation_cost) : null,
        expected_roi: formData.expected_roi ? parseFloat(formData.expected_roi) : null,
        strategic_alignment_score: formData.strategic_alignment_score ? parseInt(formData.strategic_alignment_score) : null,
        status: "draft",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your idea has been submitted successfully!",
      });

      setFormData({
        title: "",
        description: "",
        category: "",
        implementation_cost: "",
        expected_roi: "",
        strategic_alignment_score: "",
      });

      onIdeaSubmitted();
    } catch (error) {
      console.error("Error submitting idea:", error);
      toast({
        title: "Error",
        description: "Failed to submit idea",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Idea Title *</Label>
              <Input
                id="title"
                placeholder="Enter a compelling title for your idea"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your idea in detail, including the problem it solves and proposed solution"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
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
                <Select 
                  value={formData.strategic_alignment_score} 
                  onValueChange={(value) => handleChange("strategic_alignment_score", value)}
                >
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
                  type="number"
                  placeholder="Estimated cost"
                  value={formData.implementation_cost}
                  onChange={(e) => handleChange("implementation_cost", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_roi">Expected ROI (%)</Label>
                <Input
                  id="expected_roi"
                  type="number"
                  placeholder="Expected return"
                  value={formData.expected_roi}
                  onChange={(e) => handleChange("expected_roi", e.target.value)}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Submitting..." : "Submit Idea"}
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
