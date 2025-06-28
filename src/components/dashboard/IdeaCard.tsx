
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, DollarSign } from "lucide-react";
import { format } from "date-fns";

type Idea = Tables<"ideas">;

interface IdeaCardProps {
  idea: Idea;
  detailed?: boolean;
}

export const IdeaCard = ({ idea, detailed = false }: IdeaCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "under_review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "implemented":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "innovation":
        return "bg-purple-100 text-purple-800";
      case "process_improvement":
        return "bg-blue-100 text-blue-800";
      case "cost_reduction":
        return "bg-green-100 text-green-800";
      case "customer_experience":
        return "bg-orange-100 text-orange-800";
      case "technology":
        return "bg-indigo-100 text-indigo-800";
      case "sustainability":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className={`${detailed ? "h-full" : ""} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {idea.title}
          </CardTitle>
          <Badge className={getStatusColor(idea.status)}>
            {idea.status.replace("_", " ")}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={getCategoryColor(idea.category)}>
            {idea.category.replace("_", " ")}
          </Badge>
          {idea.priority_score > 0 && (
            <Badge variant="outline">
              Priority: {idea.priority_score}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className={`${detailed ? "line-clamp-4" : "line-clamp-2"} mb-4`}>
          {idea.description}
        </CardDescription>
        
        {detailed && (
          <div className="space-y-2 text-sm text-gray-600">
            {idea.implementation_cost && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Cost: ${idea.implementation_cost.toLocaleString()}
              </div>
            )}
            {idea.expected_roi && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Expected ROI: {idea.expected_roi}%
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {format(new Date(idea.created_at!), "MMM d, yyyy")}
          </div>
          {idea.strategic_alignment_score && (
            <div>
              Alignment: {idea.strategic_alignment_score}/10
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
