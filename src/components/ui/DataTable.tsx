
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Column } from '@/types';

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  pagination?: {
    pageCount: number;
    currentPage: number;
    onPageChange: (page: number) => void;
  };
  searchable?: boolean;
  onSearch?: (query: string) => void;
  actions?: {
    label: string;
    onClick: (row: T) => void;
    icon?: React.ReactNode;
  }[];
  keyExtractor: (row: T) => string | number;
}

export default function DataTable<T>({
  data,
  columns,
  onRowClick,
  isLoading = false,
  pagination,
  searchable = false,
  onSearch,
  actions,
  keyExtractor,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className="space-y-4">
      {searchable && (
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>
                  {column.header}
                </TableHead>
              ))}
              {actions && <TableHead className="w-[80px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="h-24 text-center"
                >
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={keyExtractor(row)}
                  className={cn(
                    "transition-colors hover:bg-muted/50",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((column) => (
                    <TableCell key={`${keyExtractor(row)}-${column.id}`}>
                      {column.cell
                        ? column.cell(row)
                        : column.accessorFn
                        ? column.accessorFn(row)
                        : column.accessorKey
                        ? String(row[column.accessorKey] || '')
                        : ''}
                    </TableCell>
                  ))}
                  
                  {actions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {actions.map((action, i) => (
                            <DropdownMenuItem
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                            >
                              {action.icon && <span className="mr-2">{action.icon}</span>}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.pageCount > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.currentPage > 0) {
                    pagination.onPageChange(pagination.currentPage - 1);
                  }
                }}
                className={cn(
                  pagination.currentPage === 0 && "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>
            
            {Array.from({ length: pagination.pageCount }).map((_, i) => {
              // Show first page, last page, current page and 1 page on each side of current
              const shouldShow =
                i === 0 ||
                i === pagination.pageCount - 1 ||
                Math.abs(i - pagination.currentPage) <= 1;
              
              // Show ellipsis
              const showEllipsisBefore =
                i === pagination.currentPage - 2 && pagination.currentPage > 2;
              const showEllipsisAfter =
                i === pagination.currentPage + 2 &&
                pagination.currentPage < pagination.pageCount - 3;
              
              if (showEllipsisBefore) {
                return (
                  <PaginationItem key={`ellipsis-before-${i}`}>
                    <span className="px-4 py-2">...</span>
                  </PaginationItem>
                );
              }
              
              if (showEllipsisAfter) {
                return (
                  <PaginationItem key={`ellipsis-after-${i}`}>
                    <span className="px-4 py-2">...</span>
                  </PaginationItem>
                );
              }
              
              if (shouldShow) {
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        pagination.onPageChange(i);
                      }}
                      isActive={pagination.currentPage === i}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              
              return null;
            })}
            
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.currentPage < pagination.pageCount - 1) {
                    pagination.onPageChange(pagination.currentPage + 1);
                  }
                }}
                className={cn(
                  pagination.currentPage === pagination.pageCount - 1 &&
                    "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
