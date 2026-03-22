import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Calendar, Video as VideoIcon, ExternalLink } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [webinars, setWebinars] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [videosRes, webinarsRes, eventsRes] = await Promise.all([
        axios.get(`${API_URL}/api/youtube/videos`),
        axios.get(`${API_URL}/api/zoom/webinars`),
        axios.get(`${API_URL}/api/helloasso/events`),
      ]);
      
      // Handle different API response formats
      const videosData = videosRes.data.videos || videosRes.data || [];
      const webinarsData = webinarsRes.data.webinars || webinarsRes.data || [];
      const eventsData = eventsRes.data.events || eventsRes.data || [];
      
      setVideos(videosData);
      setWebinars(webinarsData);
      setEvents(eventsData);
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
      <div className="space-y-6">
        <div className="h-12 skeleton rounded-lg w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">Vidéos & Événements</h1>
        <p className="text-gray-600">
          Retrouvez nos vidéos YouTube, webinaires Zoom et événements à venir.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        {[
          { id: 'videos', label: 'Vidéos YouTube', count: videos.length },
          { id: 'webinars', label: 'Webinaires', count: webinars.length },
          { id: 'events', label: 'Événements', count: events.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
              {tab.count}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Videos Grid */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl shadow-sm overflow-hidden card-hover"
            >
              <div className="relative">
                <img src={video.thumbnail} alt={video.title} className="w-full h-44 object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                    <Play className="text-white ml-1" size={32} />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{video.title}</h3>
                {video.publishedAt && (
                  <p className="text-sm text-gray-500">
                    {formatDate(video.publishedAt)}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Webinars */}
      {activeTab === 'webinars' && (
        <div className="space-y-4">
          {webinars.length > 0 ? (
            webinars.map((webinar) => (
              <div
                key={webinar.id}
                className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between card-hover"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <VideoIcon className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{webinar.topic}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(webinar.start_time)}
                    </p>
                  </div>
                </div>
                {webinar.join_url && (
                  <a
                    href={webinar.join_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center"
                  >
                    Rejoindre
                    <ExternalLink size={16} className="ml-2" />
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              Aucun webinaire programmé pour le moment.
            </div>
          )}
        </div>
      )}

      {/* Events */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <a
              key={event.id}
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl shadow-sm overflow-hidden card-hover"
            >
              {event.banner && (
                <img src={event.banner} alt={event.title} className="w-full h-44 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{event.title}</h3>
                <p className="text-sm text-gray-500 flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {formatDate(event.startDate)}
                </p>
                <span className="inline-block mt-3 text-sm text-primary font-medium">
                  S'inscrire →
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Videos;
