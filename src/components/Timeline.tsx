
import React from "react";
import TimelineWithFallback from "./TimelineWithFallback";
import TimelineErrorBoundary from "./TimelineErrorBoundary";
import { useUser } from "@/hooks/useUser";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Timeline = () => {
  const { user, isLoading, isAuthenticated, error } = useUser();
  
  console.log('🏁 Timeline wrapper render - user loading state:', {
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    hasError: !!error
  });

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-12 w-full" />
          </Card>
          
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-20 w-full mb-3" />
              <div className="flex gap-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state if user loading failed
  if (error && !isAuthenticated) {
    return (
      <div className="h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4">Lỗi đăng nhập</h2>
          <p className="text-gray-600 mb-6">
            Không thể tải thông tin người dùng. Vui lòng thử đăng nhập lại.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tải lại trang
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/auth'} 
              className="w-full"
            >
              Đăng nhập lại
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render Timeline regardless of user profile status
  // Timeline should work even for unauthenticated users (read-only mode)
  return (
    <TimelineErrorBoundary>
      <TimelineWithFallback user={user} />
    </TimelineErrorBoundary>
  );
};

export default Timeline;
