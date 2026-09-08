import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEOHead from "@/components/SEOHead";

const faqs = [
  {
    q: "Hyliya có miễn phí không?",
    a: "Hyliya miễn phí các tính năng cơ bản: tạo hồ sơ, ghép đôi, chat. Gói Premium mở khoá các đặc quyền như xem ai đã thích bạn, lượt like không giới hạn.",
  },
  {
    q: "Ứng dụng có an toàn cho người Việt Nam không?",
    a: "Có. Hyliya có đội ngũ kiểm duyệt tiếng Việt, hệ thống báo cáo/khoá tài khoản, và mã hoá dữ liệu theo chuẩn HTTPS + Row Level Security.",
  },
  {
    q: "AI của Hyliya hoạt động ra sao?",
    a: "AI phân tích hồ sơ, sở thích, độ tuổi, vị trí và hành vi tương tác để đề xuất người có mức tương thích cao nhất, giúp giảm thời gian tìm kiếm.",
  },
  {
    q: "Tôi có thể xoá tài khoản không?",
    a: "Có. Vào Cài đặt → Tài khoản → Xoá vĩnh viễn. Toàn bộ dữ liệu cá nhân sẽ bị xoá khỏi hệ thống trong 30 ngày.",
  },
  {
    q: "Chat ngẫu nhiên có ẩn danh không?",
    a: "Chat với người lạ hiển thị nickname bạn chọn, không lộ số điện thoại hay email. Bạn có thể ngắt kết nối bất cứ lúc nào.",
  },
];

const FAQPage: React.FC = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <>
      <SEOHead
        title="Câu hỏi thường gặp - Hyliya FAQ"
        description="Giải đáp các câu hỏi thường gặp về ứng dụng hẹn hò Hyliya: bảo mật, AI ghép đôi, chat ngẫu nhiên, gói Premium và cách xoá tài khoản."
        keywords="FAQ Hyliya, câu hỏi thường gặp, hỗ trợ Hyliya"
        url="https://hyliya.com/faq"
        breadcrumbs={[
          { name: "Trang chủ", url: "https://hyliya.com/" },
          { name: "FAQ", url: "https://hyliya.com/faq" }
        ]}
        jsonLd={jsonLd}
      />
      <main className="max-w-3xl mx-auto px-5 py-10">
        <nav className="text-sm text-slate-500 mb-4">
          <Link to="/" className="hover:underline">Trang chủ</Link> / FAQ
        </nav>
        <h1 className="text-3xl font-bold mb-6">Câu hỏi thường gặp</h1>
        <div className="space-y-6">
          {faqs.map((f, i) => (
            <article key={i} className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-2">{f.q}</h2>
              <p className="text-slate-700">{f.a}</p>
            </article>
          ))}
        </div>
        <p className="mt-8">
          <Link to="/" className="text-purple-600 hover:underline">← Quay về trang chủ</Link>
        </p>
      </main>
    </>
  );
};

export default FAQPage;
