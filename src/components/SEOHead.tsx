
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
  title = "Hyliya - Hẹn hò AI & kết nối thông minh cho người Việt",
  description = "Hyliya là ứng dụng hẹn hò AI cho người Việt với ghép đôi thông minh, chat an toàn, tìm bạn quanh đây và timeline chia sẻ khoảnh khắc.",
  keywords = "hẹn hò AI, app hẹn hò Việt Nam, ghép đôi thông minh, chat với người lạ, tìm bạn quanh đây, Hyliya",
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
