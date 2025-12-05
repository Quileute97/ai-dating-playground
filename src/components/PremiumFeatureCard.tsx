import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';

interface PremiumFeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  userId?: string;
  featureKey?: string;
  className?: string;
}

export default function PremiumFeatureCard({
  title,
  description,
  icon,
  children,
  userId,
  featureKey,
  className = ''
}: PremiumFeatureCardProps) {
  const { isPremium, showPremiumRequired } = usePremiumFeatures(userId);

  const handlePremiumAction = () => {
    if (featureKey) {
      showPremiumRequired(title);
    }
  };

  if (!isPremium) {
    return (
      <Card className={`relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-50" />
        <div className="absolute top-2 right-2">
          <Crown className="w-5 h-5 text-amber-500" />
        </div>
        <CardHeader className="relative">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg flex items-center gap-2">
              {title}
              <Lock className="w-4 h-4 text-amber-500" />
            </CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-4">
            <div className="opacity-60 pointer-events-none">
              {children}
            </div>
            <Button 
              onClick={handlePremiumAction}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Nâng cấp Premium để sử dụng
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`relative ${className}`}>
      <div className="absolute top-2 right-2">
        <Crown className="w-5 h-5 text-green-500" />
      </div>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}