import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play, Calendar, ExternalLink, ChevronRight, Headphones, Video, BookOpen } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const API_URL = import.meta.env.VITE_API_URL || '';

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
];

const THEMATIC_TAGS = [
  { slug: 'soufisme', label: 'Soufisme' },
  { slug: 'ibn-arabi', label: "Ibn 'Arabî" },
  { slug: 'rumi', label: 'Rûmî' },
  { slug: 'poesie', label: 'Poésie' },
  { slug: 'philosophie', label: 'Philosophie' },
];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [articles, setArticles] = useState({});
  const [loading, setLoading] = useState(true);
  const { playTrack } = useAudio();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, podcastsRes, videosRes] = await Promise.all([
        axios.get(`${API_URL}/api/helloasso/events`),
        axios.get(`${API_URL}/api/podcasts`),
        axios.get(`${API_URL}/api/youtube/videos`),
      ]);

      // Handle different API response formats
      const eventsData = eventsRes.data.events || eventsRes.data || [];
      const podcastsData = podcastsRes.data.podcasts || podcastsRes.data || [];
      const videosData = videosRes.data.videos || videosRes.data || [];

      setEvents(eventsData.slice(0, 3));
      setPodcasts(podcastsData.slice(0, 4));
      setVideos(videosData.slice(0, 4));

      // Fetch articles by tags
      const articlePromises = THEMATIC_TAGS.map(tag =>
        axios.get(`${API_URL}/api/articles/by-tag/${tag.slug}`).then(res => ({
          slug: tag.slug,
          articles: res.data.slice(0, 4)
        }))
      );
      const articleResults = await Promise.all(articlePromises);
      const articlesObj = {};
      articleResults.forEach(r => {
        articlesObj[r.slug] = r.articles;
      });
      setArticles(articlesObj);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-64 skeleton rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Hero Section - Next Event */}
      {events.length > 0 && (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-secondary text-white text-sm font-medium rounded-full mb-4">
              Prochain événement
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              {events[0].title}
            </h1>
            <p className="flex items-center text-white/80 mb-6">
              <Calendar className="mr-2" size={18} />
              {formatDate(events[0].startDate)}
            </p>
            <a
              href={events[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              S'inscrire
              <ExternalLink className="ml-2" size={18} />
            </a>
          </div>
        </section>
      )}

      {/* Events Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-gray-900">
            Prochains événements
          </h2>
          <Link to="/videos" className="text-primary hover:text-primary-dark flex items-center font-medium">
            Voir tout <ChevronRight size={20} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <a
              key={event.id}
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl shadow-sm overflow-hidden card-hover"
            >
              {event.banner && (
                <img src={event.banner} alt={event.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                <p className="text-sm text-gray-500 flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {formatDate(event.startDate)}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Podcasts Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-gray-900 flex items-center">
            <Headphones className="mr-3 text-primary" size={28} />
            Podcasts
          </h2>
          <Link to="/podcasts" className="text-primary hover:text-primary-dark flex items-center font-medium">
            Voir tout <ChevronRight size={20} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {podcasts.map((podcast) => (
            <div
              key={podcast.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden card-hover cursor-pointer"
              onClick={() => playTrack({
                id: podcast.id,
                title: podcast.title,
                url: podcast.audio_url,
                image: podcast.image
              })}
            >
              <div className="relative">
                <img src={podcast.image} alt={podcast.title} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <Play className="text-primary ml-1" size={24} />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{podcast.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Videos Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-gray-900 flex items-center">
            <Video className="mr-3 text-primary" size={28} />
            Vidéos
          </h2>
          <Link to="/videos" className="text-primary hover:text-primary-dark flex items-center font-medium">
            Voir tout <ChevronRight size={20} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl shadow-sm overflow-hidden card-hover"
            >
              <div className="relative">
                <img src={video.thumbnail} alt={video.title} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <Play className="text-white ml-1" size={24} />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{video.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Magazines Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-gray-900 flex items-center">
            <BookOpen className="mr-3 text-primary" size={28} />
            Revue Conscience Soufie
          </h2>
          <Link to="/magazines" className="text-primary hover:text-primary-dark flex items-center font-medium">
            Voir tout <ChevronRight size={20} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {MAGAZINES.map((mag) => (
            <a
              key={mag.id}
              href={mag.readUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="relative overflow-hidden rounded-xl shadow-lg card-hover">
                <img 
                  src={mag.cover} 
                  alt={mag.title} 
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-serif text-lg font-semibold">{mag.title}</h3>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Articles by Theme */}
      {THEMATIC_TAGS.map((tag) => (
        articles[tag.slug]?.length > 0 && (
          <section key={tag.slug}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-gray-900">
                {tag.label}
              </h2>
              <Link to="/articles" className="text-primary hover:text-primary-dark flex items-center font-medium">
                Voir tout <ChevronRight size={20} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {articles[tag.slug].map((article) => (
                <Link
                  key={article.id}
                  to={`/articles/${article.slug}`}
                  className="bg-white rounded-xl shadow-sm overflow-hidden card-hover"
                >
                  {article.image && (
                    <img src={article.image} alt={article.title} className="w-full h-32 object-cover" />
                  )}
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{article.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      ))}
    </div>
  );
};

export default Home;
