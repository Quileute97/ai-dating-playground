
import React, { useState, useEffect } from 'react';
import { MapPin, Heart, MessageCircle, Star, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NearbyUser {
  id: string;
  name: string;
  age: number;
  distance: number;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  interests: string[];
  rating: number;
}

interface NearbyInterfaceProps {
  user?: any;
}

const mockNearbyUsers: NearbyUser[] = [
  {
    id: '1',
    name: 'Lan Anh',
    age: 24,
    distance: 0.8,
    avatar: '/placeholder.svg',
    isOnline: true,
    lastSeen: 'Đang online',
    interests: ['Yoga', 'Cafe'],
    rating: 4.8
  },
  {
    id: '2',
    name: 'Minh Đức',
    age: 26,
    distance: 1.2,
    avatar: '/placeholder.svg',
    isOnline: false,
    lastSeen: '5 phút trước',
    interests: ['Gaming', 'Công nghệ'],
    rating: 4.5
  },
  {
    id: '3',
    name: 'Thu Trang',
    age: 23,
    distance: 2.1,
    avatar: '/placeholder.svg',
    isOnline: true,
    lastSeen: 'Đang online',
    interests: ['Du lịch', 'Nhiếp ảnh'],
    rating: 4.9
  },
  {
    id: '4',
    name: 'Hoàng Việt',
    age: 28,
    distance: 3.5,
    avatar: '/placeholder.svg',
    isOnline: false,
    lastSeen: '1 giờ trước',
    interests: ['Thể thao', 'Âm nhạc'],
    rating: 4.3
  },
  {
    id: '5',
    name: 'Mai Linh',
    age: 22,
    distance: 4.8,
    avatar: '/placeholder.svg',
    isOnline: true,
    lastSeen: 'Đang online',
    interests: ['Sách', 'Phim'],
    rating: 4.7
  }
];

const NearbyInterface = ({ user }: NearbyInterfaceProps) => {
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      setLocationPermission('granted');
      console.log('GPS location granted:', position.coords);
    } catch (error) {
      console.error('GPS permission denied:', error);
      setLocationPermission('denied');
    }
  };

  const handleViewProfile = (user: NearbyUser) => {
    setSelectedUser(user);
  };

  const handleCloseProfile = () => {
    setSelectedUser(null);
  };

  // Show GPS permission request screen
  if (locationPermission === 'pending') {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Navigation className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Đang yêu cầu truy cập GPS</h3>
          <p className="text-gray-600 mb-4">
            Chúng tôi cần truy cập vị trí của bạn để tìm những người xung quanh
          </p>
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
        </Card>
      </div>
    );
  }

  // Show GPS denied screen
  if (locationPermission === 'denied') {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Cần quyền truy cập vị trí</h3>
          <p className="text-gray-600 mb-4">
            Để sử dụng tính năng "Quanh đây", vui lòng cho phép truy cập vị trí trong cài đặt trình duyệt
          </p>
          <Button 
            onClick={requestLocationPermission}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  if (selectedUser) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-md mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCloseProfile}
              className="rounded-full"
            >
              ← Quay lại
            </Button>
            <h1 className="text-lg font-semibold">Hồ sơ cá nhân</h1>
          </div>

          {/* Profile Details */}
          <Card className="flex-1 overflow-hidden">
            <div className="relative h-64">
              <img 
                src={selectedUser.avatar} 
                alt={selectedUser.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Online Status */}
              {selectedUser.isOnline && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  Online
                </div>
              )}

              {/* Name and Age */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-2xl font-bold">
                  {selectedUser.name}, {selectedUser.age}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedUser.distance}km từ bạn</span>
                </div>
              </div>
            </div>

            <div className="p-4">
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="font-medium">{selectedUser.rating}</span>
                <span className="text-gray-500 text-sm">({Math.floor(Math.random() * 50) + 10} đánh giá)</span>
              </div>

              {/* Last Seen */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Hoạt động: {selectedUser.lastSeen}
                </p>
              </div>

              {/* Interests */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Sở thích</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.interests.map((interest, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600">
                  <Heart className="w-4 h-4 mr-2" />
                  Thích
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Nhắn tin
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl font-bold text-gray-800">Quanh đây</h1>
            {userLocation && (
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                GPS
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm">
            {mockNearbyUsers.length} người trong phạm vi 5km
          </p>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {mockNearbyUsers.map((user) => (
            <Card 
              key={user.id} 
              className="p-4 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
              onClick={() => handleViewProfile(user)}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  {user.isOnline && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">
                      {user.name}, {user.age}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600">{user.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{user.distance}km</span>
                    <span>•</span>
                    <span>{user.lastSeen}</span>
                  </div>

                  <div className="flex gap-1">
                    {user.interests.slice(0, 2).map((interest, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                      >
                        {interest}
                      </span>
                    ))}
                    {user.interests.length > 2 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
                        +{user.interests.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-8 h-8 p-0 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Like user:', user.id);
                    }}
                  >
                    <Heart className="w-4 h-4 text-pink-500" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-8 h-8 p-0 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Message user:', user.id);
                    }}
                  >
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Upgrade Banner */}
        <Card className="mt-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="text-center">
            <h3 className="font-semibold mb-1">Mở rộng phạm vi tìm kiếm</h3>
            <p className="text-sm opacity-90 mb-3">
              Nâng cấp để tìm kiếm trong phạm vi 20km
            </p>
            <Button variant="secondary" size="sm" className="text-purple-600">
              Nâng cấp ngay
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NearbyInterface;
