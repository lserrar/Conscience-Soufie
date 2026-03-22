import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get('https://consciencesoufie.com/wp-json/wp/v2/posts?per_page=50&_embed');
      const formattedArticles = response.data.map(post => ({
        id: post.id,
        title: post.title.rendered,
        slug: post.slug,
        excerpt: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
        date: post.date,
        image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
        categories: post._embedded?.['wp:term']?.[0]?.map(cat => cat.name) || []
      }));
      setArticles(formattedArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 skeleton rounded-lg w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-72 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">Articles</h1>
        <p className="text-gray-600 mb-6">
          Découvrez nos articles sur le soufisme, la spiritualité et la sagesse traditionnelle.
        </p>
        
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <Link
            key={article.id}
            to={`/articles/${article.slug}`}
            className="bg-white rounded-xl shadow-sm overflow-hidden card-hover"
          >
            {article.image && (
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-5">
              <div className="flex flex-wrap gap-2 mb-3">
                {article.categories.slice(0, 2).map((cat, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
              <h2 
                className="font-serif text-lg font-semibold text-gray-900 mb-2 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: article.title }}
              />
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">{article.excerpt}</p>
              <p className="text-xs text-gray-400 flex items-center">
                <Calendar size={12} className="mr-1" />
                {formatDate(article.date)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucun article trouvé pour "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default Articles;
