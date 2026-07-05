import React from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const PrivacyPage: React.FC = () => (
  <>
    <SEOHead
      title="Chính sách bảo mật - Hyliya"
      description="Chính sách bảo mật của Hyliya: cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu người dùng trên ứng dụng hẹn hò và kết nối Hyliya."
      keywords="chính sách bảo mật Hyliya, privacy policy, bảo vệ dữ liệu, hẹn hò an toàn"
      url="https://hyliya.com/chinh-sach-bao-mat"
    />
    <main className="max-w-3xl mx-auto px-5 py-10 prose prose-slate">
      <nav className="text-sm text-slate-500 mb-4">
        <Link to="/" className="hover:underline">Trang chủ</Link> / Chính sách bảo mật
      </nav>
      <h1 className="text-3xl font-bold mb-4">Chính sách bảo mật</h1>
      <p>Cập nhật lần cuối: 05/07/2026</p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">1. Thông tin thu thập</h2>
      <p>Hyliya thu thập thông tin bạn cung cấp khi đăng ký (tên, tuổi, giới tính, ảnh),
      dữ liệu vị trí (nếu bạn cho phép) để phục vụ tính năng “Quanh đây”, và dữ liệu tương
      tác trong ứng dụng (tin nhắn, lượt thích, bài đăng timeline).</p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">2. Cách sử dụng</h2>
      <p>Dữ liệu được dùng để: gợi ý ghép đôi phù hợp, hiển thị hồ sơ cho người dùng khác
      trong phạm vi bạn cho phép, cải thiện chất lượng AI matching, xử lý thanh toán và
      liên lạc hỗ trợ.</p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">3. Bảo mật</h2>
      <p>Hyliya sử dụng Supabase với Row Level Security, HTTPS toàn hệ thống, và quyền
      truy cập tối thiểu. Mật khẩu được mã hoá bằng bcrypt.</p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">4. Quyền của bạn</h2>
      <p>Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xoá dữ liệu cá nhân bất kỳ lúc nào bằng
      cách liên hệ <a href="mailto:support@hyliya.com">support@hyliya.com</a>.</p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">5. Cookies & Analytics</h2>
      <p>Chúng tôi dùng Google Analytics để đo lường trải nghiệm và cải thiện sản phẩm.</p>
      <p className="mt-8">
        <Link to="/" className="text-purple-600 hover:underline">← Quay về trang chủ</Link>
      </p>
    </main>
  </>
);

export default PrivacyPage;
