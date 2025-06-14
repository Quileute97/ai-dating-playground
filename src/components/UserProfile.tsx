
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Edit, Save, X, Plus, Loader2, ImagePlus } from 'lucide-react';
import { uploadAvatar } from '@/utils/uploadAvatar';
import { uploadAlbumImage } from '@/utils/uploadAlbumImage';

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
    bio: user?.bio || 'Chào mọi người! Tôi đang tìm kiếm những kết nối thú vị.',
    avatar: user?.avatar || '',
    album: user?.album || [],
  });
  const [isUploading, setIsUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const updatedUser = {
      ...user,
      ...profileData,
      album: profileData.album,
      avatar: profileData.avatar,
    };
    onUpdateProfile(updatedUser);
    setIsEditing(false);
  };

  const handleCameraClick = () => {
    if (avatarInputRef.current) avatarInputRef.current.click();
  };

  const handleAlbumClick = () => {
    if (albumInputRef.current) albumInputRef.current.click();
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

  const handleAlbumFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      alert(err.message || "Đã có lỗi xảy ra khi upload ảnh vào album!");
    }
    setIsUploading(false);
    if (albumInputRef.current) albumInputRef.current.value = ""; // reset input
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
                    ref={avatarInputRef}
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

          {/* Album Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Album ảnh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleAlbumClick}
                    size="sm"
                    type="button"
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <ImagePlus className="w-4 h-4 mr-1" />
                    Thêm ảnh vào album
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={albumInputRef}
                    className="hidden"
                    multiple
                    onChange={handleAlbumFileChange}
                  />
                  {isUploading && <Loader2 className="ml-2 w-5 h-5 text-purple-500 animate-spin" />}
                </div>
              )}
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
                <div className="text-sm text-gray-400">Chưa có ảnh nào trong album.</div>
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

