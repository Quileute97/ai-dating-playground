
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface InterestsSectionProps {
  profileData: any;
  setProfileData: (data: any) => void;
  isEditing: boolean;
}

const InterestsSection = ({ profileData, setProfileData, isEditing }: InterestsSectionProps) => {
  const addInterest = (interest: string) => {
    if (interest && !profileData.interests.includes(interest)) {
      setProfileData({
        ...profileData,
        interests: [...profileData.interests, interest]
      });
    }
  };

  const removeInterest = (interest: string) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter((i: string) => i !== interest)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sở thích</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing && (
          <div className="flex gap-2">
            <Input
              placeholder="Thêm sở thích..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addInterest((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {profileData.interests.map((interest: string, idx: number) => (
            <Badge key={idx} variant="secondary" className="flex items-center gap-1">
              {interest}
              {isEditing && (
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => removeInterest(interest)}
                />
              )}
            </Badge>
          ))}
          {profileData.interests.length === 0 && (
            <p className="text-gray-400 text-sm">Chưa có sở thích nào</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InterestsSection;
