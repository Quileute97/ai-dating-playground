
export interface NearbyPackage {
  id: 'nearby_week' | 'nearby_month' | 'nearby_unlimited';
  name: string;
  price: number;
  duration: number; // -1 for unlimited
  description: string;
  features: string[];
}

export const NEARBY_PACKAGES: NearbyPackage[] = [
  {
    id: 'nearby_week',
    name: 'Gói 1 Tuần',
    price: 20000,
    duration: 7,
    description: 'Mở rộng phạm vi tìm kiếm lên 20km trong 7 ngày',
    features: [
      'Tìm kiếm trong phạm vi 20km',
      'Thời hạn 7 ngày',
      'Không giới hạn lượt xem',
    ]
  },
  {
    id: 'nearby_month',
    name: 'Gói 1 Tháng',
    price: 50000,
    duration: 30,
    description: 'Mở rộng phạm vi tìm kiếm lên 20km trong 30 ngày',
    features: [
      'Tìm kiếm trong phạm vi 20km',
      'Thời hạn 30 ngày',
      'Không giới hạn lượt xem',
      'Ưu tiên hiển thị profile',
    ]
  },
  {
    id: 'nearby_unlimited',
    name: 'Gói Vô Hạn',
    price: 500000,
    duration: -1,
    description: 'Mở rộng phạm vi tìm kiếm vĩnh viễn',
    features: [
      'Tìm kiếm trong phạm vi 20km',
      'Thời hạn vô hạn',
      'Không giới hạn lượt xem',
      'Ưu tiên hiển thị profile',
      'Hỗ trợ VIP 24/7',
    ]
  }
];

export const getPackageById = (id: string): NearbyPackage | undefined => {
  return NEARBY_PACKAGES.find(pkg => pkg.id === id);
};
