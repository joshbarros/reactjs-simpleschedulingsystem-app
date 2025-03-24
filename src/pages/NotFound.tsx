
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
      <h1 className="text-display-lg font-bold text-primary mb-4">404</h1>
      <h2 className="text-headline-lg font-semibold mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild>
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Dashboard
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
