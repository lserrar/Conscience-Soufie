import React from 'react';

const About = () => {
  return (
    <div className="bg-[#FAFAFA] min-h-full pb-10">
      <div className="px-7 pt-8">
        {/* Elegant Header */}
        <div className="flex items-center justify-center mb-9">
          <div className="flex-1 h-px bg-[#1c679f]"></div>
          <span className="px-5 text-sm font-medium text-[#1c679f] tracking-[4px] uppercase">À Propos</span>
          <div className="flex-1 h-px bg-[#1c679f]"></div>
        </div>

        {/* Greeting */}
        <p className="text-center text-[22px] font-serif font-bold italic text-[#1c679f] mb-7">
          Chère visiteuse, cher visiteur,
        </p>

        {/* Drop Cap First Paragraph */}
        <div className="flex mb-5">
          <span className="text-[64px] font-serif font-bold text-[#1c679f] leading-[58px] mr-1 -mt-1">C</span>
          <p className="flex-1 text-lg font-serif text-[#2a2a2a] leading-7 pt-1.5">
            onscience Soufie est une association culturelle à but non lucratif.
          </p>
        </div>

        <p className="text-[17px] font-serif text-[#2a2a2a] leading-7 mb-5 text-justify">
          Conscience Soufie ne s'inscrit pas dans un cadre confrérique et n'a pas vocation à se substituer aux fonctions, notamment initiatiques, des confréries existantes. Pour autant, elle valide d'évidence la pertinence du rattachement à un maître spirituel (homme ou femme) et à une chaîne initiatique (<em>silsila</em>) remontant au Prophète.
        </p>

        <p className="text-[17px] font-serif text-[#2a2a2a] leading-7 mb-5 text-justify">
          <strong className="font-bold">Son but ?</strong> Celui de contribuer à une meilleure compréhension de l'islam et à l'épanouissement d'une spiritualité partagée, nourrie des valeurs soufies.
        </p>

        {/* Section Divider */}
        <div className="flex items-center my-7">
          <div className="flex-1 h-px bg-[rgba(28,103,159,0.25)]"></div>
          <span className="px-4 text-xs text-[#1c679f]">✦</span>
          <div className="flex-1 h-px bg-[rgba(28,103,159,0.25)]"></div>
        </div>

        {/* Son histoire */}
        <h2 className="text-[26px] font-serif font-bold text-[#1c679f] mb-5 text-center tracking-wide">
          Son histoire
        </h2>

        <p className="text-[17px] font-serif text-[#2a2a2a] leading-7 mb-5 text-justify">
          Le projet est né en 2015 ; il est le résultat de différents vœux convergents pour la création d'une institution consacrée à la diffusion des valeurs de l'islam et du soufisme pour le développement d'une conscience spirituelle. Une fondation basée à Genève vit le jour en 2016. Une équipe de quatre membres fondateurs, dont <strong className="font-bold">Éric Geoffroy</strong>, spécialiste du soufisme, traça les grands axes de son programme et rassembla autour d'elle quelques volontaires et sympathisants.
        </p>

        {/* Section Divider */}
        <div className="flex items-center my-7">
          <div className="flex-1 h-px bg-[rgba(28,103,159,0.25)]"></div>
          <span className="px-4 text-xs text-[#1c679f]">✦</span>
          <div className="flex-1 h-px bg-[rgba(28,103,159,0.25)]"></div>
        </div>

        {/* Son action */}
        <h2 className="text-[26px] font-serif font-bold text-[#1c679f] mb-5 text-center tracking-wide">
          Son action
        </h2>

        <p className="text-[17px] font-serif text-[#2a2a2a] leading-7 mb-5 text-justify">
          Aujourd'hui, Conscience Soufie est en France, et a évolué en association d'intérêt général afin d'alléger son fonctionnement. Elle accueille un public international et poursuit ses activités en suivant trois axes :
        </p>

        {/* Les 3 axes - Editorial style */}
        <div className="mb-7 pl-2">
          <span className="text-sm font-serif text-[#1c679f] tracking-[2px]">I</span>
          <h3 className="text-[19px] font-serif font-bold text-[#2a2a2a] italic mt-1.5 mb-2.5">
            Transmission et Enseignement
          </h3>
          <p className="text-base font-serif text-[#444444] leading-[26px] text-justify">
            Se déploie à travers de nombreuses conférences, en distanciel et gratuites, traitant de sujets variés, tous ancrés dans la spiritualité.
          </p>
        </div>

        <div className="mb-7 pl-2">
          <span className="text-sm font-serif text-[#1c679f] tracking-[2px]">II</span>
          <h3 className="text-[19px] font-serif font-bold text-[#2a2a2a] italic mt-1.5 mb-2.5">
            Publication
          </h3>
          <p className="text-base font-serif text-[#444444] leading-[26px] text-justify">
            Se concrétise par la réalisation d'une revue électronique et gratuite, des bibliographies, dossiers, articles, vidéos et podcasts mis en ligne.
          </p>
        </div>

        <div className="mb-7 pl-2">
          <span className="text-sm font-serif text-[#1c679f] tracking-[2px]">III</span>
          <h3 className="text-[19px] font-serif font-bold text-[#2a2a2a] italic mt-1.5 mb-2.5">
            Voyages, Pérégrinations et Retraites
          </h3>
          <p className="text-base font-serif text-[#444444] leading-[26px] text-justify">
            Une aventure spirituelle : chaque année, Conscience Soufie séjourne dans le désert marocain et part vers d'autres horizons – le Caire, de Fès à Tanger, d'Istanbul à Konya…
          </p>
        </div>

        <p className="text-[17px] font-serif text-[#2a2a2a] leading-7 mb-5 text-justify">
          Conscience Soufie chemine pas à pas : l'équipe, dont tous les membres sont bénévoles, évolue selon les disponibilités des uns et des autres ; le public grandit et se fidélise.
        </p>

        {/* Closing Section */}
        <div className="mt-5 flex flex-col items-center">
          <div className="w-20 h-0.5 bg-[#1c679f] mb-7"></div>
          <p className="text-xl font-serif font-bold italic text-[#1c679f] mb-6 text-center">
            Nous vous souhaitons la Bienvenue !
          </p>
          <p className="text-base font-serif italic text-[#666666] mb-2">
            Bien fraternellement,
          </p>
          <p className="text-[22px] font-serif font-bold text-[#1c679f] tracking-wide">
            Conscience Soufie
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
