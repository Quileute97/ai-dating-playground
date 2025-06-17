
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra xem có session hợp lệ từ email link không
    const checkSession = async () => {
      console.log("🔍 Checking reset password session...");
      
      // Lấy session hiện tại
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("📊 Current session:", { session, error });
      
      if (session && session.user) {
        console.log("✅ Valid session found for password reset");
        setIsValidSession(true);
      } else {
        console.log("❌ No valid session found");
        setError("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.");
        
        // Redirect về trang chính sau 3 giây
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    };

    checkSession();

    // Lắng nghe auth state changes để handle khi user click vào email link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth state change:", event, session?.user?.id);
      
      if (event === 'PASSWORD_RECOVERY' && session) {
        console.log("✅ Password recovery session detected");
        setIsValidSession(true);
        setError("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!isValidSession) {
      setError("Phiên làm việc không hợp lệ. Vui lòng yêu cầu link đặt lại mật khẩu mới.");
      return;
    }

    if (!password || !password2) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== password2) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    console.log("🔐 Updating password...");

    try {
      // Gọi Supabase updateUser để thay đổi mật khẩu
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (updateError) {
        console.error("❌ Password update error:", updateError);
        setError(updateError.message || "Không thể đặt lại mật khẩu.");
      } else {
        console.log("✅ Password updated successfully");
        setInfo("Đặt lại mật khẩu thành công! Bạn sẽ được chuyển về trang chính...");
        
        // Redirect về trang chính sau 2 giây
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (ex: any) {
      console.error("💥 Exception during password update:", ex);
      setError("Có lỗi xảy ra: " + ex.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Đặt lại mật khẩu</CardTitle>
          <CardDescription>
            {isValidSession ? 
              "Vui lòng nhập mật khẩu mới cho tài khoản của bạn." :
              "Đang kiểm tra phiên làm việc..."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isValidSession ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label>Mật khẩu mới</Label>
                <Input
                  type="password"
                  value={password}
                  minLength={6}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Xác nhận mật khẩu mới</Label>
                <Input
                  type="password"
                  value={password2}
                  placeholder="Nhập lại mật khẩu"
                  onChange={e => setPassword2(e.target.value)}
                  required
                />
              </div>
              {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
              {info && <div className="text-green-600 text-sm bg-green-50 p-2 rounded">{info}</div>}
              <Button disabled={loading} className="w-full" type="submit">
                {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              {error ? (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>
              ) : (
                <div className="text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                  Đang kiểm tra phiên làm việc...
                </div>
              )}
              <Button 
                onClick={() => navigate("/")}
                variant="outline"
                className="w-full"
              >
                Quay về trang chính
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
