
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
}) => {
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-medium",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-title-md font-medium text-muted-foreground">{title}</CardTitle>
        {icon && (
          <div className="rounded-full bg-primary/10 backdrop-blur-sm p-2 text-primary shadow-sm">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-display-sm font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {value}
        </div>
        
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
        
        {trend && (
          <div className="mt-2 flex items-center">
            <span 
              className={cn(
                "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full backdrop-blur-sm",
                trend.isPositive 
                  ? "text-success bg-success/10" 
                  : "text-destructive bg-destructive/10"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span className="ml-1 text-xs text-muted-foreground">vs. last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
