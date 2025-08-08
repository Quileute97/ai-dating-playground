
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Heart, Loader2, CheckCircle } from "lucide-react";
import { DATING_PACKAGES, DatingPackage } from "@/services/datingPackageService";
import { useToast } from "@/hooks/use-toast";
import { createDatingPackagePayment } from "@/services/datingPackageService";

interface DatingPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPackage?: (packageId: string) => void;
  currentUser?: any;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    qrUrl: string;
  };
}

const DatingPackageModal: React.FC<DatingPackageModalProps> = ({
  isOpen,
  onClose,
  onSelectPackage,
  currentUser,
  bankInfo
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getPackageIcon = (packageId: string) => {
    switch (packageId) {
      case 'dating_week':
        return <Star className="w-6 h-6" />;
      case 'dating_month':
        return <Crown className="w-6 h-6" />;
      case 'dating_unlimited':
        return <Heart className="w-6 h-6 text-pink-500" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getPackageColor = (packageId: string) => {
    switch (packageId) {
      case 'dating_week':
        return 'from-pink-500 to-red-500';
      case 'dating_month':
        return 'from-purple-500 to-pink-500';
      case 'dating_unlimited':
        return 'from-pink-500 to-rose-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const handleSelectPackage = async (packageData: DatingPackage) => {
    console.log('🔥 DEBUG: DatingPackageModal - handleSelectPackage called', packageData);
    console.log('🔥 DEBUG: Current user:', currentUser);
    
    if (!currentUser?.id) {
      console.log('🔥 DEBUG: No currentUser.id, showing login toast');
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để mua gói Premium",
        variant: "destructive"
      });
      return;
    }

    setSelectedPackage(packageData.id);
    setIsProcessing(true);

    try {
      const packageType = packageData.id === 'dating_unlimited' ? 'dating_lifetime' : packageData.id;
      console.log('🔥 DEBUG: Calling createDatingPackagePayment with:', {
        packageId: packageType,
        userId: currentUser.id,
        userEmail: currentUser.email || ''
      });
      
      const result = await createDatingPackagePayment(
        packageType,
        currentUser.id,
        currentUser.email || ''
      );

      console.log('🔥 DEBUG: createPayOSPayment result:', result);

      if (result.error === 0 && result.data?.checkoutUrl) {
        console.log('🔥 DEBUG: Opening checkout URL:', result.data.checkoutUrl);
        window.open(result.data.checkoutUrl, '_blank');
        toast({
          title: "Chuyển hướng thanh toán",
          description: "Vui lòng hoàn tất thanh toán để kích hoạt gói Premium",
        });
        
        onClose();
        
        if (onSelectPackage) {
          onSelectPackage(packageData.id);
        }
      } else {
        console.log('🔥 DEBUG: Payment creation failed:', result);
        throw new Error(result.message || 'Không thể tạo liên kết thanh toán');
      }
    } catch (error) {
      console.error('🔥 DEBUG: Payment error in DatingPackageModal:', error);
      toast({
        title: "Lỗi tạo thanh toán",
        description: "Không thể tạo liên kết thanh toán. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      console.log('🔥 DEBUG: Cleanup - setting processing to false');
      setIsProcessing(false);
      setSelectedPackage(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            Chọn Gói Premium Hẹn Hò
          </DialogTitle>
          <p className="text-gray-600 text-center">
            Không giới hạn lượt match và khám phá thêm nhiều tính năng premium
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {DATING_PACKAGES.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative overflow-hidden border-2 hover:shadow-lg transition-all duration-300 ${
                pkg.id === 'dating_unlimited' ? 'border-pink-400' : 'border-gray-200'
              }`}
            >
              {pkg.id === 'dating_unlimited' && (
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                  PHỔ BIẾN
                </Badge>
              )}
              
              <CardHeader className={`text-white bg-gradient-to-r ${getPackageColor(pkg.id)} p-6`}>
                <div className="flex items-center justify-center mb-3">
                  {getPackageIcon(pkg.id)}
                </div>
                <CardTitle className="text-xl font-bold text-center">
                  {pkg.name}
                </CardTitle>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {formatPrice(pkg.price)}
                  </div>
                  <div className="text-sm opacity-90">
                    {pkg.duration === -1 ? 'Vĩnh viễn' : `${pkg.duration} ngày`}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <p className="text-gray-600 text-sm mb-4">
                  {pkg.description}
                </p>

                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full bg-gradient-to-r ${getPackageColor(pkg.id)} hover:opacity-90 text-white`}
                  onClick={() => handleSelectPackage(pkg)}
                  disabled={isProcessing && selectedPackage === pkg.id}
                >
                  {isProcessing && selectedPackage === pkg.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Chọn gói này'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center text-sm text-gray-500 mt-4">
          Thanh toán an toàn qua PayOS • Hỗ trợ 24/7
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DatingPackageModal;
