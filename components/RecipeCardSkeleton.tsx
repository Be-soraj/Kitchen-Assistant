
import React from 'react';

const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:2000px_100%] rounded-md ${className}`}>&nbsp;</div>
);


export const RecipeCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 md:p-8">
        <Shimmer className="h-10 w-3/4 mb-4" />
        <Shimmer className="h-5 w-full mb-2" />
        <Shimmer className="h-5 w-5/6 mb-8" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="flex flex-col items-center text-center p-3 bg-gray-100 rounded-lg h-24"></div>
          <div className="flex flex-col items-center text-center p-3 bg-gray-100 rounded-lg h-24"></div>
          <div className="flex flex-col items-center text-center p-3 bg-gray-100 rounded-lg h-24"></div>
          <div className="flex flex-col items-center text-center p-3 bg-gray-100 rounded-lg h-24"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Shimmer className="h-8 w-1/2 mb-6" />
            <div className="space-y-4">
              <Shimmer className="h-5 w-full" />
              <Shimmer className="h-5 w-5/6" />
              <Shimmer className="h-5 w-3/4" />
              <Shimmer className="h-5 w-full" />
            </div>
          </div>
          <div>
            <Shimmer className="h-8 w-1/2 mb-6" />
            <div className="space-y-4">
              <Shimmer className="h-5 w-full" />
              <Shimmer className="h-5 w-full" />
              <Shimmer className="h-5 w-11/12" />
              <Shimmer className="h-5 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
