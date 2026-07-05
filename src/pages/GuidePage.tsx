import React from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const GuidePage: React.FC = () => (
  <>
    <SEOHead
      title="Hướng dẫn sử dụng Hyliya - Cách hẹn hò online an toàn"
      description="Hướng dẫn từng bước sử dụng Hyliya: tạo hồ sơ hấp dẫn, chat với người lạ an toàn, tìm bạn quanh đây và sử dụng tính năng ghép đôi AI hiệu quả."
      keywords="hướng dẫn Hyliya, cách dùng app hẹn hò, mẹo hẹn hò online, tips ghép đôi AI"
      url="https://hyliya.com/huong-dan"
    />
    <main className="max-w-3xl mx-auto px-5 py-10 prose prose-slate">
      <nav className="text-sm text-slate-500 mb-4">
        <Link to="/" className="hover:underline">Trang chủ</Link> / Hướng dẫn
      </nav>
      <h1 className="text-3xl font-bold mb-4">Hướng dẫn sử dụng Hyliya</h1>
      <h2 className="text-2xl font-semibold mt-6 mb-2">Bước 1: Tạo hồ sơ hấp dẫn</h2>
      <p>Đăng tải ảnh rõ mặt, viết tiểu sử ngắn 2-3 câu về sở thích và mục tiêu tình cảm.
      Hồ sơ càng đầy đủ, AI càng ghép đôi chính xác.</p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">Bước 2: Khám phá & ghép đôi</h2>
      <p>Vào tab <Link to="/dating" className="text-purple-600 hover:underline">Hẹn hò</Link> để
      xem các gợi ý AI. Quẹt phải nếu thích, quẹt trái để bỏ qua. Khi hai người cùng thích
      nhau, hệ thống tự tạo cuộc trò chuyện.</p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">Bước 3: Chat & gặp gỡ</h2>
      <p>Sử dụng tab <Link to="/messages" className="text-purple-600 hover:underline">Tin nhắn</Link>
      để trao đổi. Với người lạ hoàn toàn, thử tab <Link to="/chat" className="text-purple-600 hover:underline">Chat ngẫu nhiên</Link>.</p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">Bước 4: Tìm bạn quanh đây</h2>
      <p>Bật vị trí và mở tab <Link to="/nearby" className="text-purple-600 hover:underline">Quanh đây</Link>
      để xem người dùng gần bạn theo bán kính tuỳ chọn.</p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">Mẹo hẹn hò an toàn</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Không chia sẻ thông tin tài chính hoặc mật khẩu.</li>
        <li>Gặp mặt lần đầu ở nơi công cộng.</li>
        <li>Báo cáo tài khoản đáng ngờ ngay qua nút Report.</li>
      </ul>
      <p className="mt-8">
        <Link to="/" className="text-purple-600 hover:underline">← Quay về trang chủ</Link>
      </p>
    </main>
  </>
);

export default GuidePage;
