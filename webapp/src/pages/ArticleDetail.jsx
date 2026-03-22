import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const response = await axios.get(
        `https://consciencesoufie.com/wp-json/wp/v2/posts?slug=${slug}&_embed`
      );
      if (response.data.length > 0) {
        const post = response.data[0];
        setArticle({
          id: post.id,
          title: post.title.rendered,
          content: post.content.rendered,
          date: post.date,
          image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
          author: post._embedded?.['author']?.[0]?.name || 'Conscience Soufie',
          categories: post._embedded?.['wp:term']?.[0]?.map(cat => cat.name) || []
        });
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const shareArticle = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="h-8 skeleton rounded w-32 mb-6" />
        <div className="h-64 skeleton rounded-xl mb-6" />
        <div className="h-10 skeleton rounded w-3/4 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 skeleton rounded" />)}
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article non trouvé</h2>
        <Link to="/articles" className="text-primary hover:underline">
          Retour aux articles
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto animate-fadeIn">
      <Link 
        to="/articles" 
        className="inline-flex items-center text-primary hover:text-primary-dark mb-6"
      >
        <ArrowLeft size={18} className="mr-2" />
        Retour aux articles
      </Link>

      {article.image && (
        <img 
          src={article.image} 
          alt={article.title} 
          className="w-full h-64 md:h-96 object-cover rounded-2xl mb-8"
        />
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {article.categories.map((cat, idx) => (
          <span key={idx} className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full">
            {cat}
          </span>
        ))}
      </div>

      <h1 
        className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4"
        dangerouslySetInnerHTML={{ __html: article.title }}
      />

      <div className="flex items-center justify-between text-gray-500 text-sm mb-8 pb-8 border-b">
        <div className="flex items-center space-x-4">
          <span>{article.author}</span>
          <span className="flex items-center">
            <Calendar size={14} className="mr-1" />
            {formatDate(article.date)}
          </span>
        </div>
        <button 
          onClick={shareArticle}
          className="flex items-center space-x-1 hover:text-primary transition-colors"
        >
          <Share2 size={18} />
          <span>Partager</span>
        </button>
      </div>

      <div 
        className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
};

export default ArticleDetail;
