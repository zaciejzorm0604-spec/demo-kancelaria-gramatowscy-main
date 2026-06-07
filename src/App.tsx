import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView, type Variants } from 'framer-motion';
import {
  MessageSquare, Phone, Mail, CheckCircle, Clock, Shield,
  DollarSign, Users, ChevronDown, Menu, X, ArrowRight,
  FileText, Calendar, Star, Scale, Home, Banknote, FileSignature,
  Baby, Landmark, Car
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    voiceflow?: { chat?: { open: () => void; close: () => void } };
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GREEN = '#2f8f4e';
const NAVY = '#0f1b33';
const BG = '#f7f7f5';
const TEXT = '#1b1f23';

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: (i as number) * 0.1,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: {
      duration: 0.6,
      delay: (i as number) * 0.1,
      ease: 'easeOut' as const,
    },
  }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useScrollTo(id: string) {
  return () => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
}

// ─── Services data ────────────────────────────────────────────────────────────

const SERVICES = [
  {
    title: 'Rozwody i separacje',
    description: 'Profesjonalna pomoc w sprawach rozwodowych, podział majątku, ustalenie alimentów',
    icon: Scale,
    image: '/[01_rozwody] van-tay-media-Kab_-4M4I74-unsplash.jpg',
  },
  {
    title: 'Kontakty z dziećmi',
    description: 'Ustalenie kontaktów z dzieckiem, władza rodzicielska, miejsce zamieszkania',
    icon: Baby,
    image: '/[02_dzieci] vitaly-gariev-inrYL3ffAsQ-unsplash.jpg',
  },
  {
    title: 'Sprawy spadkowe',
    description: 'Spadki, zachowek, dział spadku, odrzucenie spadku, stwierdzenie nabycia spadku',
    icon: Landmark,
    image: '/[03_spadkowe] towfiqu-barbhuiya-joqWSI9u_XM-unsplash.jpg',
  },
  {
    title: 'Nieruchomości',
    description: 'Wnioski wieczystoksięgowe, umowy kupna-sprzedaży, służebności, zasiedzenie',
    icon: Home,
    image: '/[05_nieruchomosci] ronnie-george-z11gbBo13ro-unsplash.jpg',
  },
  {
    title: 'Podział majątku',
    description: 'Podział majątku wspólnego małżonków, ugody majątkowe, wycena majątku, ustalenie udziałów',
    icon: Banknote,
    image: '/[06_podzial majatku] supannee-u-prapruit-hn6k00wZxr8-unsplash.jpg',
  },
  {
    title: 'Odszkodowania',
    description: 'Wypadki, szkody komunikacyjne, zadośćuczynienia',
    icon: Car,
    image: '/[07_odszkodowania] northfolk-Ok76F6yW2iA-unsplash_v2.jpg',
  },
  {
    title: 'Umowy',
    description: 'Przygotowanie i weryfikacja umów cywilnoprawnych, analiza zapisów umownych',
    icon: FileSignature,
    image: '/[08_umowy] sebastian-herrmann-n4_Q2dDYy80-unsplash_v2.jpg',
  },
  {
    title: 'Spory sąsiedzkie',
    description: 'Konflikty z sąsiadami, naruszenie posiadania, granice nieruchomości',
    icon: Users,
    image: '/[09_spory sasiedzkie] j-king-ebuixpviQH0-unsplash.jpg',
  },
  {
    title: 'Windykacja i długi',
    description: 'Skuteczne dochodzenie należności, pozwy o zapłatę, postępowania egzekucyjne',
    icon: DollarSign,
    image: '/[04_windykacja] emil-kalibradov-K05Udh2LhFA-unsplash_v2.jpg',
  },
];

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    question: 'Jak szybko otrzymam odpowiedź na moje pytanie prawne?',
    answer: 'W przypadku wykupienia konsultacji prawnej online nasz asystent kontaktuje się w ciągu 24 h (lub w najbliższy dzień roboczy), aby umówić dokładną datę rozmowy z prawnikiem. Wyznaczamy najszybszy możliwy termin konsultacji. W naszej Kancelarii pracuje zespół adwokatów i radców prawnych, dzięki czemu możemy sprawnie działać i oferować krótki czas oczekiwania.',
  },
  {
    question: 'Czy moje dane są bezpieczne?',
    answer: 'Tak, gwarantujemy pełną poufność. Wszystkie dane są szyfrowane, a komunikacja odbywa się przez bezpieczne kanały. Przestrzegamy tajemnicy zawodowej zgodnie z przepisami prawa.',
  },
  {
    question: 'Jakie sprawy obsługujecie?',
    answer: 'Specjalizujemy się w sprawach osób fizycznych: rozwody, kontakty z dziećmi, spadki, zachowek, windykacja, sprawy nieruchomości, odszkodowania, umowy cywilnoprawne i wiele innych.',
  },
  {
    question: 'Ile kosztuje porada prawna?',
    answer: 'Koszt usługi zależy od zakresu sprawy. Sprawy, które nie są czasochłonne ani skomplikowane, może udać się rozwiązać nawet w trakcie krótkiej konsultacji z prawnikiem, którą oferujemy w przystępnej cenie. Dla spraw, które są bardziej czasochłonne, przedstawiamy zawsze przejrzystą wycenę przed rozpoczęciem działań.',
  },
  {
    question: 'Czy mogę skorzystać z porady prawnej z dowolnego miejsca w Polsce?',
    answer: 'Tak, nasze usługi online są dostępne dla klientów z całej Polski. Nie musisz przyjeżdżać do naszego biura - wszystko załatwisz zdalnie.',
  },
  {
    question: 'Jak wygląda proces współpracy?',
    answer: 'Nasz prawnik analizuje sytuację i przedstawia możliwe rozwiązania - dzięki temu, wiesz już, co dalej robić. Jeśli sprawa jest bardziej skomplikowana i wymaga dłuższej współpracy, działamy zgodnie z ustalonym planem i informujemy Cię na każdym etapie o postępach lub zmianach, jesteśmy też dostępni w przypadku dodatkowych pytań.',
  },
];

// ─── Section: Hero ────────────────────────────────────────────────────────────

function HeroSection({ onCTAClick }: { onCTAClick: () => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section
      ref={ref}
      className="relative pt-14 overflow-hidden"
      style={{ background: BG }}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-8 lg:gap-10 items-center">
          {/* Left – text */}
          <motion.div
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="flex flex-col lg:max-w-[460px]"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: GREEN }}
            >
              Kancelaria Prawna Gramatowscy
            </motion.p>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold mb-4 leading-[1.05] tracking-[-0.03em]"
              style={{ color: TEXT }}
            >
              Profesjonalne wsparcie prawne{' '}
              <span style={{ color: GREEN }}>zaczyna się od zrozumienia</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-sm leading-relaxed mb-2"
              style={{ color: TEXT, opacity: 0.6 }}
            >
              — widzimy przede wszystkim człowieka i jego historię...
            </motion.p>

            <motion.p
              variants={fadeUp}
              custom={3}
              className="text-sm leading-relaxed mb-7"
              style={{ color: TEXT, opacity: 0.65 }}
            >
              Rozumiemy, że za każdą sprawą stoją emocje i ważne życiowe decyzje. Nasi adwokaci i radcy prawni angażują się i szukają najlepszych rozwiązań z pełnym zrozumieniem Twoich potrzeb.
            </motion.p>

            <motion.button
              variants={fadeUp}
              custom={4}
              onClick={onCTAClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="self-start inline-flex items-center gap-2.5 text-white px-7 py-3.5 text-sm font-semibold transition-all duration-200"
              style={{
                background: GREEN,
                borderRadius: '24px',
                boxShadow: `0 12px 32px ${GREEN}40`,
              }}
            >
              Przedstaw swoją sprawę
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.div>

          {/* Right – image */}
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
            style={{ borderRadius: '28px', overflow: 'hidden', height: '480px' }}
          >
            <img
              src="/[05_nieruchomosci] ronnie-george-z11gbBo13ro-unsplash.jpg"
              alt="Kancelaria Gramatowscy"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.25) 100%)' }}
            />
            {/* Subtle floating benefit card */}
            <div
              className="absolute bottom-5 left-5 right-5 p-3"
              style={{
                background: 'rgba(255,255,255,0.92)',
                borderRadius: '14px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                  style={{ background: `${GREEN}15`, borderRadius: '10px' }}
                >
                  <Shield className="h-4 w-4" style={{ color: GREEN }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: TEXT }}>Pełna poufność</p>
                  <p className="text-xs" style={{ color: TEXT, opacity: 0.55 }}>Tajemnica zawodowa adwokata i radcy prawnego</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Quick Consultation ──────────────────────────────────────────────

function QuickConsultationSection({ onScrollToProcess }: { onScrollToProcess: () => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section ref={ref} className="py-8 lg:py-12 overflow-hidden" style={{ background: '#fff' }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-0 lg:gap-0 items-stretch">
          {/* Left – image */}
          <motion.div
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={fadeIn}
            custom={0}
            className="relative overflow-hidden order-2 lg:order-1"
            style={{ borderRadius: '24px 0 0 24px', minHeight: '340px' }}
          >
            <img
              src="/[08_umowy] sebastian-herrmann-n4_Q2dDYy80-unsplash_v2.jpg"
              alt="Konsultacja prawna online"
              className="w-full h-full object-cover absolute inset-0"
              loading="lazy"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, transparent 40%, rgba(0,0,0,0.15) 100%)' }} />
          </motion.div>

          {/* Right – card overlapping image visually */}
          <motion.div
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="flex flex-col order-1 lg:order-2"
          >
            <div
              className="bg-white flex flex-col justify-between h-full p-7"
              style={{
                borderRadius: '0 24px 24px 0',
                border: `1.5px solid ${GREEN}30`,
                borderLeft: 'none',
                boxShadow: '-8px 0 32px rgba(0,0,0,.06)',
              }}
            >
              <div>
                <motion.p
                  variants={fadeUp}
                  custom={0}
                  className="text-xs font-semibold tracking-widest uppercase mb-3"
                  style={{ color: GREEN }}
                >
                  Online
                </motion.p>

                <motion.h2
                  variants={fadeUp}
                  custom={1}
                  className="text-2xl sm:text-3xl font-bold mb-4 leading-[1.05] tracking-[-0.03em]"
                  style={{ color: TEXT }}
                >
                  <span style={{ color: GREEN }}>Szybka konsultacja</span><br />
                  z prawnikiem
                </motion.h2>

                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="text-sm leading-relaxed mb-5"
                  style={{ color: TEXT, opacity: 0.65 }}
                >
                  Nie każda sprawa wymaga natychmiastowej wizyty w kancelarii. Czasem wystarczy szybka konsultacja, aby odzyskać spokój, poznać możliwości i podjąć właściwe decyzje. Stworzyliśmy nowoczesny sposób kontaktu z prawnikiem — prosty, wygodny i dostępny <strong style={{ color: TEXT }}>ONLINE</strong>.
                </motion.p>

                <motion.button
                  variants={fadeUp}
                  custom={3}
                  onClick={onScrollToProcess}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 transition-all duration-200 mb-5"
                  style={{
                    border: `1.5px solid ${GREEN}`,
                    color: GREEN,
                    borderRadius: '20px',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = GREEN;
                    (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = GREEN;
                  }}
                >
                  Sprawdź, jak działamy
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Benefits */}
              <motion.div
                variants={fadeUp}
                custom={4}
                className="grid grid-cols-2 gap-3 pt-4"
                style={{ borderTop: '1px solid #f0f0ee' }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                    style={{ background: `${GREEN}15`, borderRadius: '10px' }}
                  >
                    <Users className="h-4 w-4" style={{ color: GREEN }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: TEXT }}>Doświadczenie</p>
                    <p className="text-xs mt-0.5" style={{ color: TEXT, opacity: 0.55 }}>20 lat praktyki i ponad 25000 udzielonych porad</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                    style={{ background: `${GREEN}15`, borderRadius: '10px' }}
                  >
                    <Clock className="h-4 w-4" style={{ color: GREEN }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: TEXT }}>Sprawne działanie</p>
                    <p className="text-xs mt-0.5" style={{ color: TEXT, opacity: 0.55 }}>Szybki kontakt. Analiza problemu i warianty możliwych rozwiązań</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: How It Works (schodkowy) ────────────────────────────────────────

function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  const steps = [
    {
      number: '1',
      title: 'Zamów konsultację',
      description: 'Poprzez formularz lub czat zamów i opłać konsultację prawną.',
      icon: FileText,
      align: 'left',
    },
    {
      number: '2',
      title: 'Wybierz termin konsultacji',
      description: 'Nasz asystent skontaktuje się z Tobą i ustali dogodny termin rozmowy.',
      icon: Calendar,
      align: 'right',
    },
    {
      number: '3',
      title: 'Otrzymaj odpowiedź',
      description: 'Prawnik przeanalizuje sprawę i przedstawi możliwe rozwiązania.',
      icon: CheckCircle,
      align: 'left',
    },
  ];

  return (
    <section id="jak-dziala" ref={ref} className="py-8 lg:py-12 overflow-hidden" style={{ background: BG }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-8 lg:mb-10"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: GREEN }}
          >
            Proces
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl sm:text-4xl font-bold mb-2 leading-[1.05] tracking-[-0.03em]"
            style={{ color: TEXT }}
          >
            Jak działa nasza{' '}
            <span style={{ color: GREEN }}>pomoc prawna?</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-sm"
            style={{ color: TEXT, opacity: 0.6 }}
          >
            Trzy proste kroki do rozwiązania Twojego problemu
          </motion.p>
        </motion.div>

        {/* Steps – true staircase layout (desktop) */}
        <div className="relative">
          {/* Vertical connecting line on desktop */}
          <div
            className="absolute hidden lg:block"
            style={{
              top: '40px',
              bottom: '40px',
              left: '50%',
              width: '2px',
              background: `linear-gradient(180deg, ${GREEN}80, ${GREEN}40, ${GREEN}80)`,
              transform: 'translateX(-50%)',
              zIndex: 0,
            }}
          />

          {/* Mobile: simple stack */}
          <div className="flex flex-col gap-4 lg:hidden">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                  variants={fadeUp}
                  custom={index * 0.15 + 0.2}
                >
                  <div
                    className="bg-white p-5 flex items-start gap-4"
                    style={{
                      borderRadius: '20px',
                      border: `1.5px solid ${GREEN}30`,
                      boxShadow: '0 4px 20px rgba(0,0,0,.06)',
                    }}
                  >
                    <div
                      className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-white font-bold text-base"
                      style={{ background: GREEN, borderRadius: '50%', boxShadow: `0 4px 16px ${GREEN}40` }}
                    >
                      {step.number}
                    </div>
                    <div>
                      <h3 className="font-bold text-base mb-1" style={{ color: TEXT }}>{step.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: TEXT, opacity: 0.6 }}>{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop: staircase */}
          <div className="hidden lg:block relative z-10" style={{ minHeight: '320px' }}>
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isRight = step.align === 'right';
              return (
                <motion.div
                  key={index}
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                  variants={fadeUp}
                  custom={index * 0.2 + 0.2}
                  style={{
                    marginTop: index === 0 ? 0 : '28px',
                    display: 'flex',
                    justifyContent: isRight ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    className="bg-white p-5 flex items-start gap-4"
                    style={{
                      borderRadius: '20px',
                      border: `1.5px solid ${GREEN}30`,
                      boxShadow: '0 8px 28px rgba(0,0,0,.07)',
                      width: '48%',
                    }}
                  >
                    <div
                      className="w-11 h-11 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
                      style={{ background: GREEN, borderRadius: '50%', boxShadow: `0 6px 20px ${GREEN}40` }}
                    >
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className="h-4 w-4" style={{ color: GREEN }} />
                        <h3 className="font-bold text-base" style={{ color: TEXT }}>{step.title}</h3>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: TEXT, opacity: 0.6 }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Form ────────────────────────────────────────────────────────────

interface FormSectionProps {
  contactMethod: 'form' | 'chat' | 'voice';
  setContactMethod: (m: 'form' | 'chat' | 'voice') => void;
  formData: {
    name: string; email: string; phone: string; message: string;
    clientType: string; companyName: string; nip: string; address: string;
  };
  setFormData: (d: any) => void;
  consent: boolean;
  setConsent: (v: boolean) => void;
  isSubmitting: boolean;
  webhookResponse: { message: string; checkout_url?: string } | null;
  setWebhookResponse: (r: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  openVoiceflowChat: () => void;
}

function FormSection({
  contactMethod, setContactMethod, formData, setFormData,
  consent, setConsent, isSubmitting, webhookResponse,
  setWebhookResponse, handleSubmit, openVoiceflowChat,
}: FormSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.05 });

  const specializations = [
    'Sprawy rodzinne',
    'Spadkowe',
    'Podział majątku',
    'Odszkodowania',
    'Nieruchomości',
    'Alimenty',
  ];

  const inputClass = `w-full px-4 py-3 text-sm transition-all duration-200 outline-none focus:ring-2`;
  const inputStyle = {
    border: '1.5px solid #e4e4e2',
    borderRadius: '12px',
    background: '#fafaf8',
    color: TEXT,
  };

  return (
    <section id="kontakt-formularz" ref={ref} className="py-8 lg:py-12" style={{ background: '#fff' }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left column */}
          <motion.div
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: GREEN }}
            >
              Kontakt
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold mb-4 leading-[1.05] tracking-[-0.03em]"
              style={{ color: TEXT }}
            >
              Profesjonalna pomoc prawna{' '}
              <span style={{ color: GREEN }}>online</span>{' '}
              dla osób fizycznych
            </motion.h2>

            {/* Specializations list */}
            <motion.div variants={fadeUp} custom={2} className="mb-5">
              <p className="text-sm font-semibold mb-3" style={{ color: TEXT, opacity: 0.5 }}>Obsługujemy m.in.:</p>
              <div className="flex flex-wrap gap-2">
                {specializations.map((s, i) => (
                  <span
                    key={i}
                    className="text-sm px-3 py-1.5 font-medium"
                    style={{
                      background: `${GREEN}12`,
                      color: GREEN,
                      borderRadius: '20px',
                      border: `1px solid ${GREEN}25`,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} custom={3} className="grid grid-cols-3 gap-3 mb-5">
              {[
                { value: '20', label: 'lat doświadczenia' },
                { value: '25 000+', label: 'udzielonych porad' },
                { value: '99%', label: 'pozytywnych opinii' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-4 text-center"
                  style={{
                    background: BG,
                    borderRadius: '16px',
                    border: `1px solid ${GREEN}20`,
                  }}
                >
                  <div className="text-xl font-bold mb-0.5" style={{ color: GREEN }}>{stat.value}</div>
                  <div className="text-[11px] leading-tight" style={{ color: TEXT, opacity: 0.5 }}>{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Contact method tabs */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="flex gap-0 overflow-hidden"
              style={{ borderRadius: '16px', border: `1.5px solid ${GREEN}30` }}
            >
              <button
                onClick={() => setContactMethod('form')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 font-medium text-sm transition-all duration-200"
                style={{
                  background: contactMethod === 'form' ? GREEN : 'transparent',
                  color: contactMethod === 'form' ? '#fff' : GREEN,
                }}
              >
                <Mail className="h-3.5 w-3.5" /> Formularz
              </button>
              <button
                onClick={() => setContactMethod('chat')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 font-medium text-sm transition-all duration-200"
                style={{
                  background: contactMethod === 'chat' ? GREEN : 'transparent',
                  color: contactMethod === 'chat' ? '#fff' : GREEN,
                  borderLeft: `1px solid ${GREEN}30`,
                }}
              >
                <MessageSquare className="h-3.5 w-3.5" /> Chat
              </button>
              <button
                onClick={() => setContactMethod('voice')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 font-medium text-sm transition-all duration-200"
                style={{
                  background: contactMethod === 'voice' ? GREEN : 'transparent',
                  color: contactMethod === 'voice' ? '#fff' : GREEN,
                  borderLeft: `1px solid ${GREEN}30`,
                }}
              >
                <Phone className="h-3.5 w-3.5" /> Telefon
              </button>
            </motion.div>
          </motion.div>

          {/* Right column – form card */}
          <motion.div
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={fadeUp}
            custom={1}
          >
            <div
              className="bg-white p-7"
              style={{
                borderRadius: '28px',
                border: `2px solid ${GREEN}`,
                boxShadow: '0 12px 40px rgba(0,0,0,.06)',
              }}
            >
              {contactMethod === 'form' && (
                <>
                  {!webhookResponse ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <h3 className="text-xl font-bold mb-4" style={{ color: TEXT, letterSpacing: '-0.02em' }}>Opisz swoją sprawę</h3>

                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT, opacity: 0.7 }}>Typ klienta</label>
                        <select
                          value={formData.clientType}
                          onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                          className={inputClass}
                          style={{ ...inputStyle, focusRingColor: GREEN } as any}
                          required
                        >
                          <option value="individual">Klient indywidualny</option>
                          <option value="business">Klient firmowy</option>
                        </select>
                      </div>

                      {formData.clientType === 'business' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT, opacity: 0.7 }}>Nazwa firmy</label>
                            <input type="text" value={formData.companyName}
                              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                              className={inputClass} style={inputStyle} required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT, opacity: 0.7 }}>NIP</label>
                            <input type="text" value={formData.nip}
                              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                              className={inputClass} style={inputStyle} required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT, opacity: 0.7 }}>Adres</label>
                            <input type="text" value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              className={inputClass} style={inputStyle} required />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT, opacity: 0.7 }}>Imię i nazwisko</label>
                        <input type="text" value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={inputClass} style={inputStyle} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT, opacity: 0.7 }}>Email</label>
                        <input type="email" value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={inputClass} style={inputStyle} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT, opacity: 0.7 }}>Telefon</label>
                        <input type="tel" value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={inputClass} style={inputStyle} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT, opacity: 0.7 }}>Opis sprawy</label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={4}
                          className={`${inputClass} resize-none`}
                          style={inputStyle}
                          placeholder="Opisz swoją sytuację prawną..."
                          required
                        />
                      </div>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="consent"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          className="mt-0.5 h-4 w-4 border-gray-300 rounded"
                          style={{ accentColor: GREEN }}
                          required
                        />
                        <label htmlFor="consent" className="text-xs leading-relaxed" style={{ color: TEXT, opacity: 0.5 }}>
                          Wyrażam zgodę na przetwarzanie przez Kancelarię Prawną Gramatowscy moich danych osobowych w celach związanych z udzieleniem pomocy prawnej.{' '}
                          <a href="https://gramatowscy.pl/dla-klienta/rodo-klauzula-informacyjna-dla-klientow-kancelarii" target="_blank" rel="noopener noreferrer" style={{ color: GREEN }} className="hover:underline">
                            Polityka prywatności
                          </a>.
                        </label>
                      </div>
                      <button
                        type="submit"
                        disabled={!consent || isSubmitting}
                        className="w-full text-white py-3.5 font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          background: GREEN,
                          borderRadius: '16px',
                          boxShadow: `0 8px 24px ${GREEN}35`,
                        }}
                      >
                        {isSubmitting ? 'Wysyłanie...' : 'Wyślij zapytanie'}
                      </button>
                      <p className="text-xs text-center" style={{ color: TEXT, opacity: 0.4 }}>
                        Odpowiedź w ciągu 24 godzin. Gwarantujemy poufność.
                      </p>
                    </form>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-14 w-14 mx-auto mb-4" style={{ color: GREEN }} />
                      <h3 className="text-xl font-bold mb-2" style={{ color: TEXT }}>Dziękujemy za kontakt!</h3>
                      <div className="text-sm leading-relaxed mb-5" style={{ color: TEXT, opacity: 0.6 }}>
                        {webhookResponse.message}
                      </div>
                      {webhookResponse.checkout_url && (
                        <a
                          href={webhookResponse.checkout_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-white px-6 py-3 font-semibold text-sm mb-3"
                          style={{ background: GREEN, borderRadius: '14px' }}
                        >
                          Opłać konsultację
                        </a>
                      )}
                      <button
                        onClick={() => setWebhookResponse(null)}
                        className="block w-full mt-2 text-sm transition"
                        style={{ color: TEXT, opacity: 0.4 }}
                      >
                        Wyślij kolejne zapytanie
                      </button>
                    </div>
                  )}
                </>
              )}

              {contactMethod === 'chat' && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" style={{ color: GREEN }} />
                  <h3 className="text-xl font-bold mb-2" style={{ color: TEXT }}>Chat z Kancelarią</h3>
                  <p className="text-sm mb-5" style={{ color: TEXT, opacity: 0.6 }}>
                    Potrzebujesz pomocy online? Sprawdź, jak możemy Ci pomóc. Umów konsultację.
                  </p>
                  <button
                    onClick={openVoiceflowChat}
                    className="text-white px-6 py-3 font-semibold text-sm"
                    style={{ background: GREEN, borderRadius: '14px' }}
                  >
                    Rozpocznij chat
                  </button>
                </div>
              )}

              {contactMethod === 'voice' && (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 mx-auto mb-4" style={{ color: GREEN }} />
                  <h3 className="text-xl font-bold mb-2" style={{ color: TEXT }}>Rozmowa przez telefon</h3>
                  <p className="text-sm mb-5" style={{ color: TEXT, opacity: 0.6 }}>
                    Preferujesz rozmowę telefoniczną? Zadzwoń lub umów się na konsultację.
                  </p>
                  <a
                    href="tel:+48573133556"
                    className="inline-block text-white px-6 py-3 font-semibold text-sm"
                    style={{ background: GREEN, borderRadius: '14px' }}
                  >
                    +48 573 133 556
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Specializations (alternating image + card) ─────────────────────

function SpecializationsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.05 });

  // Show first 6 services as alternating pairs
  const featured = SERVICES.slice(0, 6);

  return (
    <section id="uslugi" ref={ref} className="py-8 lg:py-12 overflow-hidden" style={{ background: BG }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-8"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: GREEN }}
          >
            Zakres
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl sm:text-4xl font-bold mb-2 leading-[1.05] tracking-[-0.03em]"
            style={{ color: TEXT }}
          >
            Nasze <span style={{ color: GREEN }}>specjalizacje</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-sm"
            style={{ color: TEXT, opacity: 0.6 }}
          >
            Kompleksowa obsługa prawna dla osób fizycznych
          </motion.p>
        </motion.div>

        {/* Alternating pairs – clean grid, no masonry */}
        <div className="space-y-4">
          {featured.map((service, index) => {
            const Icon = service.icon;
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={index}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                variants={fadeUp}
                custom={index * 0.08}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch"
              >
                {/* Image – left on even, right on odd */}
                <div
                  className={`relative overflow-hidden ${!isEven ? 'lg:order-2' : 'lg:order-1'}`}
                  style={{ borderRadius: '20px', height: '220px' }}
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.3) 100%)' }}
                  />
                  <div className="absolute bottom-4 left-4">
                    <span
                      className="text-white text-xs font-semibold px-3 py-1"
                      style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '20px', backdropFilter: 'blur(4px)' }}
                    >
                      {service.title}
                    </span>
                  </div>
                </div>

                {/* Card */}
                <div
                  className={`bg-white p-6 flex flex-col justify-center ${!isEven ? 'lg:order-1' : 'lg:order-2'}`}
                  style={{
                    borderRadius: '20px',
                    border: `1.5px solid ${GREEN}20`,
                    boxShadow: '0 4px 16px rgba(0,0,0,.04)',
                  }}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center mb-3"
                    style={{ background: `${GREEN}15`, borderRadius: '12px' }}
                  >
                    <Icon className="h-5 w-5" style={{ color: GREEN }} />
                  </div>
                  <h3
                    className="font-bold text-lg mb-2"
                    style={{ color: TEXT, letterSpacing: '-0.02em' }}
                  >
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT, opacity: 0.6 }}>
                    {service.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Remaining services as small tiles – 3 columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {SERVICES.slice(6).map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                variants={fadeUp}
                custom={(index + 6) * 0.06}
                className="bg-white p-5"
                style={{
                  borderRadius: '16px',
                  border: `1.5px solid ${GREEN}20`,
                  boxShadow: '0 2px 12px rgba(0,0,0,.04)',
                }}
              >
                <div
                  className="w-9 h-9 flex items-center justify-center mb-3"
                  style={{ background: `${GREEN}15`, borderRadius: '10px' }}
                >
                  <Icon className="h-4 w-4" style={{ color: GREEN }} />
                </div>
                <h3
                  className="font-bold text-sm mb-1"
                  style={{ color: TEXT, letterSpacing: '-0.01em' }}
                >
                  {service.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: TEXT, opacity: 0.6 }}>
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Why Trust Us ────────────────────────────────────────────────────

function WhyTrustUsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  const reasons = [
    {
      icon: Clock,
      title: 'Ponad 20 lat doświadczenia',
      description: 'Nasi prawnicy posiadają wieloletnie doświadczenie w prowadzeniu spraw dla osób fizycznych.',
    },
    {
      icon: Shield,
      title: 'Pełna poufność',
      description: 'Tajemnica zawodowa adwokata i radcy prawnego gwarantuje bezpieczeństwo Twoich danych.',
    },
    {
      icon: Users,
      title: 'Indywidualne podejście',
      description: 'Każdą sprawę traktujemy wyjątkowo, dostosowując strategię do Twoich potrzeb.',
    },
    {
      icon: Star,
      title: '99% pozytywnych opinii',
      description: 'Tysiące zadowolonych klientów polecają nasze usługi swoim bliskim.',
    },
  ];

  return (
    <section ref={ref} className="py-8 lg:py-12 overflow-hidden" style={{ background: '#fff' }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-8"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: GREEN }}
          >
            Dlaczego my?
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl sm:text-4xl font-bold leading-[1.05] tracking-[-0.03em]"
            style={{ color: TEXT }}
          >
            Dlaczego warto{' '}
            <span style={{ color: GREEN }}>nam zaufać?</span>
          </motion.h2>
        </motion.div>

        {/* Layout: image left, benefits grid right */}
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-8 lg:gap-10 items-start">
          {/* Left – image, light treatment */}
          <motion.div
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={fadeIn}
            custom={0}
            className="relative"
            style={{ borderRadius: '24px', overflow: 'hidden', height: '380px' }}
          >
            <img
              src="/[08_umowy] sebastian-herrmann-n4_Q2dDYy80-unsplash_v2.jpg"
              alt="Kancelaria Gramatowscy - biuro"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(160deg, transparent 60%, rgba(0,0,0,0.1) 100%)' }}
            />
          </motion.div>

          {/* Right – benefits grid */}
          <motion.div
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  custom={index * 0.12}
                  className="flex items-start gap-4 p-5"
                  style={{
                    background: BG,
                    borderRadius: '18px',
                    border: `1px solid ${GREEN}15`,
                  }}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                    style={{ background: `${GREEN}20`, borderRadius: '12px' }}
                  >
                    <Icon className="h-5 w-5" style={{ color: GREEN }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1" style={{ color: TEXT }}>{reason.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: TEXT, opacity: 0.6 }}>{reason.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Stats ───────────────────────────────────────────────────────────

function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const stats = [
    { value: '20', unit: 'lat', label: 'doświadczenia na rynku' },
    { value: '25 000', unit: '+', label: 'udzielonych porad prawnych' },
    { value: '99', unit: '%', label: 'pozytywnych opinii klientów' },
    { value: '3', unit: 'dni', label: 'średni czas reakcji' },
  ];

  return (
    <section ref={ref} className="py-10 lg:py-14" style={{ background: GREEN }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              variants={fadeUp}
              custom={index * 0.1}
              className="text-center"
            >
              <div className="text-3xl lg:text-4xl font-bold mb-1 text-white">
                {stat.value}<span className="text-2xl">{stat.unit}</span>
              </div>
              <div className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: FAQ ─────────────────────────────────────────────────────────────

function FAQSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" ref={ref} className="py-8 lg:py-12" style={{ background: BG }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered header */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-8"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: GREEN }}
          >
            FAQ
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl sm:text-4xl font-bold mb-3 leading-[1.05] tracking-[-0.03em]"
            style={{ color: TEXT }}
          >
            Najczęściej zadawane{' '}
            <span style={{ color: GREEN }}>pytania</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-sm leading-relaxed"
            style={{ color: TEXT, opacity: 0.6 }}
          >
            Nie znalazłeś odpowiedzi? Skontaktuj się z nami bezpośrednio.
          </motion.p>
        </motion.div>

        {/* Accordion – centered, max width */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="space-y-3 max-w-[760px] mx-auto"
        >
          {FAQS.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              custom={index * 0.08}
              className="overflow-hidden"
              style={{
                background: '#fff',
                borderRadius: '18px',
                border: `1.5px solid ${openIndex === index ? GREEN + '50' : '#eeecea'}`,
              }}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-sm pr-4" style={{ color: TEXT }}>{faq.question}</span>
                <ChevronDown
                  className="h-4 w-4 flex-shrink-0 transition-transform duration-300"
                  style={{
                    color: GREEN,
                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: TEXT, opacity: 0.65 }}>
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Section: CTA Banner (full-width green przed footerem) ───────────────────

function CTABannerSection({ onScrollToForm }: { onScrollToForm: () => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      className="py-12 lg:py-16 overflow-hidden relative"
      style={{ background: `linear-gradient(135deg, #1e6e38 0%, ${GREEN} 50%, #3aaa62 100%)` }}
    >
      {/* Background decorative circles */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      />
      <div
        className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-xs font-semibold tracking-widest uppercase mb-4 text-white/70"
          >
            Zaufaj ekspertom
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={0.1}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white leading-[1.05] tracking-[-0.03em]"
          >
            Potrzebujesz pomocy prawnej?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.2}
            className="text-base lg:text-lg text-white/80 mb-8 max-w-xl mx-auto leading-relaxed"
          >
            Nie czekaj. Skontaktuj się z nami już dziś i zyskaj pewność, że Twoja sprawa jest w dobrych rękach.
          </motion.p>
          <motion.div
            variants={fadeUp}
            custom={0.3}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <button
              onClick={onScrollToForm}
              className="inline-flex items-center justify-center gap-2.5 text-white px-8 py-4 text-sm font-semibold transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '24px',
                border: '2px solid rgba(255,255,255,0.4)',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)';
              }}
            >
              <Mail className="h-4 w-4" />
              Formularz
            </button>
            <a
              href="tel:+48573133556"
              className="inline-flex items-center justify-center gap-2.5 text-green-900 px-8 py-4 text-sm font-bold transition-all duration-200"
              style={{
                background: '#fff',
                borderRadius: '24px',
              }}
            >
              <Phone className="h-4 w-4" />
              +48 573 133 556
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { href: '#uslugi', label: 'Usługi' },
    { href: '#jak-dziala', label: 'Jak to działa' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(247,247,245,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src="/logo.svg" alt="Kancelaria Gramatowscy" className="h-8" />
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors duration-200 hover:opacity-70"
                style={{ color: TEXT }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+48573133556"
              className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: TEXT }}
            >
              <Phone className="h-3.5 w-3.5" style={{ color: GREEN }} />
              +48 573 133 556
            </a>
            <a
              href="#kontakt-formularz"
              className="text-white px-5 py-2 text-sm font-semibold transition-all duration-200"
              style={{
                background: GREEN,
                borderRadius: '20px',
                boxShadow: `0 4px 16px ${GREEN}35`,
              }}
            >
              Kontakt
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" style={{ color: TEXT }} />
            ) : (
              <Menu className="h-5 w-5" style={{ color: TEXT }} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden"
            style={{
              background: 'rgba(247,247,245,0.98)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <div className="max-w-[1200px] mx-auto px-4 py-3 space-y-1">
              {[
                { href: '#uslugi', label: 'Usługi' },
                { href: '#jak-dziala', label: 'Jak to działa' },
                { href: '#faq', label: 'FAQ' },
              ].map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 px-3 text-sm font-medium transition rounded-xl hover:bg-gray-50"
                  style={{ color: TEXT }}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#kontakt-formularz"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white px-4 py-3 text-center text-sm font-semibold mt-2"
                style={{ background: GREEN, borderRadius: '16px' }}
              >
                Kontakt
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── Sticky Chat Icon ─────────────────────────────────────────────────────────

function StickyCTA({ onClick }: { onClick: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Right side tab */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              zIndex: 40,
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <button
              onClick={onClick}
              title="Zapytaj prawnika"
              style={{
                pointerEvents: 'auto',
                background: GREEN,
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                padding: '20px 12px',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '0 12px 12px 0',
                boxShadow: `-4px 0 20px ${GREEN}55`,
              }}
            >
              Przedstaw swoją sprawę
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-10 lg:py-12" style={{ background: NAVY }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo + desc */}
          <div className="lg:col-span-2">
            <img src="/logo_biale_eKancelaria.svg" alt="Kancelaria Gramatowscy" className="h-10 mb-4" />
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Profesjonalna pomoc prawna online dla osób fizycznych. Adwokaci i radcy prawni z ponad 20-letnim doświadczeniem.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white">Usługi</h4>
            <ul className="space-y-2">
              {['Rozwody i separacje', 'Sprawy spadkowe', 'Nieruchomości', 'Odszkodowania'].map(item => (
                <li key={item}>
                  <a href="#uslugi" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.55)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white">Kontakt</h4>
            <ul className="space-y-3">
              <li>
                <a href="tel:+48573133556" className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <Phone className="h-3.5 w-3.5" style={{ color: GREEN }} />
                  +48 573 133 556
                </a>
              </li>
              <li>
                <a href="mailto:kontakt@gramatowscy.pl" className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <Mail className="h-3.5 w-3.5" style={{ color: GREEN }} />
                  kontakt@gramatowscy.pl
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            © 2024 Kancelaria Prawna Gramatowscy. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex gap-4">
            <a
              href="https://gramatowscy.pl/dla-klienta/rodo-klauzula-informacyjna-dla-klientow-kancelarii"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs transition"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Polityka prywatności
            </a>
            <a href="#kontakt-formularz" className="text-xs transition" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Kontakt
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [contactMethod, setContactMethod] = useState<'form' | 'chat' | 'voice'>('form');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', message: '',
    clientType: 'individual', companyName: '', nip: '', address: '',
  });
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<{ message: string; checkout_url?: string } | null>(null);

  const scrollToForm = useScrollTo('kontakt-formularz');
  const scrollToProcess = useScrollTo('jak-dziala');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert('Proszę wyrazić zgodę na przetwarzanie danych osobowych.');
      return;
    }
    setIsSubmitting(true);
    setWebhookResponse(null);
    try {
      const response = await fetch('https://n8n.procesflow.pl/webhook/8006a1ec-b69f-499d-be96-d6707909f600', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setWebhookResponse(data);
      setFormData({ name: '', email: '', phone: '', message: '', clientType: 'individual', companyName: '', nip: '', address: '' });
      setConsent(false);
    } catch {
      alert('Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openVoiceflowChat = () => {
    if (window.voiceflow?.chat) window.voiceflow.chat.open();
  };

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <Navigation />
      <StickyCTA onClick={scrollToForm} />

      <HeroSection onCTAClick={scrollToForm} />
      <QuickConsultationSection onScrollToProcess={scrollToProcess} />
      <HowItWorksSection />

      <FormSection
        contactMethod={contactMethod}
        setContactMethod={setContactMethod}
        formData={formData}
        setFormData={setFormData}
        consent={consent}
        setConsent={setConsent}
        isSubmitting={isSubmitting}
        webhookResponse={webhookResponse}
        setWebhookResponse={setWebhookResponse}
        handleSubmit={handleSubmit}
        openVoiceflowChat={openVoiceflowChat}
      />

      <SpecializationsSection />
      <WhyTrustUsSection />
      <StatsSection />
      <FAQSection />
      <CTABannerSection onScrollToForm={scrollToForm} />
      <Footer />
    </div>
  );
}

export default App;