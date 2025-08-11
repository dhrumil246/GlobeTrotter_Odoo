import { cn } from '@/app/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className, padding = 'md', hover = false }: CardProps) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white shadow-sm',
        paddingClasses[padding],
        hover && 'transition-shadow hover:shadow-md cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className }: CardHeaderProps) => (
  <div className={cn('space-y-1.5', className)}>
    {children}
  </div>
);

const CardContent = ({ children, className }: CardContentProps) => (
  <div className={cn('pt-6', className)}>
    {children}
  </div>
);

const CardFooter = ({ children, className }: CardFooterProps) => (
  <div className={cn('flex items-center pt-6', className)}>
    {children}
  </div>
);

export { Card, CardHeader, CardContent, CardFooter };