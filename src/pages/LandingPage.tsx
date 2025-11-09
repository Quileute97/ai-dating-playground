import SEOHead from "@/components/SEOHead";
import StructuredData from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, MapPin, Sparkles, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const features = [
    {
      icon: Heart,
      title: "Hẹn Hò Thông Minh",
      description: "Thuật toán AI tiên tiến giúp bạn tìm được người phù hợp nhất dựa trên sở thích và tính cách"
    },
    {
      icon: MessageCircle,
      title: "Chat Realtime",
      description: "Trò chuyện tức thì với những người bạn quan tâm, không giới hạn khoảng cách"
    },
    {
      icon: MapPin,
      title: "Tìm Kiếm Quanh Đây",
      description: "Khám phá những người đang ở gần bạn và kết nối ngay lập tức"
    },
    {
      icon: Sparkles,
      title: "AI Hỗ Trợ",
      description: "Trợ lý AI giúp bạn tạo hồ sơ ấn tượng và gợi ý chủ đề trò chuyện"
    },
    {
      icon: Shield,
      title: "An Toàn Bảo Mật",
      description: "Thông tin cá nhân được bảo vệ tuyệt đối với công nghệ mã hóa hiện đại"
    },
    {
      icon: Zap,
      title: "Timeline Sôi Động",
      description: "Chia sẻ khoảnh khắc và kết nối với cộng đồng đang hoạt động"
    }
  ];

  const faqs = [
    {
      question: "Hyliya là gì?",
      answer: "Hyliya là ứng dụng hẹn hò và kết nối thông minh sử dụng AI để giúp bạn tìm được người phù hợp nhất."
    },
    {
      question: "Hyliya có miễn phí không?",
      answer: "Hyliya cung cấp phiên bản miễn phí với đầy đủ tính năng cơ bản. Các gói Premium mang lại trải nghiệm nâng cao."
    },
    {
      question: "Làm sao để bắt đầu?",
      answer: "Chỉ cần đăng ký tài khoản, tạo hồ sơ của bạn và bắt đầu khám phá những kết nối mới ngay!"
    },
    {
      question: "Thông tin của tôi có an toàn không?",
      answer: "Tuyệt đối! Chúng tôi sử dụng công nghệ mã hóa tiên tiến và tuân thủ nghiêm ngặt các quy định về bảo mật dữ liệu."
    }
  ];

  return (
    <>
      <SEOHead
        title="Hyliya - Ứng dụng hẹn hò và kết nối thông minh với AI | Tìm tình yêu đích thực"
        description="Khám phá tình yêu và kết nối ý nghĩa với Hyliya - ứng dụng hẹn hò hiện đại tích hợp AI thông minh, tính năng chat realtime và tìm kiếm người phù hợp quanh bạn. Đăng ký miễn phí ngay!"
        keywords="hẹn hò, kết nối, tình yêu, chat, AI, gặp gỡ, bạn bè, hẹn hò online, ứng dụng hẹn hò Việt Nam, tìm bạn gái, tìm bạn trai, kết bạn"
      />
      
      <StructuredData
        type="WebApplication"
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Hyliya",
          "description": "Ứng dụng hẹn hò và kết nối thông minh với AI",
          "url": "https://hyliya.com/",
          "applicationCategory": "SocialNetworkingApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "VND"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "2840"
          },
          "author": {
            "@type": "Organization",
            "name": "Hyliya Team"
          }
        }}
      />

      <StructuredData
        type="Organization"
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Hyliya",
          "url": "https://hyliya.com/",
          "logo": "https://hyliya.com/logo.png",
          "description": "Nền tảng hẹn hò và kết nối thông minh",
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "email": "support@hyliya.com"
          }
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        {/* Hero Section */}
        <header className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Tìm Tình Yêu Đích Thực Với Hyliya
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Ứng dụng hẹn hò thông minh với AI giúp bạn kết nối với người phù hợp nhất
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button size="lg" className="text-lg px-8 py-6">
                  Bắt Đầu Ngay - Miễn Phí
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Tìm Hiểu Thêm
              </Button>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <main>
          <section className="container mx-auto px-4 py-16 bg-background/50">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Tính Năng Nổi Bật
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <feature.icon className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Benefits Section */}
          <section className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
              <article>
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
                  Tại Sao Chọn Hyliya?
                </h2>
                <div className="space-y-6">
                  <div className="bg-card p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3">🎯 Kết Nối Chính Xác</h3>
                    <p className="text-muted-foreground">
                      Thuật toán AI của chúng tôi phân tích hàng trăm yếu tố để đề xuất những người thực sự phù hợp với bạn.
                    </p>
                  </div>
                  <div className="bg-card p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3">💬 Trò Chuyện Tự Nhiên</h3>
                    <p className="text-muted-foreground">
                      Giao diện chat thân thiện với AI hỗ trợ gợi ý chủ đề, giúp cuộc trò chuyện của bạn luôn thú vị.
                    </p>
                  </div>
                  <div className="bg-card p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3">🌍 Cộng Đồng Sôi Động</h3>
                    <p className="text-muted-foreground">
                      Hàng ngàn người dùng đang hoạt động, tìm kiếm kết nối ý nghĩa giống như bạn.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </section>

          {/* FAQ Section with Structured Data */}
          <section className="container mx-auto px-4 py-16 bg-background/50">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Câu Hỏi Thường Gặp
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Sẵn Sàng Tìm Tình Yêu Của Bạn?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Tham gia Hyliya ngay hôm nay và bắt đầu hành trình tìm kiếm người đặc biệt
              </p>
              <Link to="/">
                <Button size="lg" className="text-lg px-12 py-6">
                  Đăng Ký Miễn Phí
                </Button>
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-muted-foreground">
              <p>© 2025 Hyliya. Tất cả quyền được bảo lưu.</p>
              <p className="mt-2">Ứng dụng hẹn hò và kết nối thông minh hàng đầu Việt Nam</p>
            </div>
          </div>
        </footer>
      </div>

      {/* FAQ Structured Data */}
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        }}
      />
    </>
  );
};

export default LandingPage;
