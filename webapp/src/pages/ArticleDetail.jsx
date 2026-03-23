import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const ArticleDetail = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const articleUrl = searchParams.get('url') || '';
  const articleTitle = searchParams.get('title') || 'Article';
  const [loading, setLoading] = useState(true);
  const [fallbackUrl, setFallbackUrl] = useState(articleUrl);

  useEffect(() => {
    // If no URL provided, try to find the article URL from WordPress
    if (!articleUrl && slug) {
      const fetchUrl = async () => {
        try {
          const response = await fetch(
            `https://consciencesoufie.com/wp-json/wp/v2/posts?slug=${slug}`
          );
          const data = await response.json();
          if (data.length > 0) {
            setFallbackUrl(data[0].link);
          }
        } catch (err) {
          console.error('Error fetching article URL:', err);
        }
      };
      fetchUrl();
    }
  }, [slug, articleUrl]);

  const finalUrl = fallbackUrl || `https://consciencesoufie.com/${slug}/`;

  return (
    <div className="bg-white min-h-full flex flex-col" data-testid="article-detail">
      {/* Header bar - matches mobile article.tsx */}
      <div className="flex items-center justify-between px-2 py-3 border-b border-[rgba(28,103,159,0.08)]">
        <Link
          to="/articles"
          className="w-11 h-11 flex items-center justify-center"
          data-testid="article-back-button"
        >
          <ArrowLeft size={24} className="text-[#1c679f]" />
        </Link>
        <h1
          className="flex-1 text-base font-serif font-bold text-[#1a2a3a] text-center px-2 truncate"
          data-testid="article-header-title"
        >
          {articleTitle}
        </h1>
        <a
          href={finalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 flex items-center justify-center"
          data-testid="article-open-external"
        >
          <ExternalLink size={20} className="text-[#1c679f]" />
        </a>
      </div>

      {/* WebView-like iframe - matches mobile WebView behavior */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
            <div className="w-8 h-8 border-2 border-[#1c679f] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-gray-500">Chargement de l'article...</p>
          </div>
        )}
        <iframe
          src={finalUrl}
          title={articleTitle}
          className="w-full h-full border-0"
          style={{ minHeight: 'calc(100vh - 130px)' }}
          onLoad={() => setLoading(false)}
          data-testid="article-iframe"
        />
      </div>
    </div>
  );
};

export default ArticleDetail;
