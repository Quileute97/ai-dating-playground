
import React, { useState } from 'react';
import { X, Users, Calendar, Sparkles, Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import PremiumUpgradeModal from './PremiumUpgradeModal';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  userId?: string;
  userEmail?: string;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply, userId, userEmail }) => {
  const [gender, setGender] = useState('all');
  const [ageGroup, setAgeGroup] = useState('all');
  const [aiPrompt, setAiPrompt] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const { premiumStatus, refetch } = usePremiumStatus(userId);
  const isPremium = premiumStatus.isPremium;

  const handleApply = () => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    
    onApply({
      gender,
      ageGroup,
      aiPrompt
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-purple-200">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Tùy chỉnh tìm kiếm</h2>
                {isPremium && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Premium Lock Overlay */}
            {!isPremium && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Tính năng Premium</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Nâng cấp Premium để sử dụng bộ lọc tìm kiếm nâng cao
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white mb-2 w-full"
                    onClick={() => {
                      setShowPremiumModal(true);
                      onClose();
                    }}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Nâng cấp Premium
                  </Button>
                  <Button variant="ghost" onClick={onClose} className="w-full">
                    Đóng
                  </Button>
                </div>
              </div>
            )}

          {/* Gender Filter */}
          <div className="space-y-2 mb-6">
            <Label className="text-sm font-medium text-gray-700">Giới tính</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="border-purple-200 focus:border-purple-400">
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="male">Nam</SelectItem>
                <SelectItem value="female">Nữ</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Age Group Filter */}
          <div className="space-y-2 mb-6">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Độ tuổi
            </Label>
            <Select value={ageGroup} onValueChange={setAgeGroup}>
              <SelectTrigger className="border-purple-200 focus:border-purple-400">
                <SelectValue placeholder="Chọn nhóm tuổi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="teen">Teen (13-17)</SelectItem>
                <SelectItem value="gen-z">Gen Z (18-25)</SelectItem>
                <SelectItem value="millennial">9x (26-35)</SelectItem>
                <SelectItem value="older">Trên 35</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* AI Prompt */}
          <div className="space-y-2 mb-6">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Prompt AI (tùy chọn)
            </Label>
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ví dụ: Trò chuyện như người yêu hay ghen, phong cách lạnh lùng chất..."
              className="border-purple-200 focus:border-purple-400 resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Hướng dẫn AI trò chuyện theo phong cách bạn muốn khi không tìm được người thật
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-purple-200 hover:bg-purple-50"
            >
              Hủy
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={!isPremium}
            >
              {isPremium ? (
                'Áp dụng'
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Premium
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>

    {/* Premium Upgrade Modal */}
    <PremiumUpgradeModal
      isOpen={showPremiumModal}
      onClose={() => setShowPremiumModal(false)}
      onSuccess={() => {
        setShowPremiumModal(false);
        refetch();
      }}
      userId={userId}
      userEmail={userEmail}
    />
  </>
  );
};

export default FilterModal;
