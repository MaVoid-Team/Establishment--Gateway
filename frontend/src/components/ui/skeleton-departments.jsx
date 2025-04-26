

const DepartmentSkeleton = ({ count = 4 }) => {
    return (
      <div className="animate-pulse grid grid-cols-1 gap-4">
        {[...Array(count)].map((_, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            {/* Skeleton for Department Name */}
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
            
            {/* Skeleton for Additional Info (Optional) */}
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
            
            {/* Skeleton for Action Button */}
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          </div>
        ))}
      </div>
    )
  }
  

export default DepartmentSkeleton;
