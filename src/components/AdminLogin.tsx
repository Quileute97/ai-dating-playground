
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, User } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
}

const AdminLogin = ({ isOpen, onClose, onLogin }: AdminLoginProps) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    // Đăng nhập Supabase Auth
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (loginError) {
      setError('Sai tài khoản hoặc mật khẩu Supabase');
      setIsLoading(false);
      return;
    }
    // Kiểm tra quyền admin (truy vấn bảng user_roles)
    const user = data.user;
    if (!user) {
      setError('Đăng nhập thất bại!');
      setIsLoading(false);
      return;
    }
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');
    if (roleError || !roles || roles.length === 0) {
      setError('Tài khoản này không có quyền admin!');
      setIsLoading(false);
      return;
    }
    // Thành công
    setTimeout(() => {
      onLogin(user);
      setIsLoading(false);
      onClose();
    }, 800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Shield className="w-6 h-6 text-blue-500" />
            Đăng nhập Admin
          </DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle>Xác thực quản trị viên</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email đăng nhập</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    className="pl-10"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang xác thực...
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </form>
            <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Đăng nhập với tài khoản Supabase đã gán quyền "admin" <br />
              <b>Bạn cần tự thêm vai trò admin cho account này bằng bảng user_roles trên Supabase dashboard</b>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLogin;
