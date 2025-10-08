
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Hyliya - Ứng dụng hẹn hò và kết nối thông minh với AI",
  description = "Khám phá tình yêu và kết nối ý nghĩa với Hyliya - ứng dụng hẹn hò hiện đại tích hợp AI thông minh, tính năng chat realtime và tìm kiếm người phù hợp quanh bạn.",
  keywords = "hẹn hò, kết nối, tình yêu, chat, AI, gặp gỡ, bạn bè, hẹn hò online, ứng dụng hẹn hò Việt Nam",
  image = "https://hyliya.com/og-image.jpg",
  url = "https://hyliya.com/",
  type = "website"
}) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEOHead;
