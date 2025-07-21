interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'circle' | 'button';
  count?: number;
}

export default function LoadingSkeleton({ 
  className = '', 
  variant = 'text',
  count = 1 
}: LoadingSkeletonProps) {
  const getSkeletonClass = () => {
    const baseClass = 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-cover';
    
    switch (variant) {
      case 'card':
        return `${baseClass} h-48 w-full rounded-2xl`;
      case 'circle':
        return `${baseClass} w-10 h-10 rounded-full`;
      case 'button':
        return `${baseClass} h-10 w-24 rounded-xl`;
      case 'text':
      default:
        return `${baseClass} h-4 rounded`;
    }
  };

  const skeletonStyle = {
    backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    backgroundSize: '200px 100%',
    animation: 'shimmer 1.5s infinite'
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className={getSkeletonClass()}
          style={skeletonStyle}
        />
      ))}
    </div>
  );
}

// Specific skeleton components for common use cases
export function SpotCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <LoadingSkeleton variant="card" className="mb-0" />
      <div className="p-4 space-y-3">
        <LoadingSkeleton className="w-3/4" />
        <LoadingSkeleton className="w-1/2" />
        <LoadingSkeleton className="w-full" />
        <div className="flex gap-2">
          <LoadingSkeleton variant="button" />
          <LoadingSkeleton variant="button" />
        </div>
      </div>
    </div>
  );
}

export function BadgeCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg">
      <div className="flex items-center space-x-3">
        <LoadingSkeleton variant="circle" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton className="w-3/4" />
          <LoadingSkeleton className="w-1/2" />
        </div>
      </div>
    </div>
  );
}