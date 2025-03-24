
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { courseApi } from '@/utils/api';
import { Course } from '@/types';
import { useToast } from '@/hooks/use-toast';

const courseSchema = z.object({
  code: z.string().min(2, { message: 'Course code is required' })
    .max(10, { message: 'Course code cannot exceed 10 characters' })
    .refine(code => /^[A-Z0-9]+$/.test(code), {
      message: 'Course code must contain only uppercase letters and numbers',
    }),
  title: z.string().min(1, { message: 'Course title is required' })
    .max(100, { message: 'Course title cannot exceed 100 characters' }),
  description: z.string()
    .max(500, { message: 'Course description cannot exceed 500 characters' })
    .optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

const CourseForm = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  const isEditMode = !!code;
  
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      code: '',
      title: '',
      description: '',
    },
  });

  // Fetch course data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchCourse = async () => {
        try {
          setIsFetching(true);
          const data = await courseApi.getByCode(code);
          form.reset({
            code: data.code,
            title: data.title,
            description: data.description,
          });
        } catch (error) {
          console.error('Error fetching course:', error);
          toast({
            title: 'Error',
            description: 'Failed to load course data. Please try again.',
            variant: 'destructive',
          });
          navigate('/courses');
        } finally {
          setIsFetching(false);
        }
      };

      fetchCourse();
    }
  }, [isEditMode, code, form, navigate, toast]);

  const onSubmit = async (values: CourseFormValues) => {
    try {
      setIsLoading(true);
      
      if (isEditMode) {
        await courseApi.update(code, values as Course);
        toast({
          title: 'Success',
          description: 'Course updated successfully',
        });
      } else {
        await courseApi.create(values as Course);
        toast({
          title: 'Success',
          description: 'Course created successfully',
        });
      }
      
      navigate('/courses');
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: 'Error',
        description: 'Failed to save course. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate('/courses')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Courses
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Course' : 'Add New Course'}</CardTitle>
          <CardDescription>
            {isEditMode 
              ? 'Update the course information below' 
              : 'Fill out the form to create a new course'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="CS101" 
                          {...field} 
                          className="input-focus"
                          disabled={isEditMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Introduction to Computer Science" 
                          {...field} 
                          className="input-focus"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter course description..." 
                        className="resize-none input-focus"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <CardFooter className="flex justify-end gap-2 px-0 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/courses')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="btn-hover" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Course' : 'Create Course'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseForm;
