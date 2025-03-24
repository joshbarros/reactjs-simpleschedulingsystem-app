import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseApi, studentApi } from '@/utils/api';
import { Course, Student } from '@/types';
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
import { ArrowLeft, Edit, Plus, Trash, Users, BookOpen, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const CourseDetail = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch course and students
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setIsRateLimited(false);
      try {
        if (!code) return;
        
        // First fetch course data
        try {
          const courseData = await courseApi.getByCode(code);
          setCourse(courseData);
          console.log("Successfully fetched course data:", courseData);
        } catch (courseError) {
          console.error('Error fetching course by code:', courseError);
          toast({
            title: 'Course Fetch Error',
            description: `Failed to load course with code ${code}. ${courseError.message || ''}`,
            variant: 'destructive',
          });
          navigate('/courses');
          return;
        }
        
        // Then fetch students separately
        try {
          const studentsData = await courseApi.getStudents(code);
          console.log("Successfully fetched course students:", studentsData);
          
          // Handle potential response format inconsistencies
          if (Array.isArray(studentsData)) {
            setStudents(studentsData);
          } else if (studentsData && typeof studentsData === 'object' && 'students' in studentsData && Array.isArray((studentsData as {students: Student[]}).students)) {
            setStudents((studentsData as {students: Student[]}).students);
          } else {
            console.warn("Unexpected format for students data:", studentsData);
            setStudents([]);
          }
        } catch (studentsError) {
          console.error('Error fetching course students:', studentsError);
          toast({
            title: 'Students Fetch Error',
            description: `Failed to load students for course. ${studentsError.message || ''}`,
            variant: 'destructive',
          });
          // Continue even if students can't be loaded
          setStudents([]);
        }
      } catch (error) {
        console.error('Error in overall fetch process:', error);
        toast({
          title: 'Error',
          description: 'Failed to load course details. Please try again.',
          variant: 'destructive',
        });
        navigate('/courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [code, navigate, toast]);

  // Fetch available students for enrollment
  const handleOpenEnrollDialog = async () => {
    try {
      if (!code) return;
      
      // Get all students
      const allStudentsData = await studentApi.getAll();
      
      // Handle potential response format inconsistencies for all students
      let allStudents: Student[] = [];
      if (Array.isArray(allStudentsData)) {
        allStudents = allStudentsData;
      } else if (allStudentsData && typeof allStudentsData === 'object') {
        console.warn("Unexpected format for all students data:", allStudentsData);
        allStudents = [];
      }
      
      // Filter out students already enrolled
      const enrolledStudentIds = students.map(student => student.id);
      const notEnrolledStudents = allStudents.filter(
        student => !enrolledStudentIds.includes(student.id)
      );
      
      setAvailableStudents(notEnrolledStudents);
      setSelectedStudents([]);
      setIsEnrollDialogOpen(true);
    } catch (error) {
      console.error('Error fetching available students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available students. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle student selection
  const toggleStudentSelection = (id: number) => {
    setSelectedStudents(prev => 
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  // Enroll selected students
  const handleEnrollment = async () => {
    if (selectedStudents.length === 0) return;
    
    try {
      setIsEnrolling(true);
      
      if (!code) return;
      
      // Since the API works by assigning courses to students (not students to courses),
      // we need to update each student's courses individually
      for (const studentId of selectedStudents) {
        // Get the student's current courses
        const studentCoursesData = await courseApi.getByStudentId(studentId);
        
        // Handle potential response format inconsistencies
        let studentCourses: Course[] = [];
        if (Array.isArray(studentCoursesData)) {
          studentCourses = studentCoursesData;
        } else if (studentCoursesData && typeof studentCoursesData === 'object' && 'courses' in studentCoursesData && 
                  Array.isArray((studentCoursesData as {courses: Course[]}).courses)) {
          studentCourses = (studentCoursesData as {courses: Course[]}).courses;
        } else {
          console.warn("Unexpected format for student courses data:", studentCoursesData);
          studentCourses = [];
        }
        
        const courseCodes = [...studentCourses.map(c => c.code), code];
        
        // Update the student's courses
        await studentApi.assignCourses(studentId, courseCodes);
      }
      
      // Refresh the student list
      const updatedStudentsData = await courseApi.getStudents(code);
      
      // Handle potential response format inconsistencies
      if (Array.isArray(updatedStudentsData)) {
        setStudents(updatedStudentsData);
      } else if (updatedStudentsData && typeof updatedStudentsData === 'object' && 'students' in updatedStudentsData && 
                Array.isArray((updatedStudentsData as {students: Student[]}).students)) {
        setStudents((updatedStudentsData as {students: Student[]}).students);
      } else {
        console.warn("Unexpected format for updated students data:", updatedStudentsData);
        setStudents([]);
      }
      
      setIsEnrollDialogOpen(false);
      
      toast({
        title: 'Success',
        description: `${selectedStudents.length} student(s) enrolled in course.`,
      });
    } catch (error) {
      console.error('Error enrolling students:', error);
      toast({
        title: 'Error',
        description: 'Failed to enroll students in course. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  // Remove a student from the course
  const handleRemoveStudent = async (studentId: number) => {
    if (window.confirm(`Are you sure you want to remove this student from the course?`)) {
      try {
        if (!code) return;
        
        // Get the student's current courses
        const studentCoursesData = await courseApi.getByStudentId(studentId);
        
        // Handle potential response format inconsistencies
        let studentCourses: Course[] = [];
        if (Array.isArray(studentCoursesData)) {
          studentCourses = studentCoursesData;
        } else if (studentCoursesData && typeof studentCoursesData === 'object' && 'courses' in studentCoursesData && 
                  Array.isArray((studentCoursesData as {courses: Course[]}).courses)) {
          studentCourses = (studentCoursesData as {courses: Course[]}).courses;
        } else {
          console.warn("Unexpected format for student courses data:", studentCoursesData);
          studentCourses = [];
        }
        
        // Filter out the current course
        const updatedCourseCodes = studentCourses
          .filter(c => c.code !== code)
          .map(c => c.code);
        
        // Update the student's courses
        await studentApi.assignCourses(studentId, updatedCourseCodes);
        
        // Refresh the student list
        const updatedStudentsData = await courseApi.getStudents(code);
        
        // Handle potential response format inconsistencies
        if (Array.isArray(updatedStudentsData)) {
          setStudents(updatedStudentsData);
        } else if (updatedStudentsData && typeof updatedStudentsData === 'object' && 'students' in updatedStudentsData && 
                  Array.isArray((updatedStudentsData as {students: Student[]}).students)) {
          setStudents((updatedStudentsData as {students: Student[]}).students);
        } else {
          console.warn("Unexpected format for updated students data:", updatedStudentsData);
          setStudents([]);
        }
        
        toast({
          title: 'Success',
          description: 'Student removed from course.',
        });
      } catch (error) {
        console.error('Error removing student:', error);
        toast({
          title: 'Error',
          description: 'Failed to remove student from course. Please try again.',
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

  if (!course) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Course not found</h2>
        <Button onClick={() => navigate('/courses')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
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
              onClick={() => navigate('/courses')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{course?.title || 'Course Details'}</h1>
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
          <>
            <Button 
              variant="ghost" 
              className="mb-4" 
              onClick={() => navigate('/courses')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Course Info Card */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Course Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Course Code</span>
                      <Badge variant="outline">{course.code}</Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title</span>
                      <span className="font-medium max-w-[200px] text-right">{course.title}</span>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground">Description</span>
                      <p className="mt-2 text-sm">{course.description || 'No description available.'}</p>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Enrolled Students</span>
                      <Badge variant="outline">{students.length}</Badge>
                    </div>
                    
                    <div className="pt-4">
                      <div className="flex gap-2">
                        <Button onClick={() => navigate(`/courses/${course.code}/edit`)} className="flex-1">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${course.title} (${course.code})?`)) {
                              courseApi.delete(course.code)
                                .then(() => {
                                  toast({
                                    title: 'Success',
                                    description: 'Course deleted successfully',
                                  });
                                  navigate('/courses');
                                })
                                .catch(error => {
                                  console.error('Error deleting course:', error);
                                  toast({
                                    title: 'Error',
                                    description: 'Failed to delete course. Please try again.',
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

              {/* Students Card */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Enrolled Students
                    </CardTitle>
                    <CardDescription>
                      Students currently enrolled in {course.title}
                    </CardDescription>
                  </div>
                  <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleOpenEnrollDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Students
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Students to Course</DialogTitle>
                        <DialogDescription>
                          Select students to enroll in {course.title} ({course.code}).
                        </DialogDescription>
                      </DialogHeader>
                      <div className="max-h-[300px] overflow-y-auto py-4">
                        {availableStudents.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-4 text-center">
                            <p className="text-muted-foreground">
                              No available students found. All students are already enrolled.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {availableStudents.map((student) => (
                              <div key={student.id} className="flex items-start space-x-3 rounded-md border p-3">
                                <Checkbox
                                  id={student.id.toString()}
                                  checked={selectedStudents.includes(student.id)}
                                  onCheckedChange={() => toggleStudentSelection(student.id)}
                                />
                                <div>
                                  <label
                                    htmlFor={student.id.toString()}
                                    className="font-medium cursor-pointer"
                                  >
                                    {student.firstName} {student.lastName}
                                  </label>
                                  <p className="text-sm text-muted-foreground">
                                    {student.email}
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
                          disabled={selectedStudents.length === 0 || isEnrolling}
                        >
                          {isEnrolling ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enrolling...
                            </>
                          ) : (
                            'Enroll Students'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-full bg-muted p-3">
                        <Users className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold">No students enrolled</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        This course has no enrolled students yet
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={handleOpenEnrollDialog} 
                        className="mt-4"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Students
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.id} className="group">
                            <TableCell>{student.id}</TableCell>
                            <TableCell className="font-medium">
                              {student.firstName} {student.lastName}
                            </TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveStudent(student.id)}
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
          </>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
