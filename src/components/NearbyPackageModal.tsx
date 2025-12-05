
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Loader2 } from "lucide-react";
import { NEARBY_PACKAGES, NearbyPackage } from "@/services/nearbyPackageService";
import { useToast } from "@/hooks/use-toast";
import { createPayOSPayment } from "@/services/payosService";

interface NearbyPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPackage?: (packageId: string) => void;
  currentUser?: any;
}

const NearbyPackageModal: React.FC<NearbyPackageModalProps> = ({
  isOpen,
  onClose,
  onSelectPackage,
  currentUser
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
      case 'nearby_week':
        return <Star className="w-6 h-6" />;
      case 'nearby_month':
        return <Crown className="w-6 h-6" />;
      case 'nearby_unlimited':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getPackageColor = (packageId: string) => {
    switch (packageId) {
      case 'nearby_week':
        return 'from-blue-500 to-cyan-500';
      case 'nearby_month':
        return 'from-purple-500 to-pink-500';
      case 'nearby_unlimited':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const handleSelectPackage = async (packageData: NearbyPackage) => {
    if (!currentUser?.id) {
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
      const result = await createPayOSPayment({
        packageType: packageData.id,
        userId: currentUser.id,
        userEmail: currentUser.email || ''
      });

      if (result.error === 0 && result.data?.checkoutUrl) {
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
        throw new Error(result.message || 'Không thể tạo liên kết thanh toán');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Lỗi tạo thanh toán",
        description: "Không thể tạo liên kết thanh toán. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setSelectedPackage(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            Chọn Gói Premium Quanh Đây
          </DialogTitle>
          <p className="text-gray-600 text-center">
            Mở rộng phạm vi tìm kiếm lên 20km và khám phá thêm nhiều người thú vị
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {NEARBY_PACKAGES.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative overflow-hidden border-2 hover:shadow-lg transition-all duration-300 ${
                pkg.id === 'nearby_unlimited' ? 'border-yellow-400' : 'border-gray-200'
              }`}
            >
              {pkg.id === 'nearby_unlimited' && (
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
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

export default NearbyPackageModal;
