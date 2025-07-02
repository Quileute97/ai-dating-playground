
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Heart, 
  X, 
  Zap, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Ruler,
  Calendar
} from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface DatingProfileViewProps {
  profile: {
    id: string;
    name: string;
    age?: number;
    images: string[];
    bio?: string;
    distance?: number | null;
    interests?: string[];
    height?: number;
    job?: string;
    education?: string;
    location_name?: string;
  };
  onClose: () => void;
  onSwipe: (direction: 'left' | 'right' | 'super') => void;
  isDatingActive?: boolean;
  dailyMatches?: number;
  maxFreeMatches?: number;
}

const DatingProfileView = ({ 
  profile, 
  onClose, 
  onSwipe,
  isDatingActive = false,
  dailyMatches = 0,
  maxFreeMatches = 10
}: DatingProfileViewProps) => {
  const canSwipeRight = isDatingActive || dailyMatches < maxFreeMatches;

  return (
    <div className="h-full bg-gradient-to-br from-pink-50 to-purple-50 p-2">
      <div className="max-w-md mx-auto h-full flex flex-col">
        {/* Header - Made smaller */}
        <div className="flex items-center justify-between mb-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClose}
            className="rounded-full p-1.5 bg-white/90 backdrop-blur-sm h-8 w-8"
          >
            <ArrowLeft className="w-3 h-3" />
          </Button>
          <h1 className="text-lg font-bold text-gray-800">Hồ sơ</h1>
          <div className="w-8" /> {/* Spacer */}
        </div>

        {/* Profile Card - Image takes up more space */}
        <Card className="flex-1 overflow-hidden">
          {/* Image Carousel - Increased height to 70% */}
          <div className="relative h-[70%]">
            {profile.images && profile.images.length > 1 ? (
              <Carousel className="w-full h-full">
                <CarouselContent>
                  {profile.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <img
                        src={image}
                        alt={`${profile.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            ) : (
              <img
                src={profile.images?.[0] || '/placeholder.svg'}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Distance Badge */}
            {profile.distance !== null && profile.distance !== undefined && (
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-xs font-medium">
                {profile.distance}km
              </div>
            )}

            {/* Profile Info Overlay */}
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <h2 className="text-xl font-bold">
                {profile.name}
                {profile.age && <span>, {profile.age}</span>}
              </h2>
            </div>
          </div>

          {/* Profile Details - Reduced height to 30% */}
          <CardContent className="p-3 h-[30%] overflow-y-auto">
            {profile.bio && (
              <div className="mb-3">
                <p className="text-gray-700 text-sm">{profile.bio}</p>
              </div>
            )}

            <div className="space-y-2">
              {profile.height && (
                <div className="flex items-center gap-2">
                  <Ruler className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">Chiều cao:</span>
                  <span className="text-xs font-medium">{profile.height}cm</span>
                </div>
              )}

              {profile.job && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">Nghề nghiệp:</span>
                  <span className="text-xs font-medium">{profile.job}</span>
                </div>
              )}

              {profile.education && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">Học vấn:</span>
                  <span className="text-xs font-medium">{profile.education}</span>
                </div>
              )}

              {profile.location_name && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">Địa điểm:</span>
                  <span className="text-xs font-medium">{profile.location_name}</span>
                </div>
              )}
            </div>

            {profile.interests && profile.interests.length > 0 && (
              <div className="mt-3">
                <span className="text-xs font-semibold text-gray-700 mb-1 block">Sở thích:</span>
                <div className="flex flex-wrap gap-1">
                  {profile.interests.slice(0, 4).map((interest, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0.5">
                      {interest}
                    </Badge>
                  ))}
                  {profile.interests.length > 4 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      +{profile.interests.length - 4}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons - Made smaller */}
        <div className="flex justify-center gap-3 mt-3 pb-3">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300"
            onClick={() => onSwipe('left')}
          >
            <X className="w-5 h-5 text-red-500" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full border-blue-200 hover:bg-blue-50 hover:border-blue-300"
            onClick={() => onSwipe('super')}
            disabled={!canSwipeRight}
          >
            <Zap className="w-5 h-5 text-blue-500" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full border-green-200 hover:bg-green-50 hover:border-green-300"
            onClick={() => onSwipe('right')}
            disabled={!canSwipeRight}
          >
            <Heart className="w-5 h-5 text-green-500" />
          </Button>
        </div>

        {/* Limit Warning - Made smaller */}
        {!canSwipeRight && (
          <div className="text-center text-xs text-red-600 mb-1">
            Đã hết lượt match miễn phí! Nâng cấp Premium để tiếp tục.
          </div>
        )}
      </div>
    </div>
  );
};

export default DatingProfileView;
