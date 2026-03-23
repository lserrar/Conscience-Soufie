import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, FileText } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const TOPIC_FILTERS = [
  { slug: 'all', label: 'Tous' },
  { slug: 'soufisme', label: 'Soufisme' },
  { slug: 'le-prophete-muhammad', label: 'Le Prophète' },
  { slug: 'ibn-arabi', label: "Ibn 'Arabî" },
  { slug: 'rumi', label: 'Rûmî' },
  { slug: 'henry-corbin', label: 'Henry Corbin' },
  { slug: 'eva', label: 'Eva de Vitray' },
  { slug: 'cheikh-ahmad-al-alawi', label: "Cheikh al-'Alâwî" },
  { slug: 'hallaj', label: 'Hallâj' },
  { slug: 'poesie', label: 'Poésie' },
  { slug: 'philosophie', label: 'Philosophie' },
  { slug: 'references-bibilographiques', label: 'Bibliographie' },
  { slug: 'paix', label: 'Paix' },
  { slug: 'hommages', label: 'Hommages' },
  { slug: 'rene-guenon', label: 'René Guénon' },
];

const stripHTML = (html) => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/\[&hellip;\]/g, '\u2026')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&#038;/g, '&')
    .replace(/&(?:#\d+|[a-z]+);/gi, ' ')
    .trim();
};

const formatDate = (dateStr) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const Articles = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchPosts = useCallback(async (filter) => {
    try {
      setLoading(true);
      if (filter === 'all') {
        const response = await axios.get(
          'https://consciencesoufie.com/wp-json/wp/v2/posts?per_page=20&_embed'
        );
        setPosts(response.data);
      } else {
        const response = await axios.get(`${API_URL}/api/articles/by-tag/${filter}`);
        setPosts(response.data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(activeFilter);
  }, [activeFilter, fetchPosts]);

  const handleFilterChange = (slug) => {
    setActiveFilter(slug);
  };

  return (
    <div className="bg-white min-h-full pb-6" data-testid="articles-page">
      {/* Topic Filters - horizontal scrollable chips like mobile */}
      <div className="bg-white border-b border-[rgba(28,103,159,0.08)] sticky top-0 z-10">
        <div className="flex gap-2 overflow-x-auto px-4 py-3 hide-scrollbar" data-testid="article-filters">
          {TOPIC_FILTERS.map((filter) => (
            <button
              key={filter.slug}
              onClick={() => handleFilterChange(filter.slug)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter.slug
                  ? 'bg-[#1c679f] text-white'
                  : 'bg-[rgba(28,103,159,0.08)] text-[#1a2a3a]'
              }`}
              data-testid={`filter-${filter.slug}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex flex-col items-center py-16">
            <div className="w-8 h-8 border-2 border-[#1c679f] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-gray-500">Chargement des articles...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <FileText className="text-gray-300" size={48} />
            <p className="mt-3 text-base text-gray-500">Aucun article trouvé pour ce thème.</p>
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="mb-5">
              <h2 className="text-2xl font-serif font-bold text-[#1a2a3a] mb-2">
                {activeFilter === 'all'
                  ? 'Articles récents'
                  : TOPIC_FILTERS.find((f) => f.slug === activeFilter)?.label || 'Articles'}
              </h2>
              <div className="w-[60px] h-[3px] bg-[#c9a96e] rounded-sm"></div>
            </div>

            {/* Post Cards - mobile style */}
            <div className="space-y-4">
              {posts.map((post) => {
                const thumbnail = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                const title = stripHTML(post.title?.rendered);
                const excerpt = stripHTML(post.excerpt?.rendered);
                const articleUrl = post.link || '';

                return (
                  <Link
                    key={post.id}
                    to={`/articles/${post.slug}?url=${encodeURIComponent(articleUrl)}&title=${encodeURIComponent(title)}`}
                    className="block bg-white rounded-xl overflow-hidden border border-[rgba(28,103,159,0.08)] shadow-sm"
                    data-testid={`article-card-${post.id}`}
                  >
                    {thumbnail && (
                      <div className="relative">
                        <img
                          src={thumbnail}
                          alt={title}
                          className="w-full h-[180px] object-cover"
                        />
                        <div className="absolute inset-0 bg-[rgba(28,103,159,0.05)]"></div>
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-xs font-medium text-[#c9a96e] uppercase tracking-wide mb-1.5">
                        {formatDate(post.date)}
                      </p>
                      <h3 className="text-lg font-serif text-[#1a2a3a] mb-2 leading-6">
                        {title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-[22px] line-clamp-3 mb-3">
                        {excerpt}
                      </p>
                      <div className="flex items-center gap-1.5 pt-3 border-t border-[rgba(28,103,159,0.08)]">
                        <span className="text-sm font-semibold text-[#1c679f]">Lire la suite</span>
                        <ArrowRight size={16} className="text-[#1c679f]" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Articles;
