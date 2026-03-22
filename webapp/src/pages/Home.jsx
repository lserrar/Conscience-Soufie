import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play, Calendar, ChevronRight, Headphones, Video, BookOpen } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const API_URL = import.meta.env.VITE_API_URL || '';

// Thematic tags for article carousels (from WordPress categories)
const THEMATIC_TAGS = [
  { slug: 'references-bibilographiques', label: 'Bibliographie' },
  { slug: 'le-prophete-muhammad', label: 'Le Prophète Muhammad' },
  { slug: 'ibn-arabi', label: "Ibn 'Arabî" },
  { slug: 'rumi', label: 'Rûmî' },
  { slug: 'hallaj', label: 'Hallâj' },
  { slug: 'poesie', label: 'Poésie' },
  { slug: 'hommages', label: 'Hommages' },
  { slug: 'eva', label: 'Eva de Vitray-Meyerovitch' },
  { slug: 'henry-corbin', label: 'Henry Corbin' },
  { slug: 'rene-guenon', label: 'René Guénon' },
  { slug: 'cheikh-ahmad-al-alawi', label: "Cheikh al-'Alâwî" },
  { slug: 'philosophie', label: 'Philosophie' },
  { slug: 'paix', label: 'Paix' },
  { slug: 'soufisme', label: 'Soufisme' },
];

const MAGAZINES = [
  {
    id: '4',
    title: 'Présence du Prophète',
    cover: 'https://customer-assets.emergentagent.com/job_3f80383a-d81a-4581-ad89-ad734daf5fe0/artifacts/43f2ucto_Une-de-Couv-Revue-CS4-Newsletter%402x-100.jpg',
    readUrl: 'https://www.calameo.com/read/007294180361a4e13db8f',
  },
  {
    id: '3',
    title: 'Transmission et Initiation',
    cover: 'https://customer-assets.emergentagent.com/job_c0476faa-5b8f-4947-b745-239f5b57206d/artifacts/r3fdfqad_IMG_1584.jpeg',
    readUrl: 'https://www.calameo.com/read/00729418046e9bf1ac1d9',
  },
  {
    id: '2',
    title: 'Soufisme et Poésie',
    cover: 'https://customer-assets.emergentagent.com/job_3f80383a-d81a-4581-ad89-ad734daf5fe0/artifacts/w39zxa8f_Image-23-03-2019-a%CC%80-21.38.jpg',
    readUrl: 'https://www.calameo.com/read/0072941807720db430b2a',
  },
  {
    id: '1',
    title: 'Revue N°1',
    cover: 'https://customer-assets.emergentagent.com/job_3f80383a-d81a-4581-ad89-ad734daf5fe0/artifacts/9vdxekwg_Revue-Conscience-Soufie-N1-web.jpg',
    readUrl: 'https://www.calameo.com/read/00729418082df7e90cef6',
  },
];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [articles, setArticles] = useState([]);
  const [themedArticles, setThemedArticles] = useState({});
  const [loading, setLoading] = useState(true);
  const { playTrack } = useAudio();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, podcastsRes, videosRes, articlesRes] = await Promise.all([
        axios.get(`${API_URL}/api/helloasso/events`),
        axios.get(`${API_URL}/api/podcasts`),
        axios.get(`${API_URL}/api/youtube/videos`),
        axios.get('https://consciencesoufie.com/wp-json/wp/v2/posts?per_page=10&_embed'),
      ]);

      const eventsData = eventsRes.data.events || eventsRes.data || [];
      const podcastsData = podcastsRes.data.podcasts || podcastsRes.data || [];
      const videosData = videosRes.data.videos || videosRes.data || [];

      setEvents(eventsData);
      setPodcasts(podcastsData.slice(0, 8));
      setVideos(videosData.slice(0, 8));
      setArticles(articlesRes.data.slice(0, 8));

      // Fetch themed articles
      const themedResults = {};
      await Promise.all(
        THEMATIC_TAGS.map(async (tag) => {
          try {
            const res = await axios.get(`${API_URL}/api/articles/by-tag/${tag.slug}`);
            if (res.data.articles && res.data.articles.length > 0) {
              themedResults[tag.slug] = res.data.articles.slice(0, 8);
            }
          } catch (err) {
            console.log(`No articles for ${tag.slug}`);
          }
        })
      );
      setThemedArticles(themedResults);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    } catch {
      return '';
    }
  };

  const formatDateTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const dateFormatted = date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      });
      const timeFormatted = date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${dateFormatted} à ${timeFormatted}`;
    } catch {
      return '';
    }
  };

  const cleanHtml = (html) => {
    return html?.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim() || '';
  };

  const ArticleCard = ({ article }) => {
    const thumbnail = article._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    return (
      <Link
        to={`/articles/${article.slug}`}
        className="flex-shrink-0 w-[200px] bg-white rounded-lg overflow-hidden border border-[rgba(28,103,159,0.1)]"
      >
        {thumbnail ? (
          <img src={thumbnail} alt={cleanHtml(article.title?.rendered)} className="w-full h-[120px] object-cover" />
        ) : (
          <div className="w-full h-[120px] bg-[rgba(28,103,159,0.08)] flex items-center justify-center">
            <BookOpen className="text-[#1c679f]" size={32} />
          </div>
        )}
        <div className="p-3">
          <h3 className="text-sm font-serif text-[#1a2a3a] line-clamp-2 leading-[18px] mb-1.5">
            {cleanHtml(article.title?.rendered)}
          </h3>
          <p className="text-xs text-gray-500">{formatDate(article.date)}</p>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#1c679f] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm font-serif text-gray-500">Chargement...</p>
      </div>
    );
  }

  const highlightEvent = events[0];
  const upcomingEvents = events.slice(1, 6);

  return (
    <div className="bg-white min-h-full pb-6">
      {/* Hero - À la une */}
      {highlightEvent && (
        <section className="mb-6 pt-5">
          <div className="px-4 mb-4">
            <h2 className="text-2xl font-serif font-bold text-[#1a2a3a]">À la une</h2>
            <div className="w-[60px] h-[3px] bg-[#c9a96e] mt-2 rounded-sm"></div>
          </div>
          
          <a
            href={highlightEvent.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mx-4"
          >
            <div className="rounded-xl overflow-hidden bg-[#f0f4f8]">
              {(highlightEvent.logo || highlightEvent.banner) ? (
                <img
                  src={highlightEvent.logo || highlightEvent.banner}
                  alt={highlightEvent.title}
                  className="w-full aspect-video object-contain"
                />
              ) : (
                <div className="w-full aspect-video bg-[rgba(28,103,159,0.1)] flex items-center justify-center">
                  <Calendar className="text-[#1c679f]" size={64} />
                </div>
              )}
            </div>
            <div className="pt-4">
              <h3 className="text-xl font-serif font-bold text-[#1a2a3a] mb-2 leading-[26px]">
                {highlightEvent.title}
              </h3>
              <p className="text-sm text-gray-500">{formatDateTime(highlightEvent.startDate)}</p>
            </div>
          </a>
        </section>
      )}

      {/* Section: Prochains Événements */}
      {upcomingEvents.length > 0 && (
        <section className="mb-7">
          <div className="flex items-center justify-between px-4 mb-3.5">
            <h2 className="text-xl font-serif font-bold text-[#1a2a3a]">Prochains événements</h2>
            <Link to="/videos" className="text-sm font-medium text-[#1c679f]">Voir tout</Link>
          </div>
          <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 hide-scrollbar">
            {upcomingEvents.map((event) => (
              <a
                key={event.id}
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-[160px] bg-white rounded-lg overflow-hidden border border-[rgba(28,103,159,0.1)]"
              >
                {(event.logo || event.banner) ? (
                  <img src={event.logo || event.banner} alt={event.title} className="w-full h-[90px] object-cover" />
                ) : (
                  <div className="w-full h-[90px] bg-[rgba(28,103,159,0.08)] flex items-center justify-center">
                    <Calendar className="text-[#1c679f]" size={32} />
                  </div>
                )}
                <div className="p-3">
                  <h3 className="text-[13px] font-serif text-[#1a2a3a] line-clamp-2 leading-[17px] mb-1">{event.title}</h3>
                  <p className="text-xs text-gray-500">{formatDate(event.startDate)}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Section: Derniers Articles */}
      {articles.length > 0 && (
        <section className="mb-7">
          <div className="flex items-center justify-between px-4 mb-3.5">
            <h2 className="text-xl font-serif font-bold text-[#1a2a3a]">Derniers articles</h2>
            <Link to="/articles" className="text-sm font-medium text-[#1c679f]">Voir tout</Link>
          </div>
          <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 hide-scrollbar">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Section: Dernières Vidéos YouTube */}
      {videos.length > 0 && (
        <section className="mb-7">
          <div className="flex items-center justify-between px-4 mb-3.5">
            <h2 className="text-xl font-serif font-bold text-[#1a2a3a]">Dernières vidéos</h2>
            <a href="https://www.youtube.com/@ConscienceSoufie" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#1c679f]">Voir la chaîne</a>
          </div>
          <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 hide-scrollbar">
            {videos.map((video) => (
              <a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-[200px] bg-white rounded-lg overflow-hidden border border-[rgba(28,103,159,0.1)]"
              >
                <div className="relative">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-[120px] object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                      <Play className="text-white ml-0.5" size={20} fill="white" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-serif text-[#1a2a3a] line-clamp-2 leading-[18px]">{video.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Section: Revues Conscience Soufie */}
      <section className="mb-7">
        <div className="flex items-center justify-between px-4 mb-3.5">
          <h2 className="text-xl font-serif font-bold text-[#1a2a3a]">Revues Conscience Soufie</h2>
        </div>
        <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 hide-scrollbar">
          {MAGAZINES.map((mag) => (
            <a
              key={mag.id}
              href={mag.readUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-[120px] flex flex-col items-center"
            >
              <div className="w-[120px] h-[170px] rounded-lg overflow-hidden mb-2.5 shadow-lg">
                <img src={mag.cover} alt={mag.title} className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-[#1a2a3a] text-center">Revue N°{mag.id}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Thematic Article Sections */}
      {THEMATIC_TAGS.map((tag) => {
        const tagArticles = themedArticles[tag.slug];
        if (!tagArticles || tagArticles.length === 0) return null;
        
        return (
          <section key={tag.slug} className="mb-7">
            <div className="flex items-center justify-between px-4 mb-3.5">
              <h2 className="text-xl font-serif font-bold text-[#1a2a3a]">{tag.label}</h2>
              <Link to="/articles" className="text-sm font-medium text-[#1c679f]">Voir tout</Link>
            </div>
            <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 hide-scrollbar">
              {tagArticles.map((article) => (
                <ArticleCard key={`${tag.slug}-${article.id}`} article={article} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default Home;
