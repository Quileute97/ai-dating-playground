
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ImagePlus, Loader2, X, Album } from 'lucide-react';

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
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  
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
            />
          </div>
        )}
        {profileData.album && profileData.album.length > 0 ? (
          <>
            {/* Horizontal scrollable preview */}
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-transparent">
                {profileData.album.map((img: string, idx: number) => (
                  <div key={idx} className="relative group flex-shrink-0">
                    <img
                      src={img}
                      alt={`Ảnh ${idx + 1}`}
                      className="rounded-lg object-cover w-24 h-24 border cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105"
                      onClick={() => !isEditing && setShowAlbumModal(true)}
                    />
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeAlbumImage(idx)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                    {!isEditing && (
                      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Scroll hint gradient */}
              {profileData.album.length > 3 && (
                <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
              )}
            </div>
            {!isEditing && (
              <Button
                onClick={() => setShowAlbumModal(true)}
                variant="outline"
                size="sm"
                className="w-full mt-2"
              >
                <Album className="w-4 h-4 mr-2" />
                Xem tất cả ({profileData.album.length} ảnh)
              </Button>
            )}
          </>
        ) : (
          <p className="text-muted-foreground text-sm">Chưa có ảnh nào</p>
        )}
      </CardContent>

      {/* Album Modal - Full screen on mobile, optimized for all devices */}
      <Dialog open={showAlbumModal} onOpenChange={setShowAlbumModal}>
        <DialogContent className="w-full h-full max-w-full max-h-full md:max-w-[90vw] md:max-h-[90vh] md:h-auto overflow-hidden p-0 bg-black/95 border-0 md:rounded-2xl gap-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAlbumModal(false)}
            className="absolute top-2 right-2 md:top-4 md:right-4 z-50 h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 shadow-lg"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          
          <div className="h-full flex flex-col p-4 md:p-6 lg:p-8">
            <h2 className="text-lg md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 pt-8 md:pt-0">
              <Album className="w-5 h-5 md:w-6 md:h-6 text-pink-400" />
              Album ảnh
            </h2>
            
            <div className="flex-1 overflow-y-auto -mx-2 px-2 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-4">
                {profileData.album?.map((img: string, idx: number) => (
                  <div 
                    key={idx} 
                    className="relative group cursor-pointer overflow-hidden rounded-lg md:rounded-xl"
                  >
                    <div className="aspect-square w-full">
                      <img
                        src={img}
                        alt={`Ảnh ${idx + 1}`}
                        className="w-full h-full object-cover transform transition-all duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 md:pb-4">
                      <span className="text-white font-semibold text-sm md:text-base">
                        {idx + 1} / {profileData.album.length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AlbumSection;
