import React from 'react';
import { ExternalLink } from 'lucide-react';

const MAGAZINES = [
  {
    id: '4',
    title: 'Présence du Prophète',
    cover: 'https://customer-assets.emergentagent.com/job_3f80383a-d81a-4581-ad89-ad734daf5fe0/artifacts/43f2ucto_Une-de-Couv-Revue-CS4-Newsletter%402x-100.jpg',
    readUrl: 'https://www.calameo.com/read/007294180361a4e13db8f',
    description: 'La quatrième édition de notre revue explore la présence spirituelle du Prophète Muhammad dans la tradition soufie.'
  },
  {
    id: '3',
    title: 'Transmission et Initiation',
    cover: 'https://customer-assets.emergentagent.com/job_c0476faa-5b8f-4947-b745-239f5b57206d/artifacts/r3fdfqad_IMG_1584.jpeg',
    readUrl: 'https://www.calameo.com/read/00729418046e9bf1ac1d9',
    description: 'Ce numéro aborde les thèmes de la transmission spirituelle et de l\'initiation dans les voies soufies.'
  },
  {
    id: '2',
    title: 'Soufisme et Poésie',
    cover: 'https://customer-assets.emergentagent.com/job_3f80383a-d81a-4581-ad89-ad734daf5fe0/artifacts/w39zxa8f_Image-23-03-2019-a%CC%80-21.38.jpg',
    readUrl: 'https://www.calameo.com/read/0072941807720db430b2a',
    description: 'Une exploration de la dimension poétique du soufisme à travers les grands maîtres de la tradition.'
  },
  {
    id: '1',
    title: 'Revue N°1',
    cover: 'https://customer-assets.emergentagent.com/job_3f80383a-d81a-4581-ad89-ad734daf5fe0/artifacts/9vdxekwg_Revue-Conscience-Soufie-N1-web.jpg',
    readUrl: 'https://www.calameo.com/read/00729418082df7e90cef6',
    description: 'Le premier numéro de la Revue Conscience Soufie, une introduction à notre projet éditorial.'
  },
];

const Magazines = () => {
  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Revue Conscience Soufie
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Découvrez notre revue trimestrielle dédiée à l'exploration de la sagesse soufie. 
          Chaque numéro propose des articles de fond, des traductions inédites et des réflexions 
          sur la spiritualité traditionnelle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MAGAZINES.map((magazine) => (
          <div
            key={magazine.id}
            className="bg-white rounded-2xl shadow-sm overflow-hidden card-hover flex flex-col md:flex-row"
          >
            <div className="md:w-1/2">
              <img 
                src={magazine.cover} 
                alt={magazine.title} 
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  Revue N°{magazine.id}
                </span>
                <h2 className="font-serif text-2xl font-bold text-gray-900 mt-3 mb-3">
                  {magazine.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {magazine.description}
                </p>
              </div>
              <a
                href={magazine.readUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Lire la revue
                <ExternalLink size={18} className="ml-2" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Subscription CTA */}
      <div className="mt-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 md:p-12 text-white text-center">
        <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
          Soutenez la Revue Conscience Soufie
        </h2>
        <p className="text-white/80 max-w-2xl mx-auto mb-6">
          En devenant membre de l'association, vous soutenez notre travail éditorial et recevez 
          chaque numéro de la revue en format numérique.
        </p>
        <a
          href="https://www.helloasso.com/associations/conscience-soufie"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          Devenir membre
          <ExternalLink size={18} className="ml-2" />
        </a>
      </div>
    </div>
  );
};

export default Magazines;
