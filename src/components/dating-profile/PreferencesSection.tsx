
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Settings } from 'lucide-react';

interface PreferencesSectionProps {
  profileData: any;
  setProfileData: (data: any) => void;
}

const PreferencesSection = ({ profileData, setProfileData }: PreferencesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Tùy chọn tìm kiếm
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Độ tuổi mong muốn: {profileData.dating_preferences.age_range.min} - {profileData.dating_preferences.age_range.max}</Label>
          <div className="px-2">
            <Slider
              value={[profileData.dating_preferences.age_range.min, profileData.dating_preferences.age_range.max]}
              onValueChange={([min, max]) => 
                setProfileData({
                  ...profileData,
                  dating_preferences: {
                    ...profileData.dating_preferences,
                    age_range: { min, max }
                  }
                })
              }
              min={18}
              max={60}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Khoảng cách tối đa: {profileData.dating_preferences.distance} km</Label>
          <div className="px-2">
            <Slider
              value={[profileData.dating_preferences.distance]}
              onValueChange={([distance]) => 
                setProfileData({
                  ...profileData,
                  dating_preferences: {
                    ...profileData.dating_preferences,
                    distance
                  }
                })
              }
              min={5}
              max={200}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Giới tính quan tâm</Label>
          <Select 
            value={profileData.dating_preferences.gender_preference} 
            onValueChange={(value) => 
              setProfileData({
                ...profileData,
                dating_preferences: {
                  ...profileData.dating_preferences,
                  gender_preference: value
                }
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="male">Nam</SelectItem>
              <SelectItem value="female">Nữ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferencesSection;
