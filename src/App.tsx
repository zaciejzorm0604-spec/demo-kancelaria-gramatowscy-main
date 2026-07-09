import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Phone, Mail, CheckCircle, Clock, Shield, DollarSign, Users, ChevronDown, ChevronUp, Menu, X, Award, Lock, ThumbsUp, Scissors, ScrollText, TrendingDown, Home, Scale, ShieldAlert, FileText, MapPin, Baby } from 'lucide-react';
import PlayfulBall from './components/PlayfulBall';

// ── Sekcja specjalizacji ───────────────────────────────────────────────────────
// Stała plansza 1160×900 skalowana do viewportu. Wężyk animowany scroll-driven
// (strokeDashoffset). Karty pojawiają się gdy czubek węża mija ich badge.

const BOARD_W = 1160;
const BOARD_H = 900;

const SNAKE_PATH =
  'M 40 10 H 1120 Q 1140 10 1140 30 V 120 Q 1140 140 1120 140 ' +
  'H 60 Q 40 140 40 160 V 280 Q 40 300 60 300 ' +
  'H 1120 Q 1140 300 1140 320 V 410 Q 1140 430 1120 430 ' +
  'H 60 Q 40 430 40 450 V 570 Q 40 590 60 590 ' +
  'H 1120 Q 1140 590 1140 610 V 700 Q 1140 720 1120 720 ' +
  'H 60 Q 40 720 40 740 V 860 Q 40 880 60 880 ' +
  'H 1120';

const SNAKE_CSS = `
  .snake-scroller{overflow:hidden;width:100%;display:flex;justify-content:center;}
  .snake-sizer{position:relative;}
  .snake-board{position:absolute;top:0;left:0;width:${BOARD_W}px;height:${BOARD_H}px;transform-origin:0 0}
  .snake-board svg{position:absolute;inset:0;width:100%;height:100%;display:block}
  .snake-card{
    position:absolute;display:flex;flex-direction:column;justify-content:center;
    padding:16px 32px 16px 62px;border-radius:20px;
    opacity:0;transform:translateY(14px);
    transition:opacity .5s ease,transform .5s ease;
  }
  .snake-card.on{opacity:1;transform:translateY(0)}
  .snake-card::before{
    content:'';position:absolute;inset:0;border-radius:20px;
    background:rgba(255,255,255,0);transition:background .25s ease;pointer-events:none;
  }
  .snake-card:hover::before{background:rgba(255,255,255,0.06)}
  .snake-card h3{
    margin:0 0 6px;font-size:19px;font-weight:700;color:#fff;
    letter-spacing:.01em;line-height:1.2;
  }
  .snake-card p{
    margin:0;font-size:18px;line-height:1.45;
    color:rgba(255,255,255,0.9);max-width:480px;
  }
  .snake-divider{
    width:32px;height:2px;background:#86efac;
    border-radius:2px;margin:6px 0 8px;
  }
  .snake-badge{
    position:absolute;top:50%;left:0;transform:translate(-50%,-50%);
    width:50px;height:50px;border-radius:14px;
    background:linear-gradient(135deg,#f0f9f0,#d8f0d8);
    display:flex;align-items:center;justify-content:center;color:#236b29;
    box-shadow:0 4px 12px rgba(0,0,0,0.28),0 1px 3px rgba(0,0,0,0.15);
  }
`;

type LucideIcon = React.ComponentType<{ size?: number; strokeWidth?: number }>;

interface CardData {
  x: number; y: number; w: number; h: number;
  title: string; description: string;
  Icon: LucideIcon;
}

const CARDS: CardData[] = [
  { x: 560, y:  30, w: 560, h:  90, Icon: Scissors,    title: 'Rozwody i\u00A0separacje', description: 'Sprawy rozwodowe, podział majątku, ustalenie alimentów' },
  { x:  60, y: 160, w: 460, h: 120, Icon: Baby,         title: 'Kontakty z\u00A0dziećmi',  description: 'Ustalenie kontaktów z\u00A0dzieckiem, władza rodzicielska, miejsce zamieszkania' },
  { x: 560, y: 160, w: 560, h: 120, Icon: ScrollText,   title: 'Sprawy spadkowe',          description: 'Spadki, zachowek, dział spadku, odrzucenie spadku, stwierdzenie nabycia spadku' },
  { x: 560, y: 320, w: 560, h:  90, Icon: TrendingDown, title: 'Windykacja i\u00A0długi',  description: 'Dochodzenie należności, pozwy o\u00A0zapłatę, postępowanie egzekucyjne' },
  { x:  60, y: 450, w: 460, h: 120, Icon: Home,         title: 'Nieruchomości',            description: 'Wnioski wieczystoksięgowe, umowy kupna-sprzedaży, służebności, zasiedzenie' },
  { x: 560, y: 450, w: 560, h: 120, Icon: Scale,        title: 'Podział majątku',          description: 'Podział majątku wspólnego małżonków, ugody majątkowe, wycena majątku, ustalenie udziałów' },
  { x: 560, y: 610, w: 560, h:  90, Icon: ShieldAlert,  title: 'Odszkodowania',            description: 'Wypadki, szkody komunikacyjne, zadośćuczynienia' },
  { x:  60, y: 740, w: 460, h: 120, Icon: FileText,     title: 'Umowy',                    description: 'Przygotowanie i\u00A0weryfikacja umów cywilnoprawnych, analiza zapisów umownych' },
  { x: 560, y: 740, w: 560, h: 120, Icon: MapPin,       title: 'Spory sąsiedzkie',         description: 'Konflikty z\u00A0sąsiadami, naruszenie posiadania, granice nieruchomości' },
];


const MOBILE_CSS = `
  .mob-card{
    opacity:0;transform:translateY(16px);
    transition:opacity .5s ease,transform .5s ease;
  }
  .mob-card.on{opacity:1;transform:translateY(0)}
`;

function MobileSpecializations() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardOn, setCardOn] = useState<boolean[]>(CARDS.map(() => false));

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setCardOn(CARDS.map(() => true)); return; }

    const items = containerRef.current?.querySelectorAll('.mob-card');
    if (!items) return;

    const observers: IntersectionObserver[] = [];
    items.forEach((el, i) => {
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { setCardOn(prev => { const next = [...prev]; next[i] = true; return next; }); obs.disconnect(); } },
        { threshold: 0.15 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <>
      <style>{MOBILE_CSS}</style>
      <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2">
        {CARDS.map((card, i) => (
          <div key={i} className={`mob-card flex items-start gap-4 bg-white/10 rounded-2xl p-4${cardOn[i] ? ' on' : ''}`}>
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#f0f9f0] to-[#d8f0d8] flex items-center justify-center text-[#236b29] shadow-md">
              <card.Icon size={20} strokeWidth={1.7} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight mb-1">{card.title}</h3>
              <div className="w-7 h-0.5 bg-[#86efac] rounded mb-2" />
              <p className="text-white/90 text-lg leading-snug">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SpecializationsSnake() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sizerRef    = useRef<HTMLDivElement>(null);
  const snakeRef    = useRef<SVGPathElement>(null);
  const lenRef      = useRef(0);
  const cardAtRef   = useRef<number[]>(CARDS.map(() => Infinity));

  const [scale,     setScale]     = useState(1);
  const [snakeLen,  setSnakeLen]  = useState<number | null>(null);
  const [dashOffset,setDashOffset]= useState(0);
  const [cardOn,    setCardOn]    = useState<boolean[]>(CARDS.map(() => false));

  // ── inicjalizacja: długość ścieżki + punkty wyzwalania kart ──
  useEffect(() => {
    const snake = snakeRef.current;
    const sizer = sizerRef.current;
    if (!snake || !sizer) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const len = snake.getTotalLength();
    lenRef.current = len;
    setSnakeLen(len);

    if (reduced) {
      setDashOffset(0);
      setCardOn(CARDS.map(() => true));
      return;
    }

    setDashOffset(len); // zacznij w pełni ukryty

    // znajdź d dla każdego badge'a
    const ats: number[] = CARDS.map(() => Infinity);
    for (let d = 0; d <= len; d += 8) {
      const pt = snake.getPointAtLength(d);
      ats.forEach((at, i) => {
        if (at === Infinity && Math.hypot(pt.x - CARDS[i].x, pt.y - CARDS[i].y) < 26)
          ats[i] = d;
      });
    }
    cardAtRef.current = ats;

    const update = () => {
      const r = sizer.getBoundingClientRect();
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const minTop = r.top + window.scrollY - maxScroll;
      const denom   = Math.max(1, Math.min(r.height, window.innerHeight * 0.9 - minTop));
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.9 - r.top) / denom));
      const drawn = len * progress;
      setDashOffset(len - drawn);
      setCardOn(cardAtRef.current.map(at => drawn >= at));
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // ── skalowanie planszy do viewportu ──
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const fit = () => setScale(Math.min(1, scroller.clientWidth / BOARD_W));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  return (
    <>
      <style>{SNAKE_CSS}</style>
      <div ref={scrollerRef} className="snake-scroller">
        <div ref={sizerRef} className="snake-sizer"
          style={{ width: BOARD_W * scale, height: BOARD_H * scale }}>
          <div className="snake-board" style={{ transform: `scale(${scale})` }}>
            <svg viewBox={`0 0 ${BOARD_W} ${BOARD_H}`} aria-hidden="true">
              <path
                ref={snakeRef}
                d={SNAKE_PATH}
                fill="none"
                stroke="rgba(255,255,255,0.45)"
                strokeWidth={3}
                strokeLinecap="round"
                style={snakeLen !== null ? {
                  strokeDasharray: `${snakeLen} ${snakeLen}`,
                  strokeDashoffset: dashOffset,
                } : { opacity: 0 }}
              />
            </svg>
            {CARDS.map((card, i) => (
              <div
                key={i}
                className={`snake-card${cardOn[i] ? ' on' : ''}`}
                style={{ left: card.x, top: card.y, width: card.w, height: card.h }}
              >
                <div className="snake-badge"><card.Icon size={22} strokeWidth={1.7} /></div>
                <h3>{card.title}</h3>
                <div className="snake-divider" />
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const HW_BOARD_W = 1160;
const HW_BOARD_H = 480;
const HW_SNAKE_PATH =
  'M 40 10 H 1120 Q 1140 10 1140 30 V 120 Q 1140 140 1120 140 ' +
  'H 60 Q 40 140 40 160 V 280 Q 40 300 60 300 ' +
  'H 1120 Q 1140 300 1140 320 V 440 Q 1140 460 1120 460 H -20';

const HW_CARDS = [
  { x: 560, y: 30, w: 560, h: 90, number: '1', title: 'Zamów konsultację', description: 'Poprzez formularz albo czat zamów i opłać konsultację prawną. Podaj, jakiego zagadnienia dotyczy Twoja sprawa.' },
  { x: 60, y: 160, w: 460, h: 120, number: '2', title: 'Wybierz termin konsultacji', description: 'Nasz asystent w ciągu 24 h (lub najbliższy dzień roboczy) skontaktuje się z Tobą i umówi konkretny termin rozmowy z prawnikiem.' },
  { x: 560, y: 320, w: 560, h: 120, number: '3', title: 'Otrzymaj odpowiedź', description: 'Podczas konsultacji nasz prawnik przeanalizuje Twoją sprawę i przedstawi możliwe rozwiązania.' },
];

const HW_SNAKE_CSS = `
  .hw-scroller{overflow:hidden;width:100%;display:flex;justify-content:center;}
  .hw-sizer{position:relative;}
  .hw-board{position:absolute;top:0;left:0;width:${HW_BOARD_W}px;height:${HW_BOARD_H}px;transform-origin:0 0}
  .hw-board svg{position:absolute;inset:0;width:100%;height:100%;display:block}
  .hw-card{
    position:absolute;display:flex;flex-direction:column;justify-content:center;
    padding:16px 32px 16px 62px;border-radius:20px;
    opacity:0;transform:translateY(14px);
    transition:opacity .5s ease,transform .5s ease;
  }
  .hw-card.on{opacity:1;transform:translateY(0)}
  .hw-card h3{
    margin:0 0 6px;font-size:19px;font-weight:700;color:#111827;
    letter-spacing:.01em;line-height:1.2;
  }
  .hw-card p{
    margin:0;font-size:18px;line-height:1.45;
    color:#4B5563;max-width:480px;
  }
  .hw-divider{
    width:32px;height:3px;background:#2E8540;
    border-radius:2px;margin:6px 0 8px;
  }
  .hw-badge{
    position:absolute;top:50%;left:0;transform:translate(-50%,-50%);
    width:50px;height:50px;border-radius:50%;
    background:#2E8540;
    display:flex;align-items:center;justify-content:center;color:#fff;
    font-size:20px;font-weight:bold;
    box-shadow:0 4px 12px rgba(0,0,0,0.1),0 1px 3px rgba(0,0,0,0.05);
  }
`;

function MobileHowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardOn, setCardOn] = useState<boolean[]>(HW_CARDS.map(() => false));

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setCardOn(HW_CARDS.map(() => true)); return; }

    const items = containerRef.current?.querySelectorAll('.mob-card');
    if (!items) return;

    const observers: IntersectionObserver[] = [];
    items.forEach((el, i) => {
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { setCardOn(prev => { const next = [...prev]; next[i] = true; return next; }); obs.disconnect(); } },
        { threshold: 0.15 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <>
      <style>{MOBILE_CSS}</style>
      <div ref={containerRef} className="flex flex-col gap-6 px-2 max-w-lg mx-auto">
        {HW_CARDS.map((card, i) => (
          <div key={i} className={`mob-card flex items-start gap-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100${cardOn[i] ? ' on' : ''}`}>
            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#2E8540] flex items-center justify-center text-white font-bold text-lg shadow-md">
              {card.number}
            </div>
            <div>
              <h3 className="text-gray-900 font-bold text-lg leading-tight mb-1">{card.title}</h3>
              <div className="w-8 h-[3px] bg-[#2E8540] rounded mb-2" />
              <p className="text-gray-600 text-base leading-snug">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function HowItWorksSnake() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sizerRef    = useRef<HTMLDivElement>(null);
  const snakeRef    = useRef<SVGPathElement>(null);
  const lenRef      = useRef(0);
  const cardAtRef   = useRef<number[]>(HW_CARDS.map(() => Infinity));

  const [scale,     setScale]     = useState(1);
  const [snakeLen,  setSnakeLen]  = useState<number | null>(null);
  const [dashOffset,setDashOffset]= useState(0);
  const [cardOn,    setCardOn]    = useState<boolean[]>(HW_CARDS.map(() => false));

  useEffect(() => {
    const snake = snakeRef.current;
    const sizer = sizerRef.current;
    if (!snake || !sizer) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const len = snake.getTotalLength();
    lenRef.current = len;
    setSnakeLen(len);

    if (reduced) {
      setDashOffset(0);
      setCardOn(HW_CARDS.map(() => true));
      return;
    }

    setDashOffset(len);

    const ats: number[] = HW_CARDS.map(() => Infinity);
    for (let d = 0; d <= len; d += 8) {
      const pt = snake.getPointAtLength(d);
      ats.forEach((at, i) => {
        if (at === Infinity && Math.hypot(pt.x - HW_CARDS[i].x, pt.y - HW_CARDS[i].y) < 26)
          ats[i] = d;
      });
    }
    cardAtRef.current = ats;

    const update = () => {
      const r = sizer.getBoundingClientRect();
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const minTop = r.top + window.scrollY - maxScroll;
      const denom   = Math.max(1, Math.min(r.height, window.innerHeight * 0.9 - minTop));
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.9 - r.top) / denom));
      const drawn = len * progress;
      setDashOffset(len - drawn);
      setCardOn(cardAtRef.current.map(at => drawn >= at));
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const fit = () => setScale(Math.min(1, scroller.clientWidth / HW_BOARD_W));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  return (
    <>
      <style>{HW_SNAKE_CSS}</style>
      <div ref={scrollerRef} className="hw-scroller">
        <div ref={sizerRef} className="hw-sizer"
          style={{ width: HW_BOARD_W * scale, height: HW_BOARD_H * scale }}>
          <div className="hw-board" style={{ transform: `scale(${scale})` }}>
            <svg viewBox={`0 0 ${HW_BOARD_W} ${HW_BOARD_H}`} aria-hidden="true">
              <path
                ref={snakeRef}
                d={HW_SNAKE_PATH}
                fill="none"
                stroke="rgba(46,133,64,0.45)"
                strokeWidth={3}
                strokeLinecap="round"
                style={snakeLen !== null ? {
                  strokeDasharray: `${snakeLen} ${snakeLen}`,
                  strokeDashoffset: dashOffset,
                } : { opacity: 0 }}
              />
            </svg>
            {HW_CARDS.map((card, i) => (
              <div
                key={i}
                className={`hw-card${cardOn[i] ? ' on' : ''}`}
                style={{ left: card.x, top: card.y, width: card.w, height: card.h }}
              >
                <div className="hw-badge">{card.number}</div>
                <h3>{card.title}</h3>
                <div className="hw-divider" />
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

declare global {
  interface Window {
    voiceflow?: {
      chat?: {
        open: () => void;
        close: () => void;
      };
    };
  }
}

function App() {
  const [contactMethod, setContactMethod] = useState<'form' | 'chat' | 'voice'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    clientType: 'individual',
    companyName: '',
    nip: '',
    address: ''
  });
  const [consent, setConsent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<{ message: string; checkout_url?: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setWebhookResponse(data);

      // Resetuj formularz po pomyślnym wysłaniu
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        clientType: 'individual',
        companyName: '',
        nip: '',
        address: ''
      });
      setConsent(false);
    } catch (error) {
      alert('Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const openVoiceflowChat = () => {
    if (window.voiceflow?.chat) {
      window.voiceflow.chat.open();
    }
  };

  const faqs = [
    {
      question: 'Jak szybko otrzymam odpowiedź na\u00A0moje pytanie prawne?',
      answer: 'W\u00A0przypadku wykupienia konsultacji prawnej online nasz asystent kontaktuje się w\u00A0ciągu 24\u00A0h (lub w\u00A0najbliższy dzień roboczy), aby umówić dokładną datę rozmowy z\u00A0prawnikiem. Wyznaczamy najszybszy możliwy termin konsultacji. W\u00A0naszej Kancelarii pracuje zespół adwokatów i\u00A0radców prawnych, dzięki czemu możemy sprawnie działać i\u00A0oferować krótki czas oczekiwania.'
    },
    {
      question: 'Czy moje dane są bezpieczne?',
      answer: 'Tak, gwarantujemy pełną poufność. Wszystkie dane są szyfrowane, a\u00A0komunikacja odbywa się przez bezpieczne kanały. Przestrzegamy tajemnicy zawodowej zgodnie z\u00A0przepisami prawa.'
    },
    {
      question: 'Jakie sprawy obsługujecie?',
      answer: 'Specjalizujemy się w\u00A0sprawach osób fizycznych: rozwody, kontakty z\u00A0dziećmi, spadki, zachowek, windykacja, sprawy nieruchomości, odszkodowania, umowy cywilnoprawne i\u00A0wiele innych.'
    },
    {
      question: 'Ile kosztuje porada prawna?',
      answer: 'Koszt usługi zależy od\u00A0zakresu sprawy. Sprawy, które nie są czasochłonne ani skomplikowane, może udać się rozwiązać nawet w\u00A0trakcie krótkiej konsultacji z\u00A0prawnikiem, którą oferujemy w\u00A0przystępnej cenie. Dla spraw, które są bardziej czasochłonne, przedstawiamy zawsze przejrzystą wycenę przed rozpoczęciem działań.'
    },
    {
      question: 'Czy mogę skorzystać z\u00A0porady prawnej z\u00A0dowolnego miejsca w\u00A0Polsce?',
      answer: 'Tak, nasze usługi online są dostępne dla klientów z\u00A0całej Polski. Nie musisz przyjeżdżać do\u00A0naszego biura - wszystko załatwisz zdalnie.'
    },
    {
      question: 'Jak wygląda proces współpracy?',
      answer: 'Nasz prawnik analizuje sytuację i\u00A0przedstawia możliwe rozwiązania - dzięki temu, wiesz już, co\u00A0dalej robić. Jeśli sprawa jest bardziej skomplikowana i\u00A0wymaga dłuższej współpracy, działamy zgodnie z\u00A0ustalonym planem i\u00A0informujemy Cię na\u00A0każdym etapie o\u00A0postępach lub zmianach, jesteśmy też dostępni w\u00A0przypadku dodatkowych pytań.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <PlayfulBall />
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="/logo.svg" alt="E-Kancelaria Gramatowscy" className="h-8" />
            </div>
            <div className="hidden md:flex items-center gap-2">
              <a href="#uslugi" className="text-gray-700 hover:text-[#2E8540] transition px-3 py-2">Usługi</a>
              <a href="#jak-dziala" className="text-gray-700 hover:text-[#2E8540] transition px-3 py-2">Jak to działa</a>
              <a href="#faq" className="text-gray-700 hover:text-[#2E8540] transition px-3 py-2">FAQ</a>
              <a href="#kontakt" className="bg-[#2E8540] text-white px-6 py-2 rounded-lg hover:bg-[#247032] transition ml-2">Kontakt</a>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-[#2E8540] transition"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              <a href="#uslugi" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-[#2E8540] transition py-2">Usługi</a>
              <a href="#jak-dziala" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-[#2E8540] transition py-2">Jak to działa</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-[#2E8540] transition py-2">FAQ</a>
              <a href="#kontakt" onClick={() => setMobileMenuOpen(false)} className="block bg-[#2E8540] text-white px-6 py-3 rounded-lg hover:bg-[#247032] transition text-center">Kontakt</a>
            </div>
          </div>
        )}
      </nav>

      {/* STRONA 1 – Intro Hero */}
      <section className="pt-24 pb-16 bg-[#F3F9F4] min-h-[100vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
                <span className="text-[#2E8540]">Profesjonalne wsparcie prawne</span> zaczyna się od&nbsp;zrozumienia
              </h1>
              <p className="text-lg sm:text-xl text-[#2E8540] font-medium mb-10 sm:mb-12">
                — widzimy przede wszystkim człowieka i&nbsp;jego historię…
              </p>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-lg">
                Rozumiemy, że za&nbsp;każdą sprawą stoją emocje i&nbsp;ważne życiowe decyzje, dlatego stawiamy na&nbsp;<strong>indywidualne podejście</strong> oraz realne wsparcie na&nbsp;każdym etapie współpracy. Nasi adwokaci i&nbsp;radcy prawni angażują się i&nbsp;szukają najlepszych rozwiązań z&nbsp;pełnym zrozumieniem <strong>Twoich potrzeb</strong>.
              </p>
              <p className="text-sm sm:text-base text-gray-600 mb-8 leading-relaxed max-w-lg">
                Poznaj sposób działania naszej kancelarii, zakres specjalizacji oraz <strong>korzyści</strong> płynące ze&nbsp;współpracy z&nbsp;<strong>doświadczonym zespołem</strong> prawników.
              </p>
              <a
                href="#kontakt-formularz"
                className="inline-block bg-[#2E8540] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#247032] transition text-base sm:text-lg"
              >
                Przedstaw swoją sprawę
              </a>
            </div>
            <div className="relative h-80 sm:h-96 lg:h-[560px] rounded-2xl overflow-hidden shadow-2xl mt-0 lg:mt-2">
              <img
                src="/zdjecie rozjasione.avif"
                alt="Kancelaria Gramatowscy – wejście"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* STRONA 2 – Szybka konsultacja z prawnikiem */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="relative h-72 sm:h-96 lg:h-[460px] rounded-2xl overflow-hidden shadow-xl order-last lg:order-first">
              <img
                src="/laptop_zamkniety.avif"
                alt="Konsultacja prawna online"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="order-first lg:order-last">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
                Szybka konsultacja z&nbsp;prawnikiem
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed max-w-lg">
                Nie każda sprawa wymaga natychmiastowej wizyty w&nbsp;kancelarii. Czasem wystarczy szybka konsultacja, aby odzyskać spokój, poznać możliwości i&nbsp;podjąć właściwe decyzje.
              </p>
              <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed max-w-lg">
                Stworzyliśmy nowoczesny sposób kontaktu z&nbsp;prawnikiem&nbsp;– prosty, wygodny i&nbsp;dostępny <strong>ONLINE</strong>. Bez zbędnych formalności, bez ukrytych kosztów i&nbsp;bez wychodzenia z&nbsp;domu.
              </p>
              <p className="text-sm sm:text-base text-gray-600 mb-8 leading-relaxed max-w-lg">
                Niezależnie od&nbsp;tego, czy potrzebujesz pomocy w&nbsp;sprawie rodzinnej, majątkowej, spadkowej czy związanej z&nbsp;nieruchomościami&nbsp;– możesz liczyć na&nbsp;jasne wyjaśnienie sytuacji oraz konkretne rozwiązania dopasowane do&nbsp;Twoich potrzeb.
              </p>
              <a
                href="#jak-dziala"
                className="inline-block border-2 border-[#2E8540] text-[#2E8540] px-6 py-3 rounded-lg font-semibold hover:bg-[#2E8540] hover:text-white transition"
              >
                Sprawdź, jak działamy
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* STRONA 3 – How It Works */}
      <section id="jak-dziala" className="py-12 sm:py-16 lg:py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Jak działa nasza <span className="text-[#2E8540]">pomoc prawna</span>?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">Trzy proste kroki do&nbsp;rozwiązania Twojego problemu</p>
          </div>

          <div className="lg:hidden">
            <MobileHowItWorks />
          </div>
          <div className="hidden lg:block">
            <HowItWorksSnake />
          </div>
        </div>
      </section>

      {/* STRONA 4 – Contact Form / Hero */}
      <section id="kontakt-formularz" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
                Profesjonalna <br className="hidden lg:block"/>
                pomoc prawna <br className="hidden lg:block"/>
                <span className="text-[#2E8540]">online</span> <br className="hidden lg:block"/>
                dla&nbsp;osób fizycznych
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
                Rozwody, spadki, podział majątku, odszkodowania, nieruchomości i&nbsp;więcej
              </p>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
                <div className="text-center p-2 sm:p-4 bg-gray-50 rounded-lg shadow-sm">
                  <div className="text-xl sm:text-3xl font-bold text-[#2E8540]">20</div>
                  <div className="text-xs sm:text-sm text-gray-600">lat doświadczenia</div>
                </div>
                <div className="text-center p-2 sm:p-4 bg-gray-50 rounded-lg shadow-sm">
                  <div className="text-xl sm:text-3xl font-bold text-[#2E8540]">25000+</div>
                  <div className="text-xs sm:text-sm text-gray-600">udzielonych porad</div>
                </div>
                <div className="text-center p-2 sm:p-4 bg-gray-50 rounded-lg shadow-sm">
                  <div className="text-xl sm:text-3xl font-bold text-[#2E8540]">99%</div>
                  <div className="text-xs sm:text-sm text-gray-600">zadowolonych klientów</div>
                </div>
              </div>

              <div className="bg-gray-50 p-2 rounded-lg flex flex-col sm:inline-flex sm:flex-row gap-2 mb-6">
                <button
                  onClick={() => setContactMethod('form')}
                  className={`px-4 sm:px-6 py-3 rounded-lg transition flex items-center justify-center space-x-2 ${contactMethod === 'form' ? 'bg-[#2E8540] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <Mail className="h-4 w-4" />
                  <span>Formularz</span>
                </button>
                <button
                  onClick={() => setContactMethod('chat')}
                  className={`border-2 border-[#2E8540] px-4 sm:px-6 py-3 rounded-lg transition flex items-center justify-center space-x-2 ${contactMethod === 'chat' ? 'bg-[#2E8540] text-white' : 'text-[#2E8540] bg-white hover:bg-[#F3F9F4]'}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => setContactMethod('voice')}
                  className={`border-2 border-[#2E8540] px-4 sm:px-6 py-3 rounded-lg transition flex items-center justify-center space-x-2 ${contactMethod === 'voice' ? 'bg-[#2E8540] text-white' : 'text-[#2E8540] bg-white hover:bg-[#F3F9F4]'}`}
                >
                  <Phone className="h-4 w-4" />
                  <span>Telefon</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
              {contactMethod === 'form' && (
                <>
                  {!webhookResponse ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Opisz swoją sprawę</h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Typ klienta</label>
                        <select
                          value={formData.clientType}
                          onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E8540] focus:border-transparent"
                          required
                        >
                          <option value="individual">Klient indywidualny</option>
                          <option value="business">Klient firmowy</option>
                        </select>
                      </div>

                      {formData.clientType === 'business' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nazwa firmy</label>
                            <input
                              type="text"
                              value={formData.companyName}
                              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E8540] focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">NIP</label>
                            <input
                              type="text"
                              value={formData.nip}
                              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E8540] focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                            <input
                              type="text"
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E8540] focus:border-transparent"
                              required
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Imię i&nbsp;nazwisko</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E8540] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E8540] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E8540] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Opis sprawy</label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E8540] focus:border-transparent"
                          placeholder="Opisz swoją sytuację prawną…"
                          required
                        />
                      </div>
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="consent"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          className="mt-1 h-4 w-4 text-[#2E8540] focus:ring-[#2E8540] border-gray-300 rounded"
                          required
                        />
                        <label htmlFor="consent" className="text-sm text-gray-600">
                          Wyrażam zgodę na&nbsp;przetwarzanie przez Kancelarię Prawną Gramatowscy moich danych osobowych w&nbsp;celach związanych ze&nbsp;świadczeniem pomocy prawnej. Przyjmuję do&nbsp;wiadomości, że zgoda może być cofnięta w&nbsp;każdym czasie. Szczegółowe zasady przetwarzania danych osobowych przez Kancelarię Prawną Gramatowscy zawarte są w{' '}
                          <a
                            href="https://gramatowscy.pl/dla-klienta/rodo-klauzula-informacyjna-dla-klientow-kancelarii"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#2E8540] hover:underline"
                          >
                            Polityce prywatności
                          </a>
                          .
                        </label>
                      </div>
                      <button
                        type="submit"
                        disabled={!consent || isSubmitting}
                        className="w-full bg-[#2E8540] text-white py-4 rounded-lg font-semibold hover:bg-[#247032] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Wysyłanie…' : 'Wyślij'}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-[#2E8540] mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Dziękujemy za&nbsp;kontakt!</h3>
                      <div className="text-gray-600 mb-6 whitespace-pre-line text-lg">
                        {webhookResponse.message}
                      </div>
                      {webhookResponse.checkout_url && (
                        <a
                          href={webhookResponse.checkout_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-[#2E8540] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#247032] transition"
                        >
                          Opłać konsultację
                        </a>
                      )}
                      <button
                        onClick={() => setWebhookResponse(null)}
                        className="block w-full mt-4 text-gray-600 hover:text-gray-900 transition"
                      >
                        Wyślij kolejne zapytanie
                      </button>
                    </div>
                  )}
                </>
              )}

              {contactMethod === 'chat' && (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-[#2E8540] mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Chat z&nbsp;Kancelarią</h3>
                  <p className="text-gray-600 mb-6">
                    Potrzebujesz pomocy online? Sprawdź, jak możemy Ci pomóc. Umów konsultację.
                  </p>
                  <button
                    onClick={openVoiceflowChat}
                    className="bg-[#2E8540] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#247032] transition"
                  >
                    Rozpocznij chat
                  </button>
                </div>
              )}

              {contactMethod === 'voice' && (
                <div className="text-center py-12">
                  <Phone className="h-16 w-16 text-[#2E8540] mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Rozmowa przez telefon</h3>
                  <p className="text-gray-600 mb-6">
                    Zadzwoń i&nbsp;umów się na&nbsp;konsultację.
                  </p>
                  <a href="tel:+48573133556" className="inline-block bg-[#2E8540] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#247032] transition">
                    +48&nbsp;573&nbsp;133&nbsp;556
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* STRONA 5 – Services */}
      <section id="uslugi" className="bg-gray-50 pt-12 sm:pt-16 lg:pt-20 pb-0">
        {/* Nagłówek – jasne tło */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Nasze <span className="text-[#2E8540]">specjalizacje</span></h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">Kompleksowa obsługa prawna dla&nbsp;osób fizycznych</p>
            </div>
            <div className="relative h-56 sm:h-72 lg:h-64 rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/temida.avif"
                alt="Temida – symbol sprawiedliwości"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50/30 to-transparent" />
            </div>
          </div>
        </div>

        {/* Zielony panel – pełna szerokość sekcji */}
        <div className="bg-gradient-to-br from-[#2E8540] to-[#1a5c2a] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
          {/* Mobile: responsywny grid kart */}
          <div className="lg:hidden">
            <MobileSpecializations />
          </div>
          {/* Desktop: animacja węża */}
          <div className="hidden lg:block">
            <SpecializationsSnake />
          </div>
        </div>
      </section>

      {/* STRONA 6 – Why Trust Us */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative h-80 sm:h-96 lg:h-[480px] rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/wejście1.avif"
                alt="Kancelaria Gramatowscy"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 sm:mb-10">Dlaczego warto <span className="text-[#2E8540]">nam zaufać</span>?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="bg-green-50 w-14 h-14 rounded-full flex items-center justify-center mb-3">
                    <Shield className="h-7 w-7 text-[#2E8540]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Pełna poufność</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Gwarantujemy tajemnicę zawodową i&nbsp;bezpieczeństwo Twoich danych.
                  </p>
                </div>

                <div>
                  <div className="bg-green-50 w-14 h-14 rounded-full flex items-center justify-center mb-3">
                    <Clock className="h-7 w-7 text-[#2E8540]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Sprawne działanie</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Szybki kontakt. Analiza problemu i&nbsp;warianty możliwych rozwiązań.
                  </p>
                </div>

                <div>
                  <div className="bg-green-50 w-14 h-14 rounded-full flex items-center justify-center mb-3">
                    <DollarSign className="h-7 w-7 text-[#2E8540]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Przejrzyste ceny</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Znasz koszty przed rozpoczęciem współpracy. Bez ukrytych opłat.
                  </p>
                </div>

                <div>
                  <div className="bg-green-50 w-14 h-14 rounded-full flex items-center justify-center mb-3">
                    <Users className="h-7 w-7 text-[#2E8540]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Doświadczenie</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    20 lat praktyki i&nbsp;ponad 25&nbsp;000 udzielonych porad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#2E8540] to-[#1a5c2a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">20</div>
              <div className="text-sm sm:text-base text-green-100">Lat doświadczenia</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">25&nbsp;000+</div>
              <div className="text-sm sm:text-base text-green-100">Udzielonych porad</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">1800+</div>
              <div className="text-sm sm:text-base text-green-100">Zadowolonych klientów</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">99%</div>
              <div className="text-sm sm:text-base text-green-100">Pozytywnych opinii</div>
            </div>
          </div>
        </div>
      </section>

      {/* STRONA 7 – FAQ */}
      <section id="faq" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Najczęściej zadawane pytania</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">Odpowiedzi na&nbsp;Twoje wątpliwości</p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-sm sm:text-base text-gray-900 pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-[#2E8540] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-4 sm:px-6 pb-3 sm:pb-4 text-sm sm:text-base text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STRONA 8 – CTA + Footer */}
      {/* CTA: formularz na białym tle, telefon na zielonym */}
      <section id="kontakt" className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-xl">
            {/* Formularz – białe tło */}
            <div className="bg-white p-8 sm:p-12 flex flex-col justify-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Potrzebujesz pomocy prawnej?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-8">
                Nie czekaj. Skontaktuj się z&nbsp;nami już dziś i&nbsp;zyskaj pewność, że Twoja sprawa jest w&nbsp;dobrych rękach.
              </p>
              <a
                href="#kontakt-formularz"
                className="inline-flex items-center justify-center bg-[#2E8540] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#247032] transition text-base sm:text-lg"
              >
                <Mail className="h-5 w-5 mr-2" />
                Napisz do&nbsp;nas
              </a>
            </div>
            {/* Telefon – zielone tło */}
            <div className="bg-gradient-to-br from-[#2E8540] to-[#1a5c2a] p-8 sm:p-12 flex flex-col justify-center items-start">
              <p className="text-green-100 text-base sm:text-lg mb-4">
                Wolisz porozmawiać? Zadzwoń do&nbsp;nas:
              </p>
              <a
                href="tel:+48573133556"
                className="inline-flex items-center text-white text-2xl sm:text-3xl font-bold hover:text-green-100 transition mb-6"
              >
                <Phone className="h-7 w-7 mr-3" />
                +48&nbsp;573&nbsp;133&nbsp;556
              </a>
              <p className="text-green-100 text-sm sm:text-base">
                Telefon czynny: Pn–Pt: 8:00–16:00
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <img src="/logo_biale_eKancelaria.svg" alt="E-Kancelaria Gramatowscy" className="h-8" />
              </div>
              <p className="text-sm sm:text-base text-gray-400">
                Profesjonalna pomoc prawna online dla&nbsp;osób fizycznych w&nbsp;całej Polsce. Adwokaci i&nbsp;radcy prawni. 20&nbsp;lat doświadczenia.
              </p>
            </div>

            <div className="md:pl-8 lg:pl-12">
              <h3 className="text-white font-bold mb-3 sm:mb-4 text-base sm:text-lg">Usługi</h3>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><a href="#uslugi" className="hover:text-white transition">Rozwody i&nbsp;separacje</a></li>
                <li><a href="#uslugi" className="hover:text-white transition">Sprawy spadkowe</a></li>
                <li><a href="#uslugi" className="hover:text-white transition">Opieka nad dziećmi</a></li>
                <li><a href="#uslugi" className="hover:text-white transition">Alimenty</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-3 sm:mb-4 text-base sm:text-lg">Kontakt</h3>
              <div className="space-y-2">
                <p className="flex items-center text-sm sm:text-base">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  kontakt@gramatowscy.pl
                </p>
                <p className="flex items-center text-sm sm:text-base">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  +48&nbsp;573&nbsp;133&nbsp;556
                </p>
              </div>
            </div>
          </div>

          {/* Footer features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 border-t border-gray-800 pt-8 sm:pt-10">
            <div className="flex items-start gap-3">
              <div className="bg-gray-800 rounded-lg p-2 flex-shrink-0">
                <Award className="h-5 w-5 text-[#2E8540]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-1">Ponad 20 lat doświadczenia</p>
                <p className="text-gray-400 text-xs sm:text-sm">Nasi prawnicy posiadają wieloletnie doświadczenie w&nbsp;prowadzeniu spraw dla&nbsp;osób fizycznych.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-800 rounded-lg p-2 flex-shrink-0">
                <Lock className="h-5 w-5 text-[#2E8540]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-1">Pełna poufność</p>
                <p className="text-gray-400 text-xs sm:text-sm">Tajemnica zawodowa adwokata i&nbsp;radcy prawnego gwarantuje bezpieczeństwo Twoich danych.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-800 rounded-lg p-2 flex-shrink-0">
                <Users className="h-5 w-5 text-[#2E8540]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-1">Indywidualne podejście</p>
                <p className="text-gray-400 text-xs sm:text-sm">Każdą sprawę traktujemy wyjątkowo, dostosowując strategię do&nbsp;Twoich potrzeb.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-800 rounded-lg p-2 flex-shrink-0">
                <ThumbsUp className="h-5 w-5 text-[#2E8540]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-1">99% pozytywnych opinii</p>
                <p className="text-gray-400 text-xs sm:text-sm">Tysiące zadowolonych klientów polecają nasze usługi swoim bliskim.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center text-gray-400 gap-4">
            <p className="text-sm sm:text-base">&copy; 2026 <a href="https://procesflow.pl/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Procesflow</a></p>
            <a href="https://gramatowscy.pl/dla-klienta/rodo-klauzula-informacyjna-dla-klientow-kancelarii" target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base hover:text-white transition">Polityka prywatności</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;