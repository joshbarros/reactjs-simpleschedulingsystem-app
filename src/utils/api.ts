import { Student, Course, PaginationParams, PaginatedResponse, DashboardStats } from '@/types';
import { toast } from '@/hooks/use-toast';

// API base URL
const API_BASE_URL = 'http://ec2-34-207-147-146.compute-1.amazonaws.com:8080/api';

// Track if a rate limit warning was already shown
let rateLimitWarningShown = false;

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
};

// Show rate limit warning toast once
const showRateLimitWarning = () => {
  if (!rateLimitWarningShown) {
    toast({
      title: "API Rate Limit Reached",
      description: "The demo API has a request limit. Please wait a moment before trying again. This is not an application error.",
      duration: 8000,
      variant: "default",
      className: "bg-yellow-100 border-yellow-400 text-yellow-800",
    });
    rateLimitWarningShown = true;
    // Reset the warning after 30 seconds so it can be shown again if needed
    setTimeout(() => {
      rateLimitWarningShown = false;
    }, 30000);
  }
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  method: string = 'GET',
  data?: unknown
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };
    
    if (data) {
      config.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, config);
    
    // Handle rate limiting (HTTP 429)
    if (response.status === 429) {
      showRateLimitWarning();
      console.error(`API Rate Limited (${url}): Too many requests`);
      throw new Error(`API Error: ${response.status} Too Many Requests - Please try again later`);
    }
    
    // Handle other non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`API Error (${url}):`, errorData);
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }
    
    // Empty response for 204 No Content
    if (response.status === 204) {
      return {} as T;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Student API functions
export const studentApi = {
  // Get all students
  getAll: () => apiRequest<Student[]>('/students'),
  
  // Get paginated students
  getPaginated: (params: PaginationParams & { sort?: string }) => 
    apiRequest<PaginatedResponse<Student>>(
      `/students/paged?page=${params.page}&size=${params.size}${params.sort ? `&sort=${params.sort}` : ''}`
    ),
  
  // Get student by ID
  getById: (id: number) => apiRequest<Student>(`/students/${id}`),
  
  // Search students
  search: (query: string) => apiRequest<Student[]>(`/students/search?query=${query}`),
  
  // Create new student
  create: (student: Omit<Student, 'id'>) => apiRequest<Student>('/students', 'POST', student),
  
  // Update student
  update: (id: number, student: Omit<Student, 'id'>) => 
    apiRequest<Student>(`/students/${id}`, 'PUT', student),
  
  // Delete student
  delete: (id: number) => apiRequest<void>(`/students/${id}`, 'DELETE'),
  
  // Get student courses
  getCourses: (id: number) => apiRequest<Course[]>(`/students/${id}/courses`),
  
  // Assign courses to student
  assignCourses: (id: number, courseCodes: string[]) => 
    apiRequest<void>(`/students/${id}/courses`, 'POST', courseCodes),
};

// Course API functions
export const courseApi = {
  // Get all courses
  getAll: () => apiRequest<Course[]>('/courses'),
  
  // Get course by code
  getByCode: (code: string) => apiRequest<Course>(`/courses/${code}`),
  
  // Create new course
  create: (course: Course) => apiRequest<Course>('/courses', 'POST', course),
  
  // Update course
  update: (code: string, course: Course) => 
    apiRequest<Course>(`/courses/${code}`, 'PUT', course),
  
  // Delete course
  delete: (code: string) => apiRequest<void>(`/courses/${code}`, 'DELETE'),
  
  // Get students enrolled in course
  getStudents: (code: string) => apiRequest<Student[]>(`/courses/${code}/students`),
  
  // Get courses by student ID
  getByStudentId: (studentId: number) => 
    apiRequest<Course[]>(`/courses/students/${studentId}`),
  
  // Get courses not taken by student
  getNotTakenByStudent: (studentId: number) => 
    apiRequest<Course[]>(`/courses/not-taken/${studentId}`),
};

// Health check API functions
export const healthApi = {
  check: () => apiRequest<{ status: string }>('/health'),
  details: () => apiRequest<{ status: string, details: Record<string, unknown> }>('/health/details'),
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      // Get real data from the API
      const [studentsResponse, coursesResponse] = await Promise.all([
        studentApi.getAll(),
        courseApi.getAll()
      ]);
      
      const students = studentsResponse;
      const courses = coursesResponse;
      
      // Calculate student-course ratio
      const studentCourseRatio = courses.length > 0 
        ? (students.length / courses.length).toFixed(2) 
        : "0";
      
      // Create recent enrollments based on real students and courses
      const recentEnrollments = [];
      const maxEntries = Math.min(5, students.length);
      
      for (let i = 0; i < maxEntries; i++) {
        if (students[i] && courses[i % courses.length]) {
          recentEnrollments.push({
            student: students[i],
            course: courses[i % courses.length],
            date: new Date(Date.now() - i * 86400000).toISOString() // Last i days
          });
        }
      }
      
      return {
        totalStudents: students.length,
        totalCourses: courses.length,
        studentCourseRatio,
        recentEnrollments
      };
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      // Return empty data structure on error to prevent application crash
      return {
        totalStudents: 0,
        totalCourses: 0,
        studentCourseRatio: "0",
        recentEnrollments: []
      };
    }
  }
};
