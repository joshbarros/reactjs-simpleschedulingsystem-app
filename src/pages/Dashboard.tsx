import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '@/components/ui/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Users, BookOpen, Plus, Clock, PieChart, TrendingUp, CheckCircle, RefreshCw, Search, Bolt } from 'lucide-react';
import { dashboardApi } from '@/utils/api';
import { DashboardStats } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCourses: 0,
    studentCourseRatio: '0',
    recentEnrollments: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    setIsRateLimited(false);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      
      // Check if it's a rate limit error
      if (errorMessage.includes("429") || errorMessage.includes("Too Many Requests")) {
        setIsRateLimited(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Calculate ratio to avoid division by zero
  const calculateRatio = () => {
    if (isLoading) return '...';
    if (stats.totalCourses === 0) return '0';
    return (stats.totalStudents / stats.totalCourses).toFixed(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section with Glassmorphism */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-secondary/10 to-tertiary/10 backdrop-blur-sm border border-white/20 shadow-xl p-6">
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-tertiary/5 opacity-30"></div>
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-display-sm font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome to the Super Simple Scheduling System.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/students/new')}
              className="bg-primary/80 backdrop-blur-sm hover:bg-primary/90 transition-all duration-300 shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
            <Button 
              onClick={() => navigate('/courses/new')}
              className="bg-secondary/80 backdrop-blur-sm hover:bg-secondary/90 transition-all duration-300 shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </div>
        </div>
      </div>

      {isRateLimited && (
        <Alert className="my-4 bg-yellow-100 border-yellow-400 text-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-800" />
          <AlertTitle className="text-yellow-800 font-medium">API Rate Limit Reached</AlertTitle>
          <AlertDescription className="text-yellow-700">
            The demo API has a request limit. Please wait a moment before trying again. 
            This is not an application error but a limitation of the demo environment.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Section with Glassmorphism Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Students"
          value={isLoading ? '...' : stats.totalStudents}
          icon={<Users className="h-4 w-4" />}
          trend={{ value: 12, isPositive: true }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-lg"
        />
        <StatsCard
          title="Total Courses"
          value={isLoading ? '...' : stats.totalCourses}
          icon={<BookOpen className="h-4 w-4" />}
          trend={{ value: 5, isPositive: true }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-lg"
        />
        <StatsCard
          title="Student-Course Ratio"
          value={calculateRatio()}
          description="Average students per course"
          icon={<PieChart className="h-4 w-4" />}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-lg"
        />
      </div>

      {/* Quick Actions Card - Full Width */}
      <Card className="overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-secondary/10 to-tertiary/10 backdrop-blur-sm">
          <CardTitle className="flex items-center gap-2">
            <Bolt className="h-5 w-5 text-secondary" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Frequently used actions for scheduling management
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4">
          <Button 
            variant="outline" 
            className="h-auto flex-col items-start justify-start p-4 text-left bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
            onClick={() => navigate('/students')}
          >
            <div className="flex w-full items-center">
              <Users className="h-5 w-5 text-primary" />
              <div className="ml-4">
                <h3 className="font-semibold">View Students</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse all students
                </p>
              </div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto flex-col items-start justify-start p-4 text-left bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
            onClick={() => navigate('/courses')}
          >
            <div className="flex w-full items-center">
              <BookOpen className="h-5 w-5 text-primary" />
              <div className="ml-4">
                <h3 className="font-semibold">View Courses</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse all courses
                </p>
              </div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto flex-col items-start justify-start p-4 text-left bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
            onClick={() => navigate('/students/new')}
          >
            <div className="flex w-full items-center">
              <Plus className="h-5 w-5 text-secondary" />
              <div className="ml-4">
                <h3 className="font-semibold">New Student</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create student record
                </p>
              </div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto flex-col items-start justify-start p-4 text-left bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
            onClick={() => navigate('/courses/new')}
          >
            <div className="flex w-full items-center">
              <Plus className="h-5 w-5 text-secondary" />
              <div className="ml-4">
                <h3 className="font-semibold">New Course</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create course record
                </p>
              </div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto flex-col items-start justify-start p-4 text-left bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
            onClick={() => fetchDashboardData()}
          >
            <div className="flex w-full items-center">
              <RefreshCw className="h-5 w-5 text-tertiary" />
              <div className="ml-4">
                <h3 className="font-semibold">Refresh Data</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update dashboard stats
                </p>
              </div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto flex-col items-start justify-start p-4 text-left bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
            onClick={() => navigate('/students')}
          >
            <div className="flex w-full items-center">
              <Users className="h-5 w-5 text-tertiary" />
              <div className="ml-4">
                <h3 className="font-semibold">Manage Enrollments</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add/remove course enrollments
                </p>
              </div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto flex-col items-start justify-start p-4 text-left bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
            onClick={() => navigate('/students')}
          >
            <div className="flex w-full items-center">
              <Search className="h-5 w-5 text-tertiary" />
              <div className="ml-4">
                <h3 className="font-semibold">Search Students</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Find specific students
                </p>
              </div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto flex-col items-start justify-start p-4 text-left bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
            onClick={() => navigate('/courses')}
          >
            <div className="flex w-full items-center">
              <Search className="h-5 w-5 text-tertiary" />
              <div className="ml-4">
                <h3 className="font-semibold">Search Courses</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Find specific courses
                </p>
              </div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
