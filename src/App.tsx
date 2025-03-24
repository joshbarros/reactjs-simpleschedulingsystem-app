
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import { ToastProvider } from "@/hooks/use-toast";
import { ThemeProvider } from "@/components/ThemeProvider";

// Pages
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import StudentList from "./pages/students/StudentList";
import StudentDetail from "./pages/students/StudentDetail";
import StudentForm from "./pages/students/StudentForm";
import CourseList from "./pages/courses/CourseList";
import CourseDetail from "./pages/courses/CourseDetail";
import CourseForm from "./pages/courses/CourseForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <MainLayout>
              <Routes>
                {/* Auth Routes */}
                <Route path="/auth/login" element={<Login />} />
                
                {/* Main Routes */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Student Routes */}
                <Route path="/students" element={<StudentList />} />
                <Route path="/students/:id" element={<StudentDetail />} />
                <Route path="/students/new" element={<StudentForm />} />
                <Route path="/students/:id/edit" element={<StudentForm />} />
                
                {/* Course Routes */}
                <Route path="/courses" element={<CourseList />} />
                <Route path="/courses/:code" element={<CourseDetail />} />
                <Route path="/courses/new" element={<CourseForm />} />
                <Route path="/courses/:code/edit" element={<CourseForm />} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
            <ShadcnToaster />
            <SonnerToaster />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
