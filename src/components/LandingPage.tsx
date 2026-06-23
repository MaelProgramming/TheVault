'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heading, Text, Button, Divider, Card } from '@gruand-co/core';

// Slow, sophisticated transition presets for Old Money aesthetic
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1] as const, // easeOutExpo
    },
  },
};

const scrollRevealVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function LandingPage() {
  const router = useRouter();

  // Custom smooth scroll handler for single page anchors
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="theme-old-money min-h-screen relative flex flex-col font-sans select-none overflow-x-hidden">
      {/* 1. HEADER / NAVIGATION */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-40 bg-[#F5F5DC]/80 backdrop-blur-md border-b border-[#C5A059]/15 px-6 sm:px-12 py-5 flex items-center justify-between"
      >
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="cursor-pointer"
        >
          <Heading level={2} className="!text-lg sm:!text-xl tracking-[0.35em] uppercase font-serif text-[#000000] m-0">
            The Vault
          </Heading>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-12">
          <button
            onClick={() => handleScrollTo('philosophy')}
            className="text-[11px] tracking-[0.25em] uppercase text-[#000000]/60 hover:text-[#000000] transition-colors duration-500 cursor-pointer font-medium"
          >
            Philosophie
          </button>
          <button
            onClick={() => handleScrollTo('concept')}
            className="text-[11px] tracking-[0.25em] uppercase text-[#000000]/60 hover:text-[#000000] transition-colors duration-500 cursor-pointer font-medium"
          >
            Concept
          </button>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          <button
            onClick={() => router.push('/login')}
            className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#000000]/70 hover:text-[#000000] transition-colors duration-500 cursor-pointer font-semibold py-2"
          >
            Connexion
          </button>

          <Button
            onClick={() => router.push('/invite')}
            variant="outline"
            size="sm"
            className="!border-[#C5A059]/40 hover:!border-[#C5A059] !text-[9px] sm:!text-[10px] tracking-[0.25em] uppercase !text-[#C5A059] bg-transparent hover:!bg-[#C5A059]/5 transition-all duration-700 cursor-pointer"
            style={{
              padding: '10px 18px',
              borderRadius: '0px'
            }}
          >
            Rejoindre
          </Button>
        </div>
      </motion.header>

      {/* 2. HERO SECTION */}
      <main className="flex-grow z-10">
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 py-20 sm:py-32 relative"
        >
          {/* Subtle gold crest graphic */}
          <motion.div variants={itemVariants} className="mb-8 flex items-center justify-center flex-col">
            <span className="text-[#C5A059] text-sm tracking-[0.4em] uppercase font-serif block mb-2">⚜</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-[#C5A059]/60 to-transparent"></div>
          </motion.div>

          {/* Punchy serif heading */}
          <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
            <Heading level={1} className="!text-3xl sm:!text-5xl md:!text-6xl !font-serif text-[#000000] leading-[1.15] tracking-tight">
              L'excellence académique a son cercle exclusif.
            </Heading>
          </motion.div>

          {/* Explanatory subphrase */}
          <motion.div variants={itemVariants} className="max-w-xl mx-auto mt-8">
            <Text variant="lead" className="!text-[#000000]/70 !text-[14px] sm:!text-[16px] leading-relaxed tracking-wide font-sans">
              The Vault rassemble les esprits les plus distingués des grandes universités.
              Un espace de réseautage souverain, accessible uniquement sur cooptation stricte.
            </Text>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="mt-12 flex flex-col items-center space-y-4">
            <Button
              onClick={() => router.push('/invite')}
              variant="outline"
              size="lg"
              className="!border-[1.5px] !border-[#C5A059] !text-[#000000] bg-transparent hover:!bg-[#C5A059] hover:!text-white transition-all duration-1000 !text-[11px] tracking-[0.3em] uppercase cursor-pointer"
              style={{
                padding: '18px 44px',
                borderRadius: '0px'
              }}
            >
              Demander l'Accès
            </Button>

            <p className="text-[9px] uppercase tracking-[0.25em] text-[#C5A059] italic mt-2">
              Processus de cooptation rigoureux
            </p>
          </motion.div>

          {/* Bottom spacer line */}
          <motion.div variants={itemVariants} className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="w-[1px] h-12 bg-gradient-to-t from-[#C5A059]/40 to-transparent"></div>
          </motion.div>
        </motion.section>

        {/* 3. PHILOSOPHIE SECTION */}
        <section
          id="philosophy"
          className="py-24 sm:py-36 bg-[#FDFBF7]/40 border-t border-b border-[#C5A059]/10 relative"
        >
          <div className="max-w-5xl mx-auto px-6 sm:px-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={scrollRevealVariants}
              className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start"
            >
              {/* Drop-cap magazine styling on the left */}
              <div className="md:col-span-5 flex flex-col justify-between h-full">
                <span className="text-[10px] tracking-[0.4em] uppercase text-[#C5A059] font-semibold mb-4 block">
                  Notre Philosophie
                </span>

                <h3 className="text-4xl sm:text-5xl font-serif text-[#000000] leading-none mb-6">
                  La pureté de l'alignement.
                </h3>

                <div className="w-16 h-[2px] bg-[#C5A059] mb-6"></div>
              </div>

              {/* Magazine column copy on the right */}
              <div className="md:col-span-7 space-y-6">
                <Text variant="serif" className="!text-[#000000] !text-lg sm:!text-xl leading-relaxed italic">
                  "Nous croyons que la valeur d'un réseau ne réside pas dans son volume, mais dans l'intégrité de ses membres. Notre mission est de préserver un salon d'échange intellectuel pour les leaders de demain."
                </Text>

                <Text className="!text-[#000000]/70 !text-[14px] leading-relaxed tracking-wide font-sans">
                  Dans une époque saturée par le bruit et les algorithmes de masse, The Vault propose une alternative souveraine. Un espace confidentiel de haute tenue sociale et intellectuelle où chaque membre est validé manuellement par notre comité d'admission.
                </Text>
              </div>
            </motion.div>

            {/* Premium Divider ornament */}
            <div className="mt-16 sm:mt-24">
              <Divider ornament className="opacity-40" />
            </div>
          </div>
        </section>

        {/* 4. LE CONCEPT (2x2 GRID) */}
        <section id="concept" className="py-24 sm:py-36 max-w-6xl mx-auto px-6 sm:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={scrollRevealVariants}
            className="text-center mb-16 sm:mb-24"
          >
            <span className="text-[10px] tracking-[0.4em] uppercase text-[#C5A059] font-semibold block mb-4">
              Les Piliers du Temple
            </span>
            <Heading level={2} className="!text-3xl sm:!text-4xl !font-serif text-[#000000]">
              Le Concept
            </Heading>
            <div className="w-12 h-[1px] bg-[#C5A059]/40 mx-auto mt-6"></div>
          </motion.div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {[
              {
                title: 'Le Filtre Souverain',
                subtitle: 'SÉLECTION RIGOUREUSE',
                description: "Chaque membre fait l'objet d'une validation rigoureuse de son cursus universitaire d'élite et de son identité, garantissant une cohésion parfaite au sein du cercle.",
              },
              {
                title: 'L\'Esthétique Héritage',
                subtitle: 'DISCRÉTION ET SOBRIÉTÉ',
                description: 'Absence totale de publicité et d\'algorithme d\'attention. Une interface épurée pensée comme un salon de correspondance fermé pour des échanges authentiques.',
              },
              {
                title: 'Le Réseau Précieux',
                subtitle: 'CONNEXIONS DE RANG',
                description: 'Bénéficiez de mises en relation quotidiennes extrêmement ciblées basées sur des affinités intellectuelles, professionnelles et géographiques précises.',
              },
              {
                title: 'La Synergie Distincte',
                subtitle: 'COLLABORATION SUPÉRIEURE',
                description: 'Le Vault est le terreau de fondations industrielles d\'envergure, de groupes de recherche d\'élite et de cercles d\'investissement privés fermés.',
              },
            ].map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={scrollRevealVariants}
                className="h-full"
              >
                <Card
                  hoverable
                  elevation="none"
                  className="h-full flex flex-col justify-between !bg-transparent !border-[1px] !border-[#C5A059]/20 hover:!border-[#C5A059]/70 !p-8 sm:!p-10 transition-all duration-1000 group relative overflow-hidden"
                  style={{
                    borderRadius: '0px'
                  }}
                >
                  {/* Subtle inner background sweep on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C5A059]/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                  <div>
                    <span className="text-[9px] tracking-[0.3em] text-[#C5A059] font-bold block mb-4">
                      {pillar.subtitle}
                    </span>

                    <h4 className="text-xl sm:text-2xl font-serif text-[#000000] mb-4">
                      {pillar.title}
                    </h4>

                    <Text className="!text-[#000000]/70 !text-[13px] sm:!text-[14px] leading-relaxed font-sans">
                      {pillar.description}
                    </Text>
                  </div>

                  <div className="w-6 h-[1px] bg-[#C5A059]/40 group-hover:w-16 transition-all duration-1000 mt-8" />
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* 5. FOOTER */}
      <motion.footer
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={scrollRevealVariants}
        className="bg-[#000000] text-[#F5F5DC] py-16 px-6 sm:px-12 border-t border-[#C5A059]/20 z-10"
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-center md:text-left">
            <Heading level={3} className="!text-lg sm:!text-xl tracking-[0.35em] uppercase font-serif !text-[#F5F5DC] m-0">
              The Vault
            </Heading>
            <p className="text-[9px] tracking-[0.25em] uppercase text-[#C5A059] mt-3 font-semibold">
              L'accès est un privilège, la discrétion un devoir.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex space-x-12">
            <a
              href="https://x.com/MGruand90223"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] tracking-[0.25em] uppercase text-[#F5F5DC]/60 hover:text-[#C5A059] transition-colors duration-500 font-medium"
            >
              Twitter / X
            </a>
            <a
              href="https://linkedin.com/in/mael-gruand/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] tracking-[0.25em] uppercase text-[#F5F5DC]/60 hover:text-[#C5A059] transition-colors duration-500 font-medium"
            >
              LinkedIn
            </a>
          </div>

          <div className="text-[9px] tracking-[0.25em] text-[#F5F5DC]/40 uppercase font-medium">
            © 2026 The Vault. Tous droits réservés.
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
