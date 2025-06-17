
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, MapPin, Briefcase, GraduationCap, Ruler } from 'lucide-react';

interface BasicInfoSectionProps {
  profileData: any;
  setProfileData: (data: any) => void;
  isEditing: boolean;
  isUploading: boolean;
  avatarInputRef: React.RefObject<HTMLInputElement>;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BasicInfoSection = ({ 
  profileData, 
  setProfileData, 
  isEditing, 
  isUploading,
  avatarInputRef,
  onAvatarUpload
}: BasicInfoSectionProps) => {
  return (
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
            {isEditing && (
              <>
                <Button
                  size="sm"
                  className="absolute -bottom-1 -right-1 rounded-full w-6 h-6 p-0 bg-pink-500 hover:bg-pink-600"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Camera className="w-3 h-3" />
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  ref={avatarInputRef}
                  className="hidden"
                  onChange={onAvatarUpload}
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
  );
};

export default BasicInfoSection;
