// Student type
export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  courses?: Course[];
}

// Course type
export interface Course {
  code: string;
  title: string;
  description: string;
  students?: Student[];
}

// Mock User for authentication
export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
}

// Authentication response
export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

// Pagination parameters
export interface PaginationParams {
  page: number;
  size: number;
}

// Pagination response
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

// API response type
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

// Dashboard stats
export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  studentCourseRatio?: string;
  recentEnrollments: {
    student: Omit<Student, 'courses'>;
    course: Omit<Course, 'students'>;
    date: string;
  }[];
}

// Table column definition
export interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => string | number | React.ReactNode;
  cell?: (row: T) => React.ReactNode;
}

// Form field validation error
export interface FieldError {
  field: string;
  message: string;
}

// Toast notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Toast notification
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}
