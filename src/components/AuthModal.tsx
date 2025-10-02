import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Mail, Lock, User, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';

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
    
    // Sửa lại URL redirect để đúng với route /reset-password
    const redirectUrl = `${window.location.origin}/reset-password`;
    console.log("🔗 Reset password redirect URL:", redirectUrl);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    
    if (error) {
      console.error("❌ Reset password error:", error);
      setError(error.message || "Không thể gửi email đặt lại mật khẩu.");
    } else {
      console.log("✅ Reset password email sent successfully");
      setInfo("Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư và click vào link để đặt lại mật khẩu.");
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
    console.log("🧹 Cleaning up auth state...");
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
        console.log("🗑️ Removed localStorage key:", key);
      }
    });
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
        console.log("🗑️ Removed sessionStorage key:", key);
      }
    });
  };

  // Đăng nhập với Google
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    setInfo('');
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      console.log("🔗 Google OAuth redirect URL:", redirectUrl);
      
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        }
      });
      
      if (oauthError) {
        console.error("❌ Google OAuth error:", oauthError);
        setError(oauthError.message || 'Đăng nhập Google thất bại.');
        setIsLoading(false);
      }
      // User sẽ được redirect sang Google, không cần handle thêm
    } catch (ex: any) {
      console.error("💥 Exception during Google login:", ex);
      setError('Có lỗi xảy ra: ' + ex.message);
      setIsLoading(false);
    }
  };

  // Đăng nhập với Supabase Auth
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');
    
    console.log("🔐 Attempting login for:", loginData.email);
    
    // Làm sạch storage, logout toàn cục trước khi login
    cleanupAuthState();
    try {
      console.log("🔄 Signing out globally...");
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.log("⚠️ Logout error (ignored):", err);
    }
    
    try {
      console.log("📧 Signing in with email/password...");
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });
      
      console.log("📊 Login response:", { data, error: loginError });
      
      if (loginError) {
        console.error("❌ Login error:", loginError);
        if (loginError.message?.includes('Invalid login credentials')) {
          setError('Sai email hoặc mật khẩu. Vui lòng kiểm tra lại hoặc xác nhận email nếu chưa làm.');
        } else if (loginError.message?.includes('Email not confirmed')) {
          setError('Email chưa được xác nhận. Vui lòng kiểm tra hộp thư và click vào link xác nhận.');
        } else {
          setError(loginError.message || 'Đăng nhập thất bại.');
        }
        setIsLoading(false);
        return;
      }
      
      const user = data.user;
      if (!user) {
        setError('Không thể xác thực user!');
        setIsLoading(false);
        return;
      }
      
      console.log("✅ User authenticated:", user.id);
      
      // Lấy info profile từ bảng profiles nếu có, nếu không có sẽ được tạo tự động bởi trigger
      console.log("📋 Fetching user profile...");
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log("📊 Profile data:", { profiles, error: pErr });
      
      // Nếu chưa có profile, có thể do trigger chưa chạy, tạo tạm thời
      let finalProfile = profiles;
      if (pErr && pErr.code === 'PGRST116') {
        console.log("🔄 Creating temporary profile...");
        finalProfile = {
          id: user.id,
          name: user.email?.split('@')[0] || 'User',
          age: 25,
          gender: 'other',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          bio: 'Xin chào! Tôi đang tìm kiếm những kết nối ý nghĩa.',
          interests: [],
          album: [],
          height: 170,
          job: null,
          education: null,
          location_name: null,
          lat: null,
          lng: null,
          is_dating_active: true,
          last_active: new Date().toISOString(),
          created_at: new Date().toISOString(),
          tai_khoan_hoat_dong: true,
          is_premium: false,
          premium_expires: null,
          dating_preferences: {
            age_range: { min: 18, max: 35 },
            distance: 50,
            gender_preference: 'all'
          }
        };
      }
      
      const userData = {
        ...user,
        ...finalProfile,
        email: user.email,
      };
      
      console.log("👤 Final user data:", userData);
      
      onLogin(userData);
      setIsLoading(false);
      setError('');
      onClose();
      
      // Force reload page để nhận session/roles cập nhật
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      
    } catch (ex: any) {
      console.error("💥 Exception during login:", ex);
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
    
    console.log("📝 Attempting registration for:", registerData.email);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      console.log("🔗 Redirect URL:", redirectUrl);
      
      const { data, error: signupError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: registerData.name,
            age: parseInt(registerData.age),
            gender: registerData.gender,
          }
        }
      });
      
      console.log("📊 Signup response:", { data, error: signupError });
      
      if (signupError) {
        console.error("❌ Signup error:", signupError);
        if (signupError.message?.includes('User already registered')) {
          setError('Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.');
        } else {
          setError(signupError.message || 'Đăng ký thất bại.');
        }
        setIsLoading(false);
        return;
      }
      
      console.log("✅ Registration successful for user:", data.user?.id);
      
      setInfo(
        'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập. Sau khi xác nhận, hệ thống sẽ tự động tạo hồ sơ hẹn hò cho bạn.'
      );
      setIsLoading(false);
      
    } catch (ex: any) {
      console.error("💥 Exception during registration:", ex);
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
            Chào mừng đến với Hyliya
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

                  <div className="relative my-4">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                      hoặc
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Đăng nhập với Google
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Tạo tài khoản</CardTitle>
                <CardDescription>Điền thông tin để bắt đầu. Hệ thống sẽ tự động tạo hồ sơ hẹn hò cho bạn!</CardDescription>
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
                  <div className="text-xs text-gray-500 mt-2">Sau khi đăng ký, bạn cần kiểm tra email để xác nhận tài khoản. Hệ thống sẽ tự động tạo hồ sơ hẹn hò cho bạn!</div>
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
