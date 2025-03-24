import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit, Trash, Eye } from 'lucide-react';
import { Course, Column } from '@/types';
import { courseApi } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const CourseList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    setIsRateLimited(false);
    try {
      const data = await courseApi.getAll();
      setCourses(data);
      setFilteredCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
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

  // Handle search (client-side filtering since API doesn't have search for courses)
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredCourses(courses);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = courses.filter(
      course => 
        course.code.toLowerCase().includes(query) ||
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query)
    );
    
    setFilteredCourses(filtered);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setFilteredCourses(courses);
  };

  // Handle delete
  const handleDelete = async (course: Course) => {
    if (window.confirm(`Are you sure you want to delete ${course.title} (${course.code})?`)) {
      try {
        await courseApi.delete(course.code);
        // Refetch courses after deletion to ensure data consistency
        fetchCourses();
        toast({
          title: 'Success',
          description: `${course.title} has been deleted.`,
        });
      } catch (error) {
        console.error('Error deleting course:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete course. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  // Table columns definition
  const columns: Column<Course>[] = [
    {
      id: 'code',
      header: 'Code',
      accessorKey: 'code',
    },
    {
      id: 'title',
      header: 'Title',
      accessorKey: 'title',
    },
    {
      id: 'description',
      header: 'Description',
      accessorKey: 'description',
      cell: (row) => <div className="max-w-md truncate">{row.description}</div>,
    },
    {
      id: 'students',
      header: 'Students',
      accessorFn: (row) => row.students?.length || 0,
    },
  ];

  // Row actions
  const actions = [
    {
      label: 'View',
      onClick: (course: Course) => navigate(`/courses/${course.code}`),
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: 'Edit',
      onClick: (course: Course) => navigate(`/courses/${course.code}/edit`),
      icon: <Edit className="h-4 w-4" />,
    },
    {
      label: 'Delete',
      onClick: handleDelete,
      icon: <Trash className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-sm font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">
            Manage course information and enrollments
          </p>
        </div>
        <Button onClick={() => navigate('/courses/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      {isRateLimited && (
        <Alert className="mb-6 bg-yellow-100 border-yellow-400 text-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-800" />
          <AlertTitle className="text-yellow-800 font-medium">API Rate Limit Reached</AlertTitle>
          <AlertDescription className="text-yellow-700">
            The demo API has a request limit. Please wait a moment before trying again. 
            This is not an application error but a limitation of the demo environment.
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Course List</h2>
            
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value === '') {
                    clearSearch();
                  }
                }}
                className="w-[200px] sm:w-[300px]"
              />
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </Button>
              {searchQuery && (
                <Button variant="outline" onClick={clearSearch}>
                  Clear
                </Button>
              )}
            </div>
          </div>

          <DataTable
            data={filteredCourses}
            columns={columns}
            isLoading={isLoading}
            onRowClick={(course) => navigate(`/courses/${course.code}`)}
            actions={actions}
            searchable={false}
            keyExtractor={(row) => row.code}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseList;
