
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Edit, Save, X, Loader2, ImagePlus, Album } from 'lucide-react';
import { uploadAvatar } from '@/utils/uploadAvatar';
import { uploadAlbumImage } from '@/utils/uploadAlbumImage';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

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
  const [showAlbumViewer, setShowAlbumViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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
    if (albumInputRef.current) albumInputRef.current.value = "";
  };

  const removeAlbumImage = (index: number) => {
    const newAlbum = profileData.album.filter((_: any, idx: number) => idx !== index);
    setProfileData({ ...profileData, album: newAlbum });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 border-0">
          {/* Cover / Hero Album Section */}
          <div className="relative">
            {profileData.album && profileData.album.length > 0 ? (
              <div className="relative h-48 sm:h-56 overflow-hidden rounded-t-lg">
                {/* Featured image as cover */}
                <img
                  src={profileData.album[0]}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Album thumbnails overlay */}
                {profileData.album.length > 1 && (
                  <div className="absolute bottom-3 left-3 right-3 flex gap-1.5">
                    {profileData.album.slice(0, 5).map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedImageIndex(idx);
                          setShowAlbumViewer(true);
                        }}
                        className="relative flex-1 h-12 rounded-md overflow-hidden border-2 border-white/40 hover:border-white transition-all duration-200 hover:scale-105"
                      >
                        <img src={img} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 4 && profileData.album.length > 5 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">+{profileData.album.length - 5}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* View all button */}
                <button
                  onClick={() => {
                    setSelectedImageIndex(0);
                    setShowAlbumViewer(true);
                  }}
                  className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 transition-colors"
                >
                  <Album className="w-3.5 h-3.5" />
                  {profileData.album.length} ảnh
                </button>
              </div>
            ) : (
              <div className="h-32 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 rounded-t-lg" />
            )}

            {/* Avatar overlapping cover */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="relative">
                <img
                  src={profileData.avatar || user?.avatar || '/placeholder.svg'}
                  alt={user?.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
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
                      className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0 bg-purple-500 hover:bg-purple-600 shadow-lg"
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

            {/* Edit button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-3 left-3 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full shadow-md"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            </Button>
          </div>

          {/* Profile Content */}
          <div className="pt-14 px-5 pb-5 space-y-5">
            {/* Name & Age */}
            <div className="text-center">
              {isEditing ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs text-gray-500">Tên</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="age" className="text-xs text-gray-500">Tuổi</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profileData.age}
                      onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                      className="text-center"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                  {user?.age && <p className="text-sm text-gray-500 mt-0.5">{user.age} tuổi</p>}
                </>
              )}
            </div>

            {/* Bio */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">💭 Giới thiệu</h3>
              {isEditing ? (
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Viết vài dòng về bản thân..."
                  className="min-h-[80px] bg-white"
                />
              ) : (
                <p className="text-gray-600 text-sm leading-relaxed">{profileData.bio}</p>
              )}
            </div>

            {/* Album Edit Section */}
            {isEditing && (
              <div className="bg-pink-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">📸 Quản lý Album</h3>
                  <Button
                    onClick={handleAlbumClick}
                    size="sm"
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-xs shadow-md"
                    disabled={isUploading}
                  >
                    <ImagePlus className="w-3.5 h-3.5 mr-1" />
                    Thêm ảnh
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={albumInputRef}
                    className="hidden"
                    multiple
                    onChange={handleAlbumFileChange}
                  />
                </div>
                {isUploading && (
                  <div className="flex items-center gap-2 text-pink-600 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tải ảnh lên...
                  </div>
                )}
                {profileData.album.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {profileData.album.map((img: string, idx: number) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Ảnh ${idx + 1}`}
                          className="w-full aspect-square rounded-lg object-cover border-2 border-white shadow-sm"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          onClick={() => removeAlbumImage(idx)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Save Button */}
            {isEditing && (
              <Button
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
                disabled={isUploading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isUploading ? "Đang tải lên ảnh..." : "Lưu thay đổi"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Album Viewer Modal */}
      <Dialog open={showAlbumViewer} onOpenChange={setShowAlbumViewer}>
        <DialogContent className="w-full h-full max-w-full max-h-full md:max-w-[90vw] md:max-h-[90vh] md:h-auto overflow-hidden p-0 bg-black/95 border-0 md:rounded-2xl gap-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAlbumViewer(false)}
            className="absolute top-2 right-2 md:top-4 md:right-4 z-50 h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 shadow-lg"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="h-full flex items-center justify-center p-4">
            <Carousel
              className="w-full max-w-4xl"
              opts={{ startIndex: selectedImageIndex, loop: true }}
            >
              <CarouselContent>
                {profileData.album?.map((img: string, idx: number) => (
                  <CarouselItem key={idx}>
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <img
                          src={img}
                          alt={`Ảnh ${idx + 1}`}
                          className="max-w-full max-h-[80vh] object-contain rounded-lg"
                        />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                          {idx + 1} / {profileData.album.length}
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex left-4 h-12 w-12 bg-white/20 hover:bg-white/30 border-white/30 text-white" />
              <CarouselNext className="hidden md:flex right-4 h-12 w-12 bg-white/20 hover:bg-white/30 border-white/30 text-white" />
            </Carousel>
          </div>
          <p className="text-center text-white/50 text-sm pb-4 md:hidden">← Vuốt để xem ảnh →</p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserProfile;
