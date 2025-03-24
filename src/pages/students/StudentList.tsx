import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit, Trash, Eye } from 'lucide-react';
import { Student, Column, PaginatedResponse } from '@/types';
import { studentApi } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

const StudentList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortField] = useState('id'); // Default sort field
  const [sortDirection] = useState('asc'); // Default sort direction

  // Fetch students with pagination
  const fetchStudents = async (page = 0, size = pageSize, query = '') => {
    try {
      setIsLoading(true);
      
      let data: Student[] | PaginatedResponse<Student>;
      
      if (query) {
        // Use search endpoint
        data = await studentApi.search(query);
        setStudents(data as Student[]);
        setTotalPages(Math.ceil((data as Student[]).length / size));
      } else {
        // Use pagination endpoint
        const sortParam = `${sortField},${sortDirection}`;
        data = await studentApi.getPaginated({ 
          page, 
          size,
          sort: sortParam
        });
        
        setStudents((data as PaginatedResponse<Student>).content);
        setTotalPages((data as PaginatedResponse<Student>).totalPages);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStudents(currentPage);
  }, [currentPage, pageSize]);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    fetchStudents(0, pageSize, query);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle delete
  const handleDelete = async (student: Student) => {
    if (window.confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
      try {
        await studentApi.delete(student.id);
        // Refetch the current page to update the list
        fetchStudents(currentPage, pageSize, searchQuery);
        toast({
          title: 'Success',
          description: `${student.firstName} ${student.lastName} has been deleted.`,
        });
      } catch (error) {
        console.error('Error deleting student:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete student. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  // Table columns definition
  const columns: Column<Student>[] = [
    {
      id: 'id',
      header: 'ID',
      accessorKey: 'id',
    },
    {
      id: 'name',
      header: 'Name',
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'email',
    },
    {
      id: 'courses',
      header: 'Courses',
      accessorFn: (row) => row.courses?.length || 0,
    },
  ];

  // Row actions
  const actions = [
    {
      label: 'View',
      onClick: (student: Student) => navigate(`/students/${student.id}`),
      icon: <Eye className="h-4 w-4" />,
    },
    {
      label: 'Edit',
      onClick: (student: Student) => navigate(`/students/${student.id}/edit`),
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
          <h1 className="text-display-sm font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage student information and enrollments
          </p>
        </div>
        <Button onClick={() => navigate('/students/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Student List</h2>
            
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] sm:w-[300px]"
              />
              <Button 
                onClick={() => handleSearch(searchQuery)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </Button>
            </div>
          </div>

          <DataTable
            data={students}
            columns={columns}
            isLoading={isLoading}
            onRowClick={(student) => navigate(`/students/${student.id}`)}
            actions={actions}
            searchable={false}
            keyExtractor={(row) => row.id}
            pagination={{
              pageCount: totalPages,
              currentPage: currentPage,
              onPageChange: handlePageChange
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentList;
