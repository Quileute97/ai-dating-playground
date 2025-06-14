
import { supabase } from "@/integrations/supabase/client";

/**
 * Upload ảnh hoặc video cho timeline lên Supabase Storage bucket "timeline-media", trả về public url
 * @param file File cần upload (image hoặc video)
 * @returns url truy cập công khai
 */
export async function uploadTimelineMedia(file: File): Promise<string> {
  if (!file) throw new Error("Không có file");
  const ext = file.name.split(".").pop() || "media";
  const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage
    .from("timeline-media")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error("Upload media thất bại");
  }

  // Lấy public url
  const { data: publicUrlData } = supabase
    .storage
    .from("timeline-media")
    .getPublicUrl(data.path);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error("Không lấy được url công khai cho media này");
  }
  return publicUrlData.publicUrl;
}
