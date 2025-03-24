
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();

  const showToast = () => {
    toast({
      title: "Welcome to SuperSchedule",
      description: "Your simple scheduling system is ready to use!",
    });
  };

  return (
    <div className="min-h-screen container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to SuperSchedule</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This is your simple scheduling system. Use the sidebar navigation to manage students, courses, and more.
          </p>
          <button 
            onClick={showToast}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Show Welcome Toast
          </button>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage your student roster, view enrollments, and add new students.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Create and manage courses, assign students, and view course details.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View and manage class schedules and student enrollments.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
