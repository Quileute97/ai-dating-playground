
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2, X } from 'lucide-react';

interface AlbumSectionProps {
  profileData: any;
  setProfileData: (data: any) => void;
  isEditing: boolean;
  isUploading: boolean;
  albumInputRef: React.RefObject<HTMLInputElement>;
  onAlbumUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AlbumSection = ({ 
  profileData, 
  setProfileData, 
  isEditing, 
  isUploading,
  albumInputRef,
  onAlbumUpload
}: AlbumSectionProps) => {
  const removeAlbumImage = (index: number) => {
    const newAlbum = profileData.album.filter((_: any, idx: number) => idx !== index);
    setProfileData({ ...profileData, album: newAlbum });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Album ảnh</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => albumInputRef.current?.click()}
              size="sm"
              className="bg-pink-500 hover:bg-pink-600"
              disabled={isUploading}
              type="button"
            >
              <ImagePlus className="w-4 h-4 mr-1" />
              Thêm ảnh vào album
            </Button>
            {isUploading && <Loader2 className="w-4 h-4 animate-spin text-pink-500" />}
            <input
              type="file"
              accept="image/*"
              ref={albumInputRef}
              className="hidden"
              multiple
              onChange={onAlbumUpload}
              disabled={isUploading}
            />
          </div>
        )}
        {profileData.album && profileData.album.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {profileData.album.map((img: string, idx: number) => (
              <div key={idx} className="relative group">
                <img
                  src={img}
                  alt={`Ảnh ${idx + 1}`}
                  className="rounded-lg object-cover w-full h-24 border"
                />
                {isEditing && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeAlbumImage(idx)}
                    type="button"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Chưa có ảnh nào</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AlbumSection;
