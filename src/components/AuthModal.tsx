import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Mail, Lock, User, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Thêm dialog quên mật khẩu nhỏ gọn
function ForgotPasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password"
    });
    if (error) {
      setError(error.message || "Không thể gửi email đặt lại mật khẩu.");
    } else {
      setInfo("Nếu email đúng, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu trong hộp thư.");
    }
    setLoading(false);
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Quên mật khẩu</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSend} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
          {info && <div className="text-green-600 text-sm bg-green-50 p-2 rounded">{info}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi mail đặt lại mật khẩu"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: any) => void;
}

const AuthModal = ({ isOpen, onClose, onLogin }: AuthModalProps) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'male',
    interests: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(''); // Thông báo thành công/xác nhận
  const [showForgot, setShowForgot] = useState(false);

  // Utility: Cleanup all Supabase Auth keys in localStorage and sessionStorage
  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  // Đăng nhập với Supabase Auth
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');
    // Làm sạch storage, logout toàn cục trước khi login
    cleanupAuthState();
    try {
      // Bắt buộc signOut toàn cục
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Ignore errors here – may be logout stale session
    }
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });
      if (loginError) {
        setError('Sai email hoặc mật khẩu.');
        setIsLoading(false);
        return;
      }
      const user = data.user;
      if (!user) {
        setError('Không thể xác thực user!');
        setIsLoading(false);
        return;
      }
      // Lấy info profile từ bảng profiles nếu có
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      onLogin({
        ...user,
        ...(profiles || {}),
        email: user.email,
        avatar: profiles?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', // fallback
        name: profiles?.name || user.email,
        age: profiles?.age,
        gender: profiles?.gender,
        interests: []
      });
      setIsLoading(false);
      setError('');
      onClose();
      // Force reload page để nhận session/rols cập nhật
      window.location.href = "/";
    } catch (ex: any) {
      setError('Có lỗi xảy ra: ' + ex.message);
      setIsLoading(false);
    }
  };

  // Đăng ký với Supabase Auth (yêu cầu xác nhận email)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error: signupError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: registerData.name,
            age: registerData.age,
            gender: registerData.gender,
            // Tùy bạn có map interests sang meta hay không
          }
        }
      });
      if (signupError) {
        setError(signupError.message || 'Đăng ký thất bại.');
        setIsLoading(false);
        return;
      }
      setInfo(
        'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập.'
      );
      setIsLoading(false);
    } catch (ex: any) {
      setError('Có lỗi xảy ra: ' + ex.message);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Heart className="w-6 h-6 text-pink-500" />
            Chào mừng đến với Love App
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Đăng nhập</TabsTrigger>
            <TabsTrigger value="register">Đăng ký</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Đăng nhập</CardTitle>
                <CardDescription>Nhập thông tin để tiếp tục</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
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
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-xs text-blue-600 underline hover:text-blue-800"
                      tabIndex={-1}
                      onClick={() => setShowForgot(true)}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>
                  )}
                  {info && (
                    <div className="text-green-600 text-sm bg-green-50 p-2 rounded">{info}</div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Đang đăng nhập...
                      </div>
                    ) : (
                      'Đăng nhập'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Tạo tài khoản</CardTitle>
                <CardDescription>Điền thông tin để bắt đầu</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên của bạn</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="name"
                        placeholder="Nguyễn Văn A"
                        className="pl-10"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="age">Tuổi</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="age"
                          type="number"
                          placeholder="25"
                          className="pl-10"
                          value={registerData.age}
                          onChange={(e) => setRegisterData({ ...registerData, age: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Giới tính</Label>
                      <select
                        id="gender"
                        className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                        value={registerData.gender}
                        onChange={(e) => setRegisterData({ ...registerData, gender: e.target.value })}
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
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
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>
                  )}
                  {info && (
                    <div className="text-green-600 text-sm bg-green-50 p-2 rounded">{info}</div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Đang tạo tài khoản...
                      </div>
                    ) : (
                      'Tạo tài khoản'
                    )}
                  </Button>
                  <div className="text-xs text-gray-500 mt-2">Sau khi đăng ký, bạn cần kiểm tra email để xác nhận tài khoản trước khi đăng nhập.</div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
      <ForgotPasswordDialog open={showForgot} onClose={() => setShowForgot(false)} />
    </Dialog>
  );
};

export default AuthModal;
