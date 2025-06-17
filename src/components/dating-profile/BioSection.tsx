
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface BioSectionProps {
  profileData: any;
  setProfileData: (data: any) => void;
  isEditing: boolean;
}

const BioSection = ({ profileData, setProfileData, isEditing }: BioSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Giới thiệu bản thân</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={profileData.bio}
            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            placeholder="Hãy viết vài dòng để người khác hiểu về bạn..."
            className="min-h-[100px]"
          />
        ) : (
          <p className="text-gray-600">{profileData.bio}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default BioSection;
