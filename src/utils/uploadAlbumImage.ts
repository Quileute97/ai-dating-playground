
import { supabase } from "@/integrations/supabase/client";

/**
 * Upload image to supabase storage "albums" bucket
 * @param file Ảnh album
 * @returns publicUrl của ảnh
 */
export async function uploadAlbumImage(file: File): Promise<string> {
  if (!file) throw new Error("Không có file ảnh album");
  const ext = file.name.split('.').pop() || "jpg";
  const filename = `${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;
  const { data, error } = await supabase.storage
    .from("albums")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (error) throw new Error("Tải lên ảnh thất bại");

  const { data: publicUrlData } = supabase
    .storage
    .from("albums")
    .getPublicUrl(data.path);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error("Không lấy được URL công khai ảnh album");
  }
  return publicUrlData.publicUrl;
}
