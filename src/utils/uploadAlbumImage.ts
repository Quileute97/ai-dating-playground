
import { supabase } from "@/integrations/supabase/client";

/**
 * Upload image to supabase storage "albums" bucket
 * @param file Ảnh album
 * @returns publicUrl của ảnh
 */
export async function uploadAlbumImage(file: File): Promise<string> {
  if (!file) throw new Error("Không có file ảnh album");
  
  // Kiểm tra loại file
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Chỉ hỗ trợ file ảnh (JPG, PNG, GIF, WebP)");
  }
  
  // Kiểm tra kích thước file (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error("File ảnh quá lớn. Vui lòng chọn file nhỏ hơn 10MB");
  }
  
  const ext = file.name.split('.').pop() || "jpg";
  const filename = `${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;
  
  console.log('Uploading album image:', filename, 'Size:', file.size, 'Type:', file.type);
  
  const { data, error } = await supabase.storage
    .from("albums")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
    });
    
  if (error) {
    console.error('Upload error:', error);
    throw new Error("Tải lên ảnh thất bại: " + error.message);
  }

  const { data: publicUrlData } = supabase
    .storage
    .from("albums")
    .getPublicUrl(data.path);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error("Không lấy được URL công khai ảnh album");
  }
  
  console.log('Album image uploaded successfully:', publicUrlData.publicUrl);
  return publicUrlData.publicUrl;
}
