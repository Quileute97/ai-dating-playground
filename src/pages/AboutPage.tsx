import React from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const AboutPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Giới thiệu về Hyliya - Ứng dụng hẹn hò AI Việt Nam"
        description="Hyliya là ứng dụng hẹn hò và kết nối thông minh tích hợp AI dành cho người Việt: chat realtime, tìm bạn quanh đây, ghép đôi phù hợp và timeline chia sẻ cảm xúc."
        keywords="giới thiệu Hyliya, app hẹn hò AI Việt Nam, ứng dụng kết nối thông minh, hẹn hò online, chat AI"
        url="https://hyliya.com/gioi-thieu"
        breadcrumbs={[
          { name: "Trang chủ", url: "https://hyliya.com/" },
          { name: "Giới thiệu", url: "https://hyliya.com/gioi-thieu" }
        ]}
      />
      <main className="max-w-3xl mx-auto px-5 py-10 prose prose-slate">
        <nav className="text-sm text-slate-500 mb-4">
          <Link to="/" className="hover:underline">Trang chủ</Link> / Giới thiệu
        </nav>
        <h1 className="text-3xl font-bold mb-4">Giới thiệu về Hyliya</h1>
        <p>
          <strong>Hyliya</strong> là nền tảng hẹn hò và kết nối xã hội thế hệ mới cho người
          Việt Nam, được thiết kế xoay quanh ba trụ cột: <em>ghép đôi thông minh bằng AI</em>,
          <em>chat realtime an toàn</em> và <em>khám phá người quanh đây</em>. Chúng tôi tin
          rằng công nghệ có thể giúp mọi người tìm thấy những kết nối thật sự ý nghĩa —
          không chỉ những lượt quẹt vô nghĩa.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-3">Sứ mệnh</h2>
        <p>
          Xây dựng một cộng đồng hẹn hò lành mạnh, tôn trọng và ưu tiên trải nghiệm người
          dùng Việt Nam. Hyliya kết hợp AI để hiểu sở thích, tính cách và mục tiêu tình cảm
          của bạn nhằm đưa ra gợi ý phù hợp thay vì hiển thị ngẫu nhiên.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-3">Tính năng nổi bật</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Hẹn hò AI:</strong> Ghép đôi dựa trên hồ sơ, sở thích và mức độ tương thích.</li>
          <li><strong>Chat với người lạ:</strong> Trò chuyện ẩn danh an toàn, có hệ thống báo cáo.</li>
          <li><strong>Quanh đây:</strong> Tìm bạn cùng khu vực theo bán kính bạn chọn.</li>
          <li><strong>Timeline:</strong> Chia sẻ khoảnh khắc, hình ảnh và cảm xúc hằng ngày.</li>
          <li><strong>Sao donate:</strong> Ủng hộ người bạn quý mến bằng ngôi sao ảo.</li>
        </ul>
        <h2 className="text-2xl font-semibold mt-8 mb-3">Vì sao chọn Hyliya?</h2>
        <p>
          Khác với các ứng dụng hẹn hò quốc tế, Hyliya được bản địa hoá hoàn toàn cho thị
          trường Việt Nam: hỗ trợ tiếng Việt tự nhiên, tích hợp thanh toán nội địa (PayOS),
          đội ngũ kiểm duyệt hiểu văn hoá địa phương và cộng đồng người dùng thật.
        </p>
        <p className="mt-8">
          <Link to="/" className="text-purple-600 hover:underline">← Quay về trang chủ</Link>
        </p>
      </main>
    </>
  );
};

export default AboutPage;
