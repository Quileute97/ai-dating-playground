
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Edit, Save, X, Plus, Loader2 } from 'lucide-react';
import { uploadAvatar } from '@/utils/uploadAvatar';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdateProfile: (userData: any) => void;
}

const UserProfile = ({ isOpen, onClose, user, onUpdateProfile }: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    location: user?.location || '',
    bio: user?.bio || 'Chào mọi người! Tôi đang tìm kiếm những kết nối thú vị.',
    interests: user?.interests || [],
    newInterest: '',
    avatar: user?.avatar || '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const updatedUser = {
      ...user,
      ...profileData,
      interests: profileData.interests,
      avatar: profileData.avatar,
    };
    onUpdateProfile(updatedUser);
    setIsEditing(false);
  };

  const addInterest = () => {
    if (profileData.newInterest.trim() && !profileData.interests.includes(profileData.newInterest.trim())) {
      setProfileData({
        ...profileData,
        interests: [...profileData.interests, profileData.newInterest.trim()],
        newInterest: ''
      });
    }
  };

  const removeInterest = (interest: string) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter(i => i !== interest)
    });
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Hồ sơ của tôi
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={profileData.avatar || user?.avatar || '/placeholder.svg'}
                alt={user?.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              {isEditing && !isUploading && (
                <>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-purple-500 hover:bg-purple-600"
                    type="button"
                    onClick={handleCameraClick}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium">{user?.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Tuổi</Label>
                  {isEditing ? (
                    <Input
                      id="age"
                      type="number"
                      value={profileData.age}
                      onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium">{user?.age}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Địa điểm</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">{user?.location}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Giới thiệu</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Viết vài dòng về bản thân..."
                  className="min-h-[100px]"
                />
              ) : (
                <p className="text-gray-600">{profileData.bio}</p>
              )}
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sở thích</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profileData.interests.map((interest, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-purple-100 text-purple-700 hover:bg-purple-200"
                  >
                    {interest}
                    {isEditing && (
                      <button
                        onClick={() => removeInterest(interest)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Thêm sở thích mới..."
                    value={profileData.newInterest}
                    onChange={(e) => setProfileData({ ...profileData, newInterest: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                  />
                  <Button onClick={addInterest} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          {isEditing && (
            <Button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={isUploading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isUploading ? "Đang tải lên ảnh..." : "Lưu thay đổi"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile;
