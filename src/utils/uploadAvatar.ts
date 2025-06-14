
import { supabase } from "@/integrations/supabase/client";

/**
 * Upload avatar image to supabase storage "avatars" bucket
 * @param file File ảnh đại diện
 * @returns publicUrl của ảnh
 */
export async function uploadAvatar(file: File): Promise<string> {
  if (!file) throw new Error("Không có file ảnh");
  const ext = file.name.split('.').pop() || "jpg";
  const filename = `${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;
  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (error) throw new Error("Tải lên ảnh đại diện thất bại");

  const { data: publicUrlData } = supabase
    .storage
    .from("avatars")
    .getPublicUrl(data.path);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error("Không lấy được URL công khai avatar");
  }
  return publicUrlData.publicUrl;
}
