
import React from 'react';
import { ArrowLeft, MessageCircle, Heart, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MatchProfileProps {
  profile: any;
  onBack: () => void;
  onChat: () => void;
}

export default function MatchProfile({ profile, onBack, onChat }: MatchProfileProps) {
  return (
    <div className="h-full bg-gradient-to-br from-pink-50 to-purple-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm border-b border-pink-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="hover:bg-pink-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-gray-800">Hồ sơ Match</h1>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Main Photo */}
        <Card className="overflow-hidden mb-4">
          <div className="relative">
            <img
              src={profile.avatar || '/placeholder.svg'}
              alt={profile.name}
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Match Badge */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full font-semibold flex items-center gap-1">
              <Heart className="w-4 h-4" />
              MATCH
            </div>

            {/* Name and Age */}
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-3xl font-bold">
                {profile.name}
                {profile.age && <span>, {profile.age}</span>}
              </h2>
              {profile.location_name && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profile.location_name}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Bio Section */}
        {profile.bio && (
          <Card className="p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Giới thiệu</h3>
            <p className="text-gray-600">{profile.bio}</p>
          </Card>
        )}

        {/* Basic Info */}
        <Card className="p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">Thông tin cơ bản</h3>
          <div className="space-y-2">
            {profile.height && (
              <div className="flex justify-between">
                <span className="text-gray-600">Chiều cao:</span>
                <span className="font-medium">{profile.height}cm</span>
              </div>
            )}
            {profile.job && (
              <div className="flex justify-between">
                <span className="text-gray-600">Nghề nghiệp:</span>
                <span className="font-medium">{profile.job}</span>
              </div>
            )}
            {profile.education && (
              <div className="flex justify-between">
                <span className="text-gray-600">Học vấn:</span>
                <span className="font-medium">{profile.education}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <Card className="p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">Sở thích</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-gray-700 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Album Photos */}
        {profile.album && profile.album.length > 0 && (
          <Card className="p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">Album ảnh</h3>
            <div className="grid grid-cols-3 gap-2">
              {profile.album.map((photo: string, index: number) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Ảnh ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          </Card>
        )}

        {/* Chat Button */}
        <div className="sticky bottom-4 pt-4">
          <Button
            onClick={onChat}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 text-lg font-semibold"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Bắt đầu trò chuyện
          </Button>
        </div>
      </div>
    </div>
  );
}
