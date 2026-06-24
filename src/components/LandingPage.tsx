'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heading, Text, Button, Divider, Card, Modal, Input, Select } from '@gruand-co/core';

// Translation Dictionary in "Old Money" high-end tone
const translations = {
  FR: {
    philosophy: "Philosophie",
    concept: "Concept",
    login: "Connexion",
    join: "Rejoindre",
    heroTitle: "L'excellence académique a son cercle exclusif.",
    heroSub: "The Vault rassemble les esprits les plus distingués des grandes écoles et universités. Une confrérie moderne accessible uniquement sur cooptation.",
    requestAccess: "Demander l'Accès",
    cooptationProcess: "Processus de cooptation rigoureux",
    philosophyTitle: "Notre Philosophie",
    philosophyHeader: "La pureté de l'alignement.",
    philosophyQuote: "\"Nous croyons que la valeur d'un réseau ne réside pas dans son nombre, mais dans la pureté de son alignement. Notre mission est de préserver un sanctuaire d'échanges intellectuels, de cooptation stricte et de synergie fraternelle pour ceux qui façonneront le monde de demain.\"",
    philosophyBody: "Dans une époque saturée par le bruit et les algorithmes de masse, The Vault propose une alternative souveraine. Un espace confidentiel de haute tenue sociale et intellectuelle où chaque membre est validé manuellement par notre comité d'admission.",
    conceptTitle: "Les Piliers du Temple",
    conceptHeader: "Le Concept",
    pillar1Title: "Le Filtre Souverain",
    pillar1Sub: "SÉLECTION RIGOUREUSE",
    pillar1Desc: "Chaque membre fait l'objet d'une validation rigoureuse de son cursus universitaire d'élite et de son identité, garantissant une cohésion parfaite au sein du cercle.",
    pillar2Title: "L'Esthétique Héritage",
    pillar2Sub: "DISCRÉTION ET SOBRIÉTÉ",
    pillar2Desc: "Absence totale de publicité et d'algorithme d'attention. Une interface épurée pensée comme un salon de correspondance fermé pour des échanges authentiques.",
    pillar3Title: "Le Réseau Précieux",
    pillar3Sub: "CONNEXIONS DE RANG",
    pillar3Desc: "Bénéficiez de mises en relation quotidiennes extrêmement ciblées basées sur des affinités intellectuelles, professionnelles et géographiques précises.",
    pillar4Title: "La Synergie Distincte",
    pillar4Sub: "COLLABORATION SUPÉRIEURE",
    pillar4Desc: "Le Vault est le terreau de fondations industrielles d'envergure, de groupes de recherche d'élite et de cercles d'investissement privés fermés.",
    footerQuote: "L'accès est un privilège, la discrétion un devoir.",
    footerRights: "© 2026 The Vault. Tous droits réservés.",
    modalTitle: "Demande d'Admission",
    modalInstructions: "Veuillez renseigner vos informations officielles. Tout dossier incomplet sera rejeté.",
    labelName: "Nom Complet",
    placeholderName: "Ex. Charles-Henri de Montmorency",
    labelEmail: "E-mail Académique / Professionnel",
    placeholderEmail: "Ex. candidat@polytechnique.edu",
    noteEmail: "Utilisez de préférence votre e-mail académique officiel",
    labelInstitution: "Institution",
    placeholderInstitution: "Ex. HEC Paris",
    labelMajor: "Spécialisation / Major",
    placeholderMajor: "Ex. Data Science & AI",
    labelPromo: "Année de Promotion",
    labelMotivation: "Lettre d'Intention",
    placeholderMotivation: "Exprimez brièvement ce qui motive votre demande et comment votre profil contribuera à l'élévation de notre cercle privé...",
    btnSubmit: "Soumettre le Dossier",
    btnSubmitting: "Transmission du dossier...",
    successTitle: "Demande transmise avec succès",
    successSub: "Votre lettre d'intention et vos références académiques ont été enregistrées avec la plus grande discrétion.",
    successNote: "Le comité d'admission étudiera votre dossier. Un courriel de notification vous sera envoyé si votre parrainage est approuvé.",
    btnClose: "Fermer"
  },
  EN: {
    philosophy: "Philosophy",
    concept: "Concept",
    login: "Sign In",
    join: "Join Us",
    heroTitle: "Academic excellence has its exclusive circle.",
    heroSub: "The Vault gathers the most distinguished minds from elite universities. A modern brotherhood accessible strictly by cooptation.",
    requestAccess: "Request Access",
    cooptationProcess: "Rigorous vetting process",
    philosophyTitle: "Our Philosophy",
    philosophyHeader: "The purity of alignment.",
    philosophyQuote: "\"We believe that the value of a network does not reside in its size, but in the purity of its alignment. Our mission is to preserve a sanctuary of intellectual exchange, strict cooptation, and brotherly synergy for those who will shape tomorrow's world.\"",
    philosophyBody: "In an era saturated by noise and mass algorithms, The Vault offers a sovereign alternative. A confidential space of high social and intellectual standing where every member is manually validated by our admission committee.",
    conceptTitle: "Pillars of the Temple",
    conceptHeader: "The Concept",
    pillar1Title: "The Sovereign Filter",
    pillar1Sub: "RIGOROUS VETTING",
    pillar1Desc: "Every member undergoes rigorous validation of their elite academic background and identity, ensuring perfect cohesion within the circle.",
    pillar2Title: "Heritage Aesthetic",
    pillar2Sub: "DISCRETION & SOBRIETY",
    pillar2Desc: "Complete absence of advertising and attention algorithms. A clean interface designed as a closed correspondence salon for authentic exchanges.",
    pillar3Title: "The Precious Network",
    pillar3Sub: "HIGH-POTENTIAL CONNECTIONS",
    pillar3Desc: "Benefit from highly targeted daily introductions based on precise intellectual, professional, and geographical affinities.",
    pillar4Title: "Distinct Synergy",
    pillar4Sub: "SUPERIOR COLLABORATION",
    pillar4Desc: "The Vault is the breeding ground for major industrial projects, elite research groups, and closed private investment circles.",
    footerQuote: "Access is a privilege, discretion a duty.",
    footerRights: "© 2026 The Vault. All rights reserved.",
    modalTitle: "Application for Admission",
    modalInstructions: "Please fill in your official details. Any incomplete application will be rejected.",
    labelName: "Full Name",
    placeholderName: "Ex. Charles-Henri de Montmorency",
    labelEmail: "Academic / Professional Email",
    placeholderEmail: "Ex. candidate@oxford.edu",
    noteEmail: "Preferably use your official academic email",
    labelInstitution: "Institution",
    placeholderInstitution: "Ex. Harvard University",
    labelMajor: "Field of Study / Major",
    placeholderMajor: "Ex. Data Science & AI",
    labelPromo: "Graduation Year",
    labelMotivation: "Letter of Intent",
    placeholderMotivation: "Briefly express what motivates your application and how your profile will contribute to the elevation of our private circle...",
    btnSubmit: "Submit Application",
    btnSubmitting: "Submitting application...",
    successTitle: "Application successfully submitted",
    successSub: "Your letter of intent and academic credentials have been recorded with the utmost discretion.",
    successNote: "The admissions committee will review your file. A notification email will be sent if your sponsorship is approved.",
    btnClose: "Close"
  },
  ES: {
    philosophy: "Filosofía",
    concept: "Concepto",
    login: "Iniciar Sesión",
    join: "Unirse",
    heroTitle: "La excelencia académica tiene su círculo exclusivo.",
    heroSub: "The Vault reúne a las mentes más distinguidas de las grandes universidades. Una confraternidad moderna accesible únicamente por cooptación.",
    requestAccess: "Solicitar Acceso",
    cooptationProcess: "Proceso de cooptación riguroso",
    philosophyTitle: "Nuestra Filosofía",
    philosophyHeader: "La pureza de la alineación.",
    philosophyQuote: "\"Creemos que el valor de una red no reside en su volumen, sino en la pureza de su alineación. Nuestra misión es preservar un santuario de intercambio intelectual, cooptación estricta y sinergia fraterna para quienes darán forma al mundo del mañana.\"",
    philosophyBody: "En una era saturada de ruido y algoritmos de masas, The Vault ofrece una alternativa soberana. Un espacio confidencial de alto nivel social e intelectual donde cada miembro es validado manualmente por nuestro comité de admisión.",
    conceptTitle: "Los Pilares del Templo",
    conceptHeader: "El Concepto",
    pillar1Title: "El Filtro Soberano",
    pillar1Sub: "SELECCIÓN RIGUROSA",
    pillar1Desc: "Cada miembro se somete a una rigurosa validación de su trayectoria académica de élite y su identidad, garantizando una cohesión perfecta dentro del círculo.",
    pillar2Title: "Estética Heritage",
    pillar2Sub: "DISCRECIÓN Y SOBRIEDAD",
    pillar2Desc: "Ausencia total de publicidad y algoritmos de atención. Una interfaz depurada diseñada como un salón de correspondencia cerrado para intercambios auténticos.",
    pillar3Title: "La Red Valiosa",
    pillar3Sub: "CONEXIONES DE ALTO NIVEL",
    pillar3Desc: "Benefíciese de presentaciones diarias altamente dirigidas basadas en afinidades intelectuales, profesionales y geográficas precisas.",
    pillar4Title: "Sinergia Distinta",
    pillar4Sub: "COLABORACIÓN SUPERIOR",
    pillar4Desc: "The Vault es el terreno fértil para importantes fundaciones industriales, grupos de investigación de élite y círculos cerrados de inversión privada.",
    footerQuote: "El acceso es un privilegio, la discreción un deber.",
    footerRights: "© 2026 The Vault. Todos los derechos reservados.",
    modalTitle: "Solicitud de Admisión",
    modalInstructions: "Por favor complete sus datos oficiales. Cualquier solicitud incompleta será rechazada.",
    labelName: "Nombre Completo",
    placeholderName: "Ej. Charles-Henri de Montmorency",
    labelEmail: "Correo Académico / Profesional",
    placeholderEmail: "Ej. candidato@universidad.edu",
    noteEmail: "Utilice preferentemente su correo académico oficial",
    labelInstitution: "Institución",
    placeholderInstitution: "Ej. Universidad Complutense",
    labelMajor: "Especialidad / Carrera",
    placeholderMajor: "Ej. Finanzas y Derecho",
    labelPromo: "Año de Graduación",
    labelMotivation: "Carta de Intención",
    placeholderMotivation: "Exprese brevemente qué motiva su solicitud y cómo su perfil contribuirá a la elevación de nuestro círculo privado...",
    btnSubmit: "Presentar la Solicitud",
    btnSubmitting: "Transmitiendo solicitud...",
    successTitle: "Solicitud enviada con éxito",
    successSub: "Su carta de intención y credenciales académicas han sido registradas con la mayor discreción.",
    successNote: "El comité de admisiones revisará su expediente. Se le enviará un correo de notificación si se aprueba su patrocinio.",
    btnClose: "Cerrar"
  }
} as const;

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

  // Active language configuration
  const [language, setLanguage] = useState<'FR' | 'EN' | 'ES'>('FR');

  // Translation helper function
  const t = (key: keyof typeof translations['FR']) => {
    return translations[language][key] || translations['FR'][key];
  };

  // Access request form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [motivation, setMotivation] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Custom smooth scroll handler for single page anchors
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      const res = await fetch('/api/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          institution,
          major,
          graduationYear,
          motivation,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitStatus('success');
        // Reset form
        setFullName('');
        setEmail('');
        setInstitution('');
        setMajor('');
        setMotivation('');
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || "Une erreur est survenue lors de l'envoi.");
      }
    } catch (err) {
      console.error('Request submission error:', err);
      setSubmitStatus('error');
      setErrorMessage("Impossible de se connecter au serveur d'admission.");
    } finally {
      setIsSubmitting(false);
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
            {t('philosophy')}
          </button>
          <button
            onClick={() => handleScrollTo('concept')}
            className="text-[11px] tracking-[0.25em] uppercase text-[#000000]/60 hover:text-[#000000] transition-colors duration-500 cursor-pointer font-medium"
          >
            {t('concept')}
          </button>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          {/* Custom Elegant Inline Language Selector */}
          <div className="flex items-center space-x-2 text-[10px] tracking-[0.2em] font-semibold text-[#000000]/40 mr-1 sm:mr-3">
            {(['FR', 'EN', 'ES'] as const).map((lang, index) => (
              <React.Fragment key={lang}>
                <button
                  onClick={() => setLanguage(lang)}
                  className={`hover:text-[#000000] transition-colors duration-500 cursor-pointer ${
                    language === lang ? 'text-[#C5A059] font-extrabold' : ''
                  }`}
                >
                  {lang}
                </button>
                {index < 2 && <span className="opacity-30">•</span>}
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={() => router.push('/login')}
            className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#000000]/70 hover:text-[#000000] transition-colors duration-500 cursor-pointer font-semibold py-2"
          >
            {t('login')}
          </button>
          
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            size="sm"
            className="!border-[#C5A059]/40 hover:!border-[#C5A059] !text-[9px] sm:!text-[10px] tracking-[0.25em] uppercase !text-[#C5A059] bg-transparent hover:!bg-[#C5A059]/5 transition-all duration-700 cursor-pointer"
            style={{
              padding: '10px 18px',
              borderRadius: '0px'
            }}
          >
            {t('join')}
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
              {t('heroTitle')}
            </Heading>
          </motion.div>

          {/* Explanatory subphrase */}
          <motion.div variants={itemVariants} className="max-w-xl mx-auto mt-8">
            <Text variant="lead" className="!text-[#000000]/70 !text-[14px] sm:!text-[16px] leading-relaxed tracking-wide font-sans">
              {t('heroSub')}
            </Text>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="mt-12 flex flex-col items-center space-y-4">
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              size="lg"
              className="!border-[1.5px] !border-[#C5A059] !text-[#000000] bg-transparent hover:!bg-[#C5A059] hover:!text-white transition-all duration-1000 !text-[11px] tracking-[0.3em] uppercase cursor-pointer"
              style={{
                padding: '18px 44px',
                borderRadius: '0px'
              }}
            >
              {t('requestAccess')}
            </Button>
            
            <p className="text-[9px] uppercase tracking-[0.25em] text-[#C5A059] italic mt-2">
              {t('cooptationProcess')}
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
                  {t('philosophyTitle')}
                </span>
                
                <h3 className="text-4xl sm:text-5xl font-serif text-[#000000] leading-none mb-6">
                  {t('philosophyHeader')}
                </h3>
                
                <div className="w-16 h-[2px] bg-[#C5A059] mb-6"></div>
              </div>

              {/* Magazine column copy on the right */}
              <div className="md:col-span-7 space-y-6">
                <Text variant="serif" className="!text-[#000000] !text-lg sm:!text-xl leading-relaxed italic">
                  {t('philosophyQuote')}
                </Text>
                
                <Text className="!text-[#000000]/70 !text-[14px] leading-relaxed tracking-wide font-sans">
                  {t('philosophyBody')}
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
              {t('conceptTitle')}
            </span>
            <Heading level={2} className="!text-3xl sm:!text-4xl !font-serif text-[#000000]">
              {t('conceptHeader')}
            </Heading>
            <div className="w-12 h-[1px] bg-[#C5A059]/40 mx-auto mt-6"></div>
          </motion.div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {[
              {
                title: t('pillar1Title'),
                subtitle: t('pillar1Sub'),
                description: t('pillar1Desc'),
              },
              {
                title: t('pillar2Title'),
                subtitle: t('pillar2Sub'),
                description: t('pillar2Desc'),
              },
              {
                title: t('pillar3Title'),
                subtitle: t('pillar3Sub'),
                description: t('pillar3Desc'),
              },
              {
                title: t('pillar4Title'),
                subtitle: t('pillar4Sub'),
                description: t('pillar4Desc'),
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
              {t('footerQuote')}
            </p>
          </div>

          {/* Social Links */}
          <div className="flex space-x-12">
            <a
              href="https://x.com"
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
            {t('footerRights')}
          </div>
        </div>
      </motion.footer>

      {/* ACCESS REQUEST FORM MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSubmitStatus(null);
        }}
        title={t('modalTitle')}
      >
        <div className="theme-old-money font-sans text-left max-w-lg mx-auto py-2">
          {submitStatus === 'success' ? (
            <div className="text-center py-8 space-y-6">
              <span className="text-[#C5A059] text-3xl font-serif">⚜</span>
              <h3 className="text-xl font-serif text-[#000000] tracking-wide">
                {t('successTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-[#000000]/70 leading-relaxed font-sans max-w-md mx-auto">
                {t('successSub')}
              </p>
              <p className="text-[11px] text-[#C5A059] font-serif italic max-w-md mx-auto">
                {t('successNote')}
              </p>
              <div className="pt-4">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="w-full !border-[#C5A059]/40 hover:!border-[#C5A059] !text-[10px] tracking-[0.2em] uppercase !text-[#C5A059] bg-transparent"
                  style={{ padding: '12px 0', borderRadius: '0px' }}
                >
                  {t('btnClose')}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRequestSubmit} className="space-y-6">
              <p className="text-[10px] text-[#000000]/50 uppercase tracking-widest leading-relaxed border-b border-[#C5A059]/10 pb-4 font-semibold">
                {t('modalInstructions')}
              </p>

              {/* Full Name */}
              <Input
                label={t('labelName')}
                type="text"
                placeholder={t('placeholderName')}
                value={fullName}
                onChange={(e: any) => setFullName(e.target.value)}
                required
                variant="underline"
                style={{ fontSize: '13px', letterSpacing: '0.05em' }}
              />

              {/* Email */}
              <div className="space-y-1">
                <Input
                  label={t('labelEmail')}
                  type="email"
                  placeholder={t('placeholderEmail')}
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  required
                  variant="underline"
                  style={{ fontSize: '13px', letterSpacing: '0.05em' }}
                />
                <span className="block text-[8px] sm:text-[9px] text-[#C5A059]/80 uppercase tracking-wider">
                  {t('noteEmail')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Institution */}
                <Input
                  label={t('labelInstitution')}
                  type="text"
                  placeholder={t('placeholderInstitution')}
                  value={institution}
                  onChange={(e: any) => setInstitution(e.target.value)}
                  required
                  variant="underline"
                  style={{ fontSize: '13px', letterSpacing: '0.05em' }}
                />

                {/* Major */}
                <Input
                  label={t('labelMajor')}
                  type="text"
                  placeholder={t('placeholderMajor')}
                  value={major}
                  onChange={(e: any) => setMajor(e.target.value)}
                  required
                  variant="underline"
                  style={{ fontSize: '13px', letterSpacing: '0.05em' }}
                />
              </div>

              {/* Graduation Year */}
              <Select
                label={t('labelPromo')}
                value={graduationYear}
                onChange={(e: any) => setGraduationYear(e.target.value)}
                required
                options={[
                  { value: '2024', label: '2024' },
                  { value: '2025', label: '2025' },
                  { value: '2026', label: '2026' },
                  { value: '2027', label: '2027' },
                  { value: '2028', label: '2028' },
                  { value: '2029', label: '2029' },
                  { value: '2030', label: '2030' },
                  { value: '2031', label: '2031' },
                  { value: '2032', label: '2032' },
                ]}
                style={{ fontSize: '13px' }}
              />

              {/* Motivation */}
              <div className="flex flex-col gap-1.5">
                <label className="font-serif text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#000000]/60">
                  {t('labelMotivation')}
                </label>
                <textarea
                  placeholder={t('placeholderMotivation')}
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  required
                  rows={4}
                  className="w-full text-xs font-sans p-3 border border-[#C5A059]/30 rounded-none bg-transparent text-[#000000] focus:border-[#C5A059] focus:outline-none placeholder:text-[#000000]/30 resize-none leading-relaxed"
                />
              </div>

              {submitStatus === 'error' && (
                <p className="text-red-700 text-xs italic font-serif">
                  {errorMessage}
                </p>
              )}

              {/* Submit */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="outline"
                  className="w-full !border-[#C5A059] hover:!border-[#C5A059] !text-[#000000] bg-[#C5A059]/5 hover:!bg-[#C5A059] hover:!text-[#F5F5DC] transition-all duration-1000 !text-[11px] tracking-[0.3em] uppercase py-4 cursor-pointer"
                  style={{ borderRadius: '0px', padding: '16px 0' }}
                >
                  {isSubmitting ? t('btnSubmitting') : t('btnSubmit')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}
