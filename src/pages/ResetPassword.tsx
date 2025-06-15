
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!password || !password2) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (password !== password2) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    // Gọi Supabase updateUser để thay đổi mật khẩu
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message || "Không thể đặt lại mật khẩu.");
    } else {
      setInfo("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Đặt lại mật khẩu</CardTitle>
          <CardDescription>
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Mật khẩu mới</Label>
              <Input
                type="password"
                value={password}
                minLength={6}
                placeholder="Nhập mật khẩu mới"
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
