import React, { useState } from 'react';
import { Heart, X, Zap, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  images: string[];
  distance: number;
  interests: string[];
}

interface SwipeInterfaceProps {
  user?: any;
}

const mockProfiles: UserProfile[] = [
  {
    id: '1',
    name: 'Minh Anh',
    age: 23,
    bio: 'Yêu thích du lịch, cafe và những cuộc phiêu lưu mới 🌟',
    images: ['/placeholder.svg'],
    distance: 2,
    interests: ['Du lịch', 'Cafe', 'Nhiếp ảnh']
  },
  {
    id: '2', 
    name: 'Hoàng Nam',
    age: 25,
    bio: 'Developer, gym rat, và fan của pizza 🍕',
    images: ['/placeholder.svg'],
    distance: 5,
    interests: ['Công nghệ', 'Gym', 'Ẩm thực']
  },
  {
    id: '3',
    name: 'Thu Hà',
    age: 22,
    bio: 'Sinh viên nghệ thuật, mê cats và indie music 🎨',
    images: ['/placeholder.svg'],
    distance: 1,
    interests: ['Nghệ thuật', 'Âm nhạc', 'Mèo']
  }
];

const SwipeInterface = ({ user }: SwipeInterfaceProps) => {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [matches, setMatches] = useState(0);
  const [showMatch, setShowMatch] = useState(false);

  const currentProfile = mockProfiles[currentProfileIndex];

  const handleSwipe = (direction: 'left' | 'right' | 'super') => {
    setSwipeDirection(direction === 'super' ? 'right' : direction);
    
    if (direction === 'right' || direction === 'super') {
      // Simulate match (30% chance)
      if (Math.random() > 0.7) {
        setMatches(prev => prev + 1);
        setShowMatch(true);
        setTimeout(() => setShowMatch(false), 3000);
      }
    }

    setTimeout(() => {
      setCurrentProfileIndex(prev => 
        prev + 1 >= mockProfiles.length ? 0 : prev + 1
      );
      setSwipeDirection(null);
    }, 300);
  };

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-pink-50 to-purple-50">
        <Card className="p-8 text-center bg-white/70 backdrop-blur-sm">
          <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Hết người rồi!</h2>
          <p className="text-gray-600">Hãy quay lại sau để gặp thêm nhiều người mới</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-pink-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Match Notification */}
      {showMatch && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-500/90 to-purple-500/90 backdrop-blur-sm">
          <div className="text-center text-white animate-pulse">
            <Heart className="w-20 h-20 mx-auto mb-4 text-red-300" />
            <h2 className="text-3xl font-bold mb-2">It's a Match! 💖</h2>
            <p className="text-lg">Bạn và {currentProfile.name} đã thích nhau!</p>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="max-w-sm mx-auto h-full flex flex-col">
        <Card 
          className={`flex-1 relative overflow-hidden transition-all duration-300 ${
            swipeDirection === 'left' ? 'transform -translate-x-full rotate-12 opacity-0' :
            swipeDirection === 'right' ? 'transform translate-x-full -rotate-12 opacity-0' :
            'transform translate-x-0 rotate-0 opacity-100'
          }`}
        >
          {/* Profile Image */}
          <div className="relative h-2/3">
            <img 
              src={currentProfile.images[0]} 
              alt={currentProfile.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Distance Badge */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
              {currentProfile.distance}km
            </div>

            {/* Profile Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h2 className="text-2xl font-bold">
                {currentProfile.name}, {currentProfile.age}
              </h2>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-4 h-1/3 overflow-y-auto">
            <p className="text-gray-700 mb-3">{currentProfile.bio}</p>
            
            <div className="flex flex-wrap gap-2">
              {currentProfile.interests.map((interest, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-gray-700 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6 pb-4">
          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300"
            onClick={() => handleSwipe('left')}
          >
            <X className="w-6 h-6 text-red-500" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full border-blue-200 hover:bg-blue-50 hover:border-blue-300"
            onClick={() => handleSwipe('super')}
          >
            <Zap className="w-6 h-6 text-blue-500" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full border-green-200 hover:bg-green-50 hover:border-green-300"
            onClick={() => handleSwipe('right')}
          >
            <Heart className="w-6 h-6 text-green-500" />
          </Button>
        </div>

        {/* Stats */}
        <div className="text-center text-sm text-gray-600">
          {matches} matches • {mockProfiles.length - currentProfileIndex - 1} còn lại
        </div>
      </div>
    </div>
  );
};

export default SwipeInterface;
