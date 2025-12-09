
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ImagePlus, Loader2, X, Album, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
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
                      onClick={() => {
                        if (!isEditing) {
                          setSelectedImageIndex(idx);
                          setShowAlbumModal(true);
                        }
                      }}
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

      {/* Album Modal with Swipe Support */}
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
            
            {/* Swipeable Carousel for Mobile */}
            <div className="flex-1 flex items-center justify-center">
              <Carousel 
                className="w-full max-w-4xl"
                opts={{
                  startIndex: selectedImageIndex,
                  loop: true,
                }}
              >
                <CarouselContent>
                  {profileData.album?.map((img: string, idx: number) => (
                    <CarouselItem key={idx}>
                      <div className="flex items-center justify-center p-2">
                        <div className="relative w-full max-h-[70vh] flex items-center justify-center">
                          <img
                            src={img}
                            alt={`Ảnh ${idx + 1}`}
                            className="max-w-full max-h-[70vh] object-contain rounded-lg"
                          />
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                            {idx + 1} / {profileData.album.length}
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                
                {/* Navigation buttons - hidden on mobile, shown on desktop */}
                <CarouselPrevious className="hidden md:flex left-4 h-12 w-12 bg-white/20 hover:bg-white/30 border-white/30 text-white" />
                <CarouselNext className="hidden md:flex right-4 h-12 w-12 bg-white/20 hover:bg-white/30 border-white/30 text-white" />
              </Carousel>
            </div>
            
            {/* Swipe hint for mobile */}
            <p className="text-center text-white/60 text-sm mt-4 md:hidden">
              ← Vuốt để xem ảnh tiếp theo →
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AlbumSection;
