import React from 'react';
import { Mail, ExternalLink, Heart, Users, BookOpen, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          À Propos de Conscience Soufie
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Association dédiée à la diffusion et à l'étude de la sagesse soufie, 
          patrimoine spirituel universel de l'humanité.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-16">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Notre Mission
          </h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p>
              Conscience Soufie est une association culturelle qui œuvre à faire connaître 
              le soufisme comme dimension spirituelle de l'islam et comme patrimoine universel 
              de l'humanité. Notre mission s'articule autour de trois axes principaux :
            </p>
            <ul>
              <li>La diffusion de la connaissance du soufisme à travers des publications, 
                  conférences et événements culturels</li>
              <li>La promotion du dialogue interreligieux et interculturel</li>
              <li>La valorisation de l'héritage spirituel des grands maîtres soufis</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mb-16">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Nos Valeurs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Heart,
              title: 'Spiritualité',
              description: 'Cultiver la dimension intérieure de l\'être à travers la sagesse soufie.'
            },
            {
              icon: Users,
              title: 'Universalité',
              description: 'Promouvoir le message universel du soufisme au-delà des frontières.'
            },
            {
              icon: BookOpen,
              title: 'Connaissance',
              description: 'Partager le savoir des grands maîtres de la tradition soufie.'
            },
            {
              icon: Globe,
              title: 'Dialogue',
              description: 'Favoriser le dialogue entre les cultures et les spiritualités.'
            },
          ].map((value, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 text-center card-hover"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <value.icon className="text-primary" size={28} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
              <p className="text-gray-600 text-sm">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Activities */}
      <section className="mb-16">
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 md:p-12 text-white">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-8 text-center">
            Nos Activités
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Publications',
                description: 'Revue trimestrielle, articles en ligne et traductions inédites de textes soufis classiques.'
              },
              {
                title: 'Événements',
                description: 'Conférences, séminaires, veillées spirituelles et rencontres avec des spécialistes.'
              },
              {
                title: 'Formation',
                description: 'Cycles d\'enseignement sur les grands thèmes du soufisme et ses figures majeures.'
              },
            ].map((activity, index) => (
              <div key={index} className="text-center">
                <h3 className="font-semibold text-xl mb-3">{activity.title}</h3>
                <p className="text-white/80">{activity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Join */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">
              Nous Contacter
            </h2>
            <p className="text-gray-600 mb-6">
              Pour toute question ou information complémentaire, n'hésitez pas à nous écrire.
            </p>
            <a
              href="mailto:contact@consciencesoufie.com"
              className="inline-flex items-center text-primary hover:text-primary-dark"
            >
              <Mail size={20} className="mr-2" />
              contact@consciencesoufie.com
            </a>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">
              Rejoignez-nous
            </h2>
            <p className="text-gray-600 mb-6">
              Devenez membre de Conscience Soufie et soutenez notre mission.
            </p>
            <a
              href="https://www.helloasso.com/associations/conscience-soufie"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Devenir membre
              <ExternalLink size={18} className="ml-2" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
