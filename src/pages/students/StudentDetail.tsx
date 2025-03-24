import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studentApi, courseApi } from '@/utils/api';
import { Student, Course } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ArrowLeft, Edit, Mail, Plus, Trash, User, BookOpen, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const StudentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch student and courses
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      setIsRateLimited(false);
      
      try {
        // Fetch both student details and courses in parallel
        const [studentData, coursesData] = await Promise.all([
          studentApi.getById(Number(id)),
          studentApi.getCourses(Number(id))
        ]);
        
        setStudent(studentData);
        
        // Handle different response formats for courses
        if (Array.isArray(coursesData)) {
          setCourses(coursesData);
        } else if (coursesData && typeof coursesData === 'object') {
          // Define an interface for the response type that includes courses
          interface CoursesResponse {
            courses: Course[];
          }
          
          // Check if the response has a courses property that's an array
          const courseResp = coursesData as Partial<CoursesResponse>;
          if (Array.isArray(courseResp.courses)) {
            setCourses(courseResp.courses);
          } else {
            console.warn('Response has unexpected format:', coursesData);
            setCourses([]);
          }
        } else {
          console.warn('Unexpected courses data format:', coursesData);
          setCourses([]);
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
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

    fetchData();
  }, [id, navigate, toast]);

  // Fetch available courses when dialog is opened
  const handleOpenEnrollDialog = async () => {
    try {
      if (!id) return;
      
      const notTakenCoursesData = await courseApi.getNotTakenByStudent(Number(id));
      
      // Handle potential response format differences
      if (Array.isArray(notTakenCoursesData)) {
        setAvailableCourses(notTakenCoursesData);
      } else if (notTakenCoursesData && typeof notTakenCoursesData === 'object' && 'courses' in notTakenCoursesData) {
        setAvailableCourses(Array.isArray((notTakenCoursesData as {courses: Course[]}).courses) 
          ? (notTakenCoursesData as {courses: Course[]}).courses 
          : []);
      } else {
        console.warn("Unexpected format for available courses data:", notTakenCoursesData);
        setAvailableCourses([]);
      }
      
      setSelectedCourses([]);
      setIsEnrollDialogOpen(true);
    } catch (error) {
      console.error('Error fetching available courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available courses. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle course selection
  const toggleCourseSelection = (code: string) => {
    setSelectedCourses(prev => 
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  // Enroll student in selected courses
  const handleEnrollment = async () => {
    if (selectedCourses.length === 0) return;
    
    try {
      setIsEnrolling(true);
      
      if (!id) return;
      
      await studentApi.assignCourses(Number(id), selectedCourses);
      
      // Refresh courses
      const updatedCoursesData = await studentApi.getCourses(Number(id));
      // Handle potential response format differences
      if (Array.isArray(updatedCoursesData)) {
        setCourses(updatedCoursesData);
      } else if (updatedCoursesData && typeof updatedCoursesData === 'object' && 'courses' in updatedCoursesData && Array.isArray((updatedCoursesData as Student).courses)) {
        setCourses((updatedCoursesData as Student).courses || []);
      } else {
        setCourses([]);
      }
      
      setIsEnrollDialogOpen(false);
      
      toast({
        title: 'Success',
        description: `Student enrolled in ${selectedCourses.length} course(s).`,
      });
    } catch (error) {
      console.error('Error enrolling student:', error);
      toast({
        title: 'Error',
        description: 'Failed to enroll student in courses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  // Unenroll from a course
  const handleUnenroll = async (courseCode: string) => {
    if (window.confirm(`Are you sure you want to unenroll from ${courseCode}?`)) {
      try {
        if (!id) return;
        
        // The API doesn't provide a direct way to unenroll, so we'll update the enrollments
        // by submitting a list of course codes excluding the one being removed
        const updatedCourses = courses.filter(course => course.code !== courseCode).map(course => course.code);
        
        await studentApi.assignCourses(Number(id), updatedCourses);
        
        // Refresh courses
        const refreshedCoursesData = await studentApi.getCourses(Number(id));
        // Handle potential response format differences
        if (Array.isArray(refreshedCoursesData)) {
          setCourses(refreshedCoursesData);
        } else if (refreshedCoursesData && typeof refreshedCoursesData === 'object' && 'courses' in refreshedCoursesData && Array.isArray((refreshedCoursesData as Student).courses)) {
          setCourses((refreshedCoursesData as Student).courses || []);
        } else {
          setCourses([]);
        }
        
        toast({
          title: 'Success',
          description: `Student unenrolled from ${courseCode}.`,
        });
      } catch (error) {
        console.error('Error unenrolling student:', error);
        toast({
          title: 'Error',
          description: 'Failed to unenroll student. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Student not found</h2>
        <Button onClick={() => navigate('/students')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/students')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              {student ? `${student.firstName} ${student.lastName}` : 'Student Details'}
            </h1>
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

        {isLoading ? (
          <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Student Info Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full Name</span>
                    <span className="font-medium">{student.firstName} {student.lastName}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Student ID</span>
                    <span className="font-medium">{student.id}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <div className="flex items-center">
                      <Mail className="mr-1 h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${student.email}`} className="link-hover font-medium text-primary">
                        {student.email}
                      </a>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Courses</span>
                    <Badge variant="outline">{courses.length}</Badge>
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex gap-2">
                      <Button onClick={() => navigate(`/students/${student.id}/edit`)} className="flex-1">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
                            studentApi.delete(student.id)
                              .then(() => {
                                toast({
                                  title: 'Success',
                                  description: 'Student deleted successfully',
                                });
                                navigate('/students');
                              })
                              .catch(error => {
                                console.error('Error deleting student:', error);
                                toast({
                                  title: 'Error',
                                  description: 'Failed to delete student. Please try again.',
                                  variant: 'destructive',
                                });
                              });
                          }
                        }}
                        className="flex-1"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Courses Card */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Enrolled Courses
                  </CardTitle>
                  <CardDescription>
                    Courses that {student.firstName} is currently enrolled in
                  </CardDescription>
                </div>
                <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleOpenEnrollDialog}>
                      <Plus className="mr-2 h-4 w-4" />
                      Enroll in Courses
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Enroll in Courses</DialogTitle>
                      <DialogDescription>
                        Select courses to enroll {student.firstName} {student.lastName} in.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[300px] overflow-y-auto py-4">
                      {availableCourses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                          <p className="text-muted-foreground">
                            No available courses found. Student is enrolled in all courses.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {availableCourses.map((course) => (
                            <div key={course.code} className="flex items-start space-x-3 rounded-md border p-3">
                              <Checkbox
                                id={course.code}
                                checked={selectedCourses.includes(course.code)}
                                onCheckedChange={() => toggleCourseSelection(course.code)}
                              />
                              <div>
                                <label
                                  htmlFor={course.code}
                                  className="font-medium cursor-pointer"
                                >
                                  {course.title} ({course.code})
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  {course.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleEnrollment} 
                        disabled={selectedCourses.length === 0 || isEnrolling}
                      >
                        {isEnrolling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enrolling...
                          </>
                        ) : (
                          'Enroll'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-muted p-3">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No courses enrolled</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This student is not enrolled in any courses yet
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleOpenEnrollDialog} 
                      className="mt-4"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Enroll in Courses
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.code} className="group">
                          <TableCell className="font-medium">{course.code}</TableCell>
                          <TableCell>{course.title}</TableCell>
                          <TableCell className="max-w-xs truncate">{course.description}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUnenroll(course.code)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetail;
