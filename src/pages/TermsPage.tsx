import React from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const TermsPage: React.FC = () => (
  <>
    <SEOHead
      title="Điều khoản sử dụng - Hyliya"
      description="Điều khoản và điều kiện sử dụng ứng dụng hẹn hò Hyliya. Quy tắc cộng đồng, quyền và nghĩa vụ của người dùng khi tham gia Hyliya."
      keywords="điều khoản sử dụng Hyliya, terms of service, quy định người dùng"
      url="https://hyliya.com/dieu-khoan"
      breadcrumbs={[
        { name: "Trang chủ", url: "https://hyliya.com/" },
        { name: "Điều khoản sử dụng", url: "https://hyliya.com/dieu-khoan" }
      ]}
    />
    <main className="max-w-3xl mx-auto px-5 py-10 prose prose-slate">
      <nav className="text-sm text-slate-500 mb-4">
        <Link to="/" className="hover:underline">Trang chủ</Link> / Điều khoản sử dụng
      </nav>
      <h1 className="text-3xl font-bold mb-4">Điều khoản sử dụng</h1>
      <h2 className="text-2xl font-semibold mt-6 mb-2">1. Độ tuổi</h2>
      <p>Người dùng Hyliya phải đủ 18 tuổi trở lên. Chúng tôi có quyền khoá tài khoản
      không tuân thủ.</p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">2. Hành vi cấm</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Quấy rối, đe doạ, phát tán nội dung khiêu dâm trẻ em.</li>
        <li>Lừa đảo, mạo danh, giả mạo hồ sơ.</li>
        <li>Spam, quảng cáo trái phép, thu thập dữ liệu người dùng khác.</li>
      </ul>
      <h2 className="text-2xl font-semibold mt-6 mb-2">3. Thanh toán</h2>
      <p>Các giao dịch sao và gói Premium xử lý qua PayOS. Yêu cầu hoàn tiền được xem xét
      trong 7 ngày kể từ giao dịch.</p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">4. Chấm dứt</h2>
      <p>Hyliya có quyền tạm ngưng hoặc chấm dứt tài khoản vi phạm mà không cần báo trước.</p>
      <p className="mt-8">
        <Link to="/" className="text-purple-600 hover:underline">← Quay về trang chủ</Link>
      </p>
    </main>
  </>
);

export default TermsPage;
