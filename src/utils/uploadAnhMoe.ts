
export async function uploadAnhMoe(file: File): Promise<string> {
  // Upload file lên anh.moe và trả về link public file đó
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://api.anh.moe/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload ảnh thất bại");
  }

  const data = await res.json();
  if (data && data.url) {
    return data.url; // url là link public trên CDN anh.moe
  }
  throw new Error("Upload không trả về link hợp lệ");
}
