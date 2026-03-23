import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Video, Calendar, ExternalLink, Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const Videos = () => {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/zoom/webinars`);
      const data = response.data.webinars || response.data || [];
      setWebinars(data);
    } catch (error) {
      console.error('Error fetching webinars:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white min-h-full">
        <div className="w-8 h-8 border-2 border-[#1c679f] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm font-serif text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-full pb-6">
      {/* Header */}
      <section className="pt-5 pb-4">
        <div className="px-4 mb-2">
          <h2 className="text-2xl font-serif font-bold text-[#1a2a3a]">Webinaires Zoom</h2>
          <div className="w-[60px] h-[3px] bg-[#c9a96e] mt-2 rounded-sm"></div>
        </div>
        <p className="px-4 text-sm text-gray-600 mt-3">
          Accédez aux conférences et enseignements en direct réservés aux membres.
        </p>
      </section>

      {/* Comment participer */}
      <section className="mx-4 mb-6 p-4 bg-[rgba(28,103,159,0.05)] rounded-xl border border-[rgba(28,103,159,0.1)]">
        <h3 className="text-base font-semibold text-[#1c679f] mb-2 flex items-center gap-2">
          <Users size={18} />
          Comment participer ?
        </h3>
        <ol className="text-sm text-gray-600 space-y-1.5 list-decimal list-inside">
          <li>Cliquez sur le webinaire qui vous intéresse</li>
          <li>Rejoignez via le lien Zoom fourni</li>
          <li>Connectez-vous avec votre nom et email</li>
        </ol>
      </section>

      {/* Webinars List */}
      <section className="px-4">
        {webinars.length > 0 ? (
          <div className="space-y-4">
            {webinars.map((webinar) => (
              <div
                key={webinar.id}
                className="bg-white rounded-xl border border-[rgba(28,103,159,0.15)] overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[#1c679f] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video className="text-white" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-serif font-bold text-[#1a2a3a] mb-1.5 leading-tight">
                        {webinar.topic}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                        <Calendar size={14} />
                        {formatDate(webinar.start_time)}
                      </p>
                      {webinar.agenda && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{webinar.agenda}</p>
                      )}
                      {webinar.join_url && (
                        <a
                          href={webinar.join_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1c679f] text-white text-sm font-medium rounded-lg"
                        >
                          Rejoindre le webinaire
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-12">
            <div className="w-16 h-16 bg-[rgba(28,103,159,0.1)] rounded-full flex items-center justify-center mb-4">
              <Video className="text-[#1c679f]" size={32} />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#1a2a3a] mb-2">Aucun webinaire prévu</h3>
            <p className="text-sm text-gray-500 text-center">
              Les prochains webinaires seront annoncés ici.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Videos;
