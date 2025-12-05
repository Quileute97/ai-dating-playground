
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type?: 'WebApplication' | 'Organization' | 'Person' | 'Article';
  data?: Record<string, any>;
}

const StructuredData: React.FC<StructuredDataProps> = ({ 
  type = 'WebApplication',
  data = {}
}) => {
  const getDefaultData = () => {
    switch (type) {
      case 'WebApplication':
        return {
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
          "author": {
            "@type": "Organization",
            "name": "Hyliya Team"
          },
          "featureList": [
            "Chat với người lạ",
            "Hẹn hò thông minh", 
            "Tìm kiếm quanh đây",
            "Timeline chia sẻ",
            "AI hỗ trợ kết nối"
          ]
        };
      case 'Organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Hyliya",
          "description": "Nền tảng hẹn hò và kết nối thông minh",
          "url": "https://hyliya.com/",
          "logo": "https://hyliya.com/logo.png",
          "sameAs": []
        };
      default:
        return {};
    }
  };

  const structuredData = { ...getDefaultData(), ...data };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
