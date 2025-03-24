
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { studentApi } from '@/utils/api';
import { Student } from '@/types';
import { useToast } from '@/hooks/use-toast';

const studentSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type StudentFormValues = z.infer<typeof studentSchema>;

const StudentForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  const isEditMode = !!id;
  
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  // Fetch student data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchStudent = async () => {
        try {
          setIsFetching(true);
          const data = await studentApi.getById(Number(id));
          form.reset({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          });
        } catch (error) {
          console.error('Error fetching student:', error);
          toast({
            title: 'Error',
            description: 'Failed to load student data. Please try again.',
            variant: 'destructive',
          });
          navigate('/students');
        } finally {
          setIsFetching(false);
        }
      };

      fetchStudent();
    }
  }, [isEditMode, id, form, navigate, toast]);

  const onSubmit = async (values: StudentFormValues) => {
    try {
      setIsLoading(true);
      
      if (isEditMode) {
        await studentApi.update(Number(id), values as Omit<Student, "id">);
        toast({
          title: 'Success',
          description: 'Student updated successfully',
        });
      } else {
        const newStudent = await studentApi.create(values as Omit<Student, "id">);
        toast({
          title: 'Success',
          description: 'Student created successfully',
        });
      }
      
      navigate('/students');
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: 'Error',
        description: 'Failed to save student. Please try again.',
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
        onClick={() => navigate('/students')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Students
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Student' : 'Add New Student'}</CardTitle>
          <CardDescription>
            {isEditMode 
              ? 'Update the student information below' 
              : 'Fill out the form to create a new student'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John" 
                          {...field} 
                          className="input-focus"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Doe" 
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="john.doe@example.com" 
                        {...field} 
                        className="input-focus"
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
                  onClick={() => navigate('/students')}
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
                    isEditMode ? 'Update Student' : 'Create Student'
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

export default StudentForm;
