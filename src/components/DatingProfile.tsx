
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, Edit, Save, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { uploadAvatar } from '@/utils/uploadAvatar';
import { uploadAlbumImage } from '@/utils/uploadAlbumImage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BasicInfoSection from './dating-profile/BasicInfoSection';
import BioSection from './dating-profile/BioSection';
import InterestsSection from './dating-profile/InterestsSection';
import AlbumSection from './dating-profile/AlbumSection';
import PreferencesSection from './dating-profile/PreferencesSection';

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
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Có lỗi khi cập nhật hồ sơ: ' + error.message);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log('Starting avatar upload:', file.name);
    setIsUploading(true);
    
    try {
      const url = await uploadAvatar(file);
      console.log('Avatar uploaded successfully:', url);
      setProfileData({ ...profileData, avatar: url });
      toast.success('Tải ảnh đại diện thành công!');
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      toast.error(err.message || "Đã có lỗi xảy ra khi upload ảnh đại diện!");
    } finally {
      setIsUploading(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleAlbumUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    
    console.log('Starting album upload, files count:', files.length);
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of Array.from(files)) {
        console.log('Uploading album image:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        // Kiểm tra file type
        if (!file.type.startsWith('image/')) {
          console.error('Invalid file type:', file.type);
          toast.error(`File ${file.name} không phải là ảnh hợp lệ!`);
          continue;
        }
        
        // Kiểm tra file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          console.error('File too large:', file.size);
          toast.error(`File ${file.name} quá lớn! Vui lòng chọn file nhỏ hơn 10MB.`);
          continue;
        }
        
        const url = await uploadAlbumImage(file);
        console.log('Album image uploaded:', url);
        uploadedUrls.push(url);
      }
      
      if (uploadedUrls.length > 0) {
        const newAlbum = [...(profileData.album || []), ...uploadedUrls];
        setProfileData({ ...profileData, album: newAlbum });
        toast.success(`Tải thành công ${uploadedUrls.length} ảnh vào album!`);
      }
    } catch (err: any) {
      console.error('Album upload error:', err);
      toast.error(err.message || "Đã có lỗi xảy ra khi upload ảnh!");
    } finally {
      setIsUploading(false);
      if (albumInputRef.current) {
        albumInputRef.current.value = "";
      }
    }
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
          <BasicInfoSection
            profileData={profileData}
            setProfileData={setProfileData}
            isEditing={isEditing}
            isUploading={isUploading}
            avatarInputRef={avatarInputRef}
            onAvatarUpload={handleAvatarUpload}
          />

          <BioSection
            profileData={profileData}
            setProfileData={setProfileData}
            isEditing={isEditing}
          />

          <InterestsSection
            profileData={profileData}
            setProfileData={setProfileData}
            isEditing={isEditing}
          />

          <AlbumSection
            profileData={profileData}
            setProfileData={setProfileData}
            isEditing={isEditing}
            isUploading={isUploading}
            albumInputRef={albumInputRef}
            onAlbumUpload={handleAlbumUpload}
          />

          {isEditing && (
            <PreferencesSection
              profileData={profileData}
              setProfileData={setProfileData}
            />
          )}

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
