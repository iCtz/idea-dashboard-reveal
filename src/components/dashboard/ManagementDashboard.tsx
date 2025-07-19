
import { useMemo, useState, useEffect } from "react";
import type { Idea, Profile, User } from "@prisma/client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Lightbulb, CheckCircle, Clock, Target } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { db } from "@lib/db";




interface ManagementDashboardProps {
  user: User;
  profile: Profile;
  allIdeas: Idea[];
  userCount: number;
  activeView: string;
}

type CategoryChartData = {
  name: string;
  value: number;
};

type StatusChartData = {
  name: string;
  count: number;
};

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({ user, profile, allIdeas = [], userCount = 0, activeView }) => {
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<CategoryChartData[]>([]);
  const [statusData, setStatusData] = useState<StatusChartData[]>([]);
  const { t } = useLanguage();
  const data = useMemo(() => {
    const implementedIdeas = allIdeas.filter(idea => idea.status === "implemented").length;
    const activeIdeas = allIdeas.filter(idea => ["submitted", "under_review", "approved"].includes(idea.status)).length;

    const stats = {
      totalIdeas: allIdeas.length,
      totalUsers: userCount,
      activeIdeas: activeIdeas,
      implementedIdeas: implementedIdeas,
      successRate: allIdeas.length > 0 ? Math.round((implementedIdeas / allIdeas.length) * 100) : 0,
      avgTimeToImplement: 30,
    };

    const categoryCount = allIdeas.reduce((acc: Record<string, number>, idea) => {
      if (idea.category) acc[idea.category] = (acc[idea.category] || 0) + 1;
      return acc;
    }, {});

    const statusCount = allIdeas.reduce((acc: Record<string, number>, idea) => {
      if (idea.status) acc[idea.status] = (acc[idea.status] || 0) + 1;
      return acc;
    }, {});

    return {
      stats,
      categoryData: Object.entries(categoryCount).map(([name, value]) => ({ name: name.replace(/_/g, " "), value })),
      statusData: Object.entries(statusCount).map(([name, count]) => ({ name: name.replace(/_/g, " "), count }))
    };
  }, [allIdeas, userCount]);

  const { stats } = data;
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    setCategoryData(data.categoryData);
    setStatusData(data.statusData);
    setLoading(false);
  }, [data]);

  const fetchCategoryData = async () => {
    try {
      const ideaCategoryData = await db.idea.findMany({
        select:{
          category: true,
        }
      });

      if (!ideaCategoryData) throw new Error("Unknown error while fetching ideas");

      const categoryCount = ideaCategoryData?.reduce((acc: Record<string, number>, idea) => {
        acc[idea.category] = (acc[idea.category] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(categoryCount || {}).map(([category, count]) => ({
        name: category.replace("_", " "),
        value: count,
      }));

      setCategoryData(chartData);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  const fetchStatusData = async () => {
    try {
      const ideaStatusData = await db.idea.findMany({
        select:{
          status: true,
        }
      });

      if (!ideaStatusData) throw new Error("Unknown error while fetching ideas");

      const statusCount = ideaStatusData?.reduce((acc: Record<string, number>, idea) => {
        acc[idea.status] = (acc[idea.status] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(statusCount || {}).map(([status, count]) => ({
        name: status.replace("_", " "),
        count: count,
      }));

      setStatusData(chartData);
    } catch (error) {
      console.error("Error fetching status data:", error);
    }
  };

  const renderDashboardOverview = () => {
    if (loading) {
      return <div className="text-center py-8">{t('common', 'loading')}</div>;
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalIdeas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

              <CardTitle className="text-sm font-medium">Active Ideas</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.activeIdeas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Implemented</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.implementedIdeas}</div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.successRate}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{stats.avgTimeToImplement}d</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ideas by Status</CardTitle>
              <CardDescription>Current distribution of idea statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ideas by Category</CardTitle>
              <CardDescription>Distribution across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
            <CardDescription>Monthly performance metrics and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((stats.implementedIdeas / Math.max(stats.totalIdeas, 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Implementation Rate</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(stats.totalIdeas / Math.max(stats.totalUsers, 1) * 10) / 10}
                </div>
                <div className="text-sm text-gray-600">Ideas per User</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((stats.activeIdeas / Math.max(stats.totalIdeas, 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Active Idea Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return renderDashboardOverview();
};
