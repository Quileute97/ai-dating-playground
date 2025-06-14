
import React from "react";
import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RequireLoginProps {
  onLogin: () => void;
}

export default function RequireLogin({ onLogin }: RequireLoginProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24">
      <Card className="max-w-xs w-full p-6 flex flex-col items-center bg-white/90 shadow-lg">
        <div className="mb-4">
          <Heart className="w-10 h-10 text-pink-500" />
        </div>
        <div className="text-lg font-semibold mb-2 text-center">
          Đăng nhập để sử dụng tính năng này!
        </div>
        <div className="text-gray-600 text-center mb-6">
          Vui lòng đăng nhập để trải nghiệm Hẹn hò hoặc Quanh đây.
        </div>
        <Button
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-full"
          onClick={onLogin}
        >
          Đăng nhập
        </Button>
      </Card>
    </div>
  );
}
