
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Edit, Save, X, Heart, MapPin, Briefcase, GraduationCap, Ruler, Settings, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { uploadAvatar } from '@/utils/uploadAvatar';
import { uploadAlbumImage } from '@/utils/uploadAlbumImage';
import { supabase } from '@/integrations/supabase/client';

interface DatingProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdateProfile: (userData: any) => void;
}

const DatingProfile = ({ isOpen, onClose, user, onUpdateProfile }: DatingProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    age: user?.age || 25,
    bio: user?.bio || 'Xin chào! Tôi đang tìm kiếm những kết nối ý nghĩa.',
    avatar: user?.avatar || '',
    album: user?.album || [],
    height: user?.height || 170,
    job: user?.job || '',
    education: user?.education || '',
    location_name: user?.location_name || '',
    gender: user?.gender || 'other',
    is_dating_active: user?.is_dating_active !== false,
    interests: user?.interests || [],
    dating_preferences: user?.dating_preferences || {
      age_range: { min: 18, max: 35 },
      distance: 50,
      gender_preference: 'all'
    }
  });

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          age: profileData.age,
          bio: profileData.bio,
          avatar: profileData.avatar,
          album: profileData.album,
          height: profileData.height,
          job: profileData.job,
          education: profileData.education,
          location_name: profileData.location_name,
          gender: profileData.gender,
          is_dating_active: profileData.is_dating_active,
          interests: profileData.interests,
          dating_preferences: profileData.dating_preferences,
          last_active: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      const updatedUser = { ...user, ...profileData };
      onUpdateProfile(updatedUser);
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Có lỗi khi cập nhật hồ sơ: ' + error.message);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadAvatar(file);
      setProfileData({ ...profileData, avatar: url });
    } catch (err: any) {
      alert(err.message || "Đã có lỗi xảy ra khi upload ảnh đại diện!");
    }
    setIsUploading(false);
  };

  const handleAlbumUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const url = await uploadAlbumImage(file);
        uploadedUrls.push(url);
      }
      setProfileData({ ...profileData, album: [...profileData.album, ...uploadedUrls] });
    } catch (err: any) {
      alert(err.message || "Đã có lỗi xảy ra khi upload ảnh!");
    }
    setIsUploading(false);
    if (albumInputRef.current) albumInputRef.current.value = "";
  };

  const addInterest = (interest: string) => {
    if (interest && !profileData.interests.includes(interest)) {
      setProfileData({
        ...profileData,
        interests: [...profileData.interests, interest]
      });
    }
  };

  const removeInterest = (interest: string) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter(i => i !== interest)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Hồ sơ hẹn hò
            </span>
            <div className="flex items-center gap-2">
              <Switch
                checked={profileData.is_dating_active}
                onCheckedChange={(checked) => 
                  setProfileData({ ...profileData, is_dating_active: checked })
                }
                disabled={!isEditing}
              />
              <span className="text-sm">{profileData.is_dating_active ? 'Hoạt động' : 'Tạm dừng'}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar và Thông tin cơ bản */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={profileData.avatar || '/placeholder.svg'}
                    alt={profileData.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-pink-200"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                  {isEditing && !isUploading && (
                    <>
                      <Button
                        size="sm"
                        className="absolute -bottom-1 -right-1 rounded-full w-6 h-6 p-0 bg-pink-500 hover:bg-pink-600"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Camera className="w-3 h-3" />
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={avatarInputRef}
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </>
                  )}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tên</Label>
                    {isEditing ? (
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      />
                    ) : (
                      <p className="font-medium">{profileData.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Tuổi</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={profileData.age}
                        onChange={(e) => setProfileData({ ...profileData, age: parseInt(e.target.value) })}
                      />
                    ) : (
                      <p className="font-medium">{profileData.age}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giới tính</Label>
                  {isEditing ? (
                    <Select value={profileData.gender} onValueChange={(value) => setProfileData({ ...profileData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Nam</SelectItem>
                        <SelectItem value="female">Nữ</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium">
                      {profileData.gender === 'male' ? 'Nam' : profileData.gender === 'female' ? 'Nữ' : 'Khác'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Ruler className="w-4 h-4" />
                    Chiều cao (cm)
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={profileData.height}
                      onChange={(e) => setProfileData({ ...profileData, height: parseInt(e.target.value) })}
                    />
                  ) : (
                    <p className="font-medium">{profileData.height} cm</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    Nghề nghiệp
                  </Label>
                  {isEditing ? (
                    <Input
                      value={profileData.job}
                      onChange={(e) => setProfileData({ ...profileData, job: e.target.value })}
                      placeholder="Ví dụ: Kỹ sư phần mềm"
                    />
                  ) : (
                    <p className="font-medium">{profileData.job || 'Chưa cập nhật'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    Học vấn
                  </Label>
                  {isEditing ? (
                    <Input
                      value={profileData.education}
                      onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                      placeholder="Ví dụ: Đại học Bách khoa"
                    />
                  ) : (
                    <p className="font-medium">{profileData.education || 'Chưa cập nhật'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Khu vực
                </Label>
                {isEditing ? (
                  <Input
                    value={profileData.location_name}
                    onChange={(e) => setProfileData({ ...profileData, location_name: e.target.value })}
                    placeholder="Ví dụ: Quận 1, TP.HCM"
                  />
                ) : (
                  <p className="font-medium">{profileData.location_name || 'Chưa cập nhật'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Giới thiệu */}
          <Card>
            <CardHeader>
              <CardTitle>Giới thiệu bản thân</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Hãy viết vài dòng để người khác hiểu về bạn..."
                  className="min-h-[100px]"
                />
              ) : (
                <p className="text-gray-600">{profileData.bio}</p>
              )}
            </CardContent>
          </Card>

          {/* Sở thích */}
          <Card>
            <CardHeader>
              <CardTitle>Sở thích</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Thêm sở thích..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addInterest((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {profileData.interests.map((interest: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                    {interest}
                    {isEditing && (
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-red-500" 
                        onClick={() => removeInterest(interest)}
                      />
                    )}
                  </Badge>
                ))}
                {profileData.interests.length === 0 && (
                  <p className="text-gray-400 text-sm">Chưa có sở thích nào</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Album ảnh */}
          <Card>
            <CardHeader>
              <CardTitle>Album ảnh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing && (
                <Button
                  onClick={() => albumInputRef.current?.click()}
                  size="sm"
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  Thêm ảnh
                </Button>
              )}
              <input
                type="file"
                accept="image/*"
                ref={albumInputRef}
                className="hidden"
                multiple
                onChange={handleAlbumUpload}
              />
              {profileData.album && profileData.album.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {profileData.album.map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Ảnh ${idx + 1}`}
                      className="rounded-lg object-cover w-full h-24 border"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Chưa có ảnh nào</p>
              )}
            </CardContent>
          </Card>

          {/* Tùy chọn tìm kiếm */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Tùy chọn tìm kiếm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Độ tuổi mong muốn: {profileData.dating_preferences.age_range.min} - {profileData.dating_preferences.age_range.max}</Label>
                  <div className="px-2">
                    <Slider
                      value={[profileData.dating_preferences.age_range.min, profileData.dating_preferences.age_range.max]}
                      onValueChange={([min, max]) => 
                        setProfileData({
                          ...profileData,
                          dating_preferences: {
                            ...profileData.dating_preferences,
                            age_range: { min, max }
                          }
                        })
                      }
                      min={18}
                      max={60}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Khoảng cách tối đa: {profileData.dating_preferences.distance} km</Label>
                  <div className="px-2">
                    <Slider
                      value={[profileData.dating_preferences.distance]}
                      onValueChange={([distance]) => 
                        setProfileData({
                          ...profileData,
                          dating_preferences: {
                            ...profileData.dating_preferences,
                            distance
                          }
                        })
                      }
                      min={5}
                      max={200}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Giới tính quan tâm</Label>
                  <Select 
                    value={profileData.dating_preferences.gender_preference} 
                    onValueChange={(value) => 
                      setProfileData({
                        ...profileData,
                        dating_preferences: {
                          ...profileData.dating_preferences,
                          gender_preference: value
                        }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          {isEditing && (
            <Button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
              disabled={isUploading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isUploading ? "Đang tải lên..." : "Lưu hồ sơ hẹn hò"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DatingProfile;
