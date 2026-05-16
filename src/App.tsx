import { useState } from 'react';
import { MessageSquare, Phone, Mail, CheckCircle, Clock, Shield, DollarSign, Users, Star, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';

// ── ServiceCard ────────────────────────────────────────────────────────────────

interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  mode: 'image-default' | 'text-default';
}

function ServiceCard({ title, description, image, mode }: ServiceCardProps) {
  const isImageDefault = mode === 'image-default';

  return (
    <div className="group relative overflow-hidden rounded-xl shadow-sm h-64">
      {/* ── Image layer ────────────────────────────────────────────────── */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-in-out ${
          isImageDefault
            ? 'opacity-100 group-hover:opacity-0 pointer-events-auto group-hover:pointer-events-none'
            : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
        }`}
        style={{ backgroundImage: `url(${JSON.stringify(image)})` }}
      >
        {/* Green bar with title – shown only in image-default default state */}
        {isImageDefault && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#2E8540] bg-opacity-90 px-4 py-3">
            <h3 className="text-white font-bold text-base sm:text-lg leading-tight">{title}</h3>
          </div>
        )}
      </div>

      {/* ── Content layer ──────────────────────────────────────────────── */}
      <div
        className={`absolute inset-0 bg-white p-4 sm:p-6 flex flex-col justify-start transition-opacity duration-500 ease-in-out ${
          isImageDefault
            ? 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
            : 'opacity-100 group-hover:opacity-0 pointer-events-auto group-hover:pointer-events-none'
        }`}
      >
        <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-[#2E8540] mb-3 sm:mb-4 flex-shrink-0" />
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ── Service data ───────────────────────────────────────────────────────────────

const SERVICES: ServiceCardProps[] = [
  {
    title: 'Rozwody i separacje',
    description: 'Profesjonalna pomoc w sprawach rozwodowych, podział majątku, ustalenie alimentów',
    image: '/[01_rozwody] van-tay-media-Kab_-4M4I74-unsplash.jpg',
    mode: 'image-default',
  },
  {
    title: 'Kontakty z dziećmi',
    description: 'Ustalenie kontaktów z dzieckiem, władza rodzicielska, miejsce zamieszkania',
    image: '/[02_dzieci] vitaly-gariev-inrYL3ffAsQ-unsplash.jpg',
    mode: 'text-default',
  },
  {
    title: 'Sprawy spadkowe',
    description: 'Spadki, zachowek, dział spadku, odrzucenie spadku, stwierdzenie nabycia spadku',
    image: '/[03_spadkowe] towfiqu-barbhuiya-joqWSI9u_XM-unsplash.jpg',
    mode: 'image-default',
  },
  {
    title: 'Windykacja i długi',
    description: 'Skuteczne dochodzenie należności, pozwy o zapłatę, postępowania egzekucyjne',
    image: '/[04_windykacja] emil-kalibradov-K05Udh2LhFA-unsplash_v2.jpg',
    mode: 'text-default',
  },
  {
    title: 'Nieruchomości',
    description: 'Wnioski wieczystoksięgowe, umowy kupna-sprzedaży, służebności, zasiedzenie',
    image: '/[05_nieruchomosci] ronnie-george-z11gbBo13ro-unsplash.jpg',
    mode: 'image-default',
  },
  {
    title: 'Podział majątku',
    description: 'Podział majątku wspólnego małżonków, ugody majątkowe, wycena majątku, ustalenie udziałów',
    image: '/[06_podzial majatku] supannee-u-prapruit-hn6k00wZxr8-unsplash.jpg',
    mode: 'text-default',
  },
  {
    title: 'Odszkodowania',
    description: 'Wypadki, szkody komunikacyjne, zadośćuczynienia',
    image: '/[07_odszkodowania] northfolk-Ok76F6yW2iA-unsplash_v2.jpg',
    mode: 'image-default',
  },
  {
    title: 'Umowy',
    description: 'Przygotowanie i weryfikacja umów cywilnoprawnych, analiza zapisów umownych',
    image: '/[08_umowy] sebastian-herrmann-n4_Q2dDYy80-unsplash_v2.jpg',
    mode: 'text-default',
  },
  {
    title: 'Spory sąsiedzkie',
    description: 'Konflikty z sąsiadami, naruszenie posiadania, granice nieruchomości',
    image: '/[09_spory sasiedzkie] j-king-ebuixpviQH0-unsplash.jpg',
    mode: 'image-default',
  },
];

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
      question: 'Jak szybko otrzymam odpowiedź na moje pytanie prawne?',
      answer: 'W przypadku wykupienia konsultacji prawnej online nasz asystent kontaktuje się w ciągu 24 h (lub w najbliższy dzień roboczy), aby umówić dokładną datę rozmowy z prawnikiem. Wyznaczamy najszybszy możliwy termin konsultacji. W naszej Kancelarii pracuje zespół adwokatów i radców prawnych, dzięki czemu możemy sprawnie działać i oferować krótki czas oczekiwania.'
    },
    {
      question: 'Czy moje dane są bezpieczne?',
      answer: 'Tak, gwarantujemy pełną poufność. Wszystkie dane są szyfrowane, a komunikacja odbywa się przez bezpieczne kanały. Przestrzegamy tajemnicy zawodowej zgodnie z przepisami prawa.'
    },
    {
      question: 'Jakie sprawy obsługujecie?',
      answer: 'Specjalizujemy się w sprawach osób fizycznych: rozwody, kontakty z dziećmi, spadki, zachowek, windykacja, sprawy nieruchomości, odszkodowania, umowy cywilnoprawne i wiele innych.'
    },
    {
      question: 'Ile kosztuje porada prawna?',
      answer: 'Koszt usługi zależy od zakresu sprawy. Sprawy, które nie są czasochłonne ani skomplikowane, może udać się rozwiązać nawet w trakcie krótkiej konsultacji z prawnikiem, którą oferujemy w przystępnej cenie. Dla spraw, które są bardziej czasochłonne, przedstawiamy zawsze przejrzystą wycenę przed rozpoczęciem działań.'
    },
    {
      question: 'Czy mogę skorzystać z porady prawnej z dowolnego miejsca w Polsce?',
      answer: 'Tak, nasze usługi online są dostępne dla klientów z całej Polski. Nie musisz przyjeżdżać do naszego biura - wszystko załatwisz zdalnie.'
    },
    {
      question: 'Jak wygląda proces współpracy?',
      answer: 'Nasz prawnik analizuje sytuację i przedstawia możliwe rozwiązania - dzięki temu, wiesz już, co dalej robić. Jeśli sprawa jest bardziej skomplikowana i wymaga dłuższej współpracy, działamy zgodnie z ustalonym planem i informujemy Cię na każdym etapie o postępach lub zmianach, jesteśmy też dostępni w przypadku dodatkowych pytań.'
    }
  ];

  const testimonials = [
    {
      name: 'Anna K.',
      rating: 5,
      text: 'Pomoc przy rozwodzie przebiegła sprawnie i profesjonalnie. Wreszcie ktoś, kto rozumie moje emocje i jednocześnie prowadzi sprawę konkretnie.',
      case: 'Rozwód'
    },
    {
      name: 'Tomasz M.',
      rating: 5,
      text: 'Sprawa spadkowa wydawała się skomplikowana, ale otrzymałem jasne wskazówki. Wszystko załatwione online, bez zbędnych wizyt.',
      case: 'Sprawa spadkowa'
    },
    {
      name: 'Magdalena W.',
      rating: 5,
      text: 'Windykacja długu przebiegła skutecznie. Ceniłam sobie stały kontakt i informowanie o postępach sprawy.',
      case: 'Windykacja'
    },
    {
      name: 'Piotr S.',
      rating: 5,
      text: 'Problem z umową najmu mieszkania został rozwiązany szybko i po korzystnej dla mnie cenie. Polecam!',
      case: 'Prawo najmu'
    },
    {
      name: 'Katarzyna D.',
      rating: 5,
      text: 'Ustalone kontakty z dzieckiem po rozwodzie. Prawnik był cierpliwy, zrozumiał moją trudną sytuację i skutecznie mi pomógł.',
      case: 'Kontakty z dzieckiem'
    },
    {
      name: 'Jan B.',
      rating: 5,
      text: 'Sprawa odszkodowania po wypadku. Profesjonalna pomoc, dobre przygotowanie i skuteczne działanie. Jestem bardzo zadowolony.',
      case: 'Odszkodowanie'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="/logo.svg" alt="E-Kancelaria Gramatowscy" className="h-8" />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#uslugi" className="text-gray-700 hover:text-[#2E8540] transition">Usługi</a>
              <a href="#jak-dziala" className="text-gray-700 hover:text-[#2E8540] transition">Jak to działa</a>
              <a href="#faq" className="text-gray-700 hover:text-[#2E8540] transition">FAQ</a>
              <a href="#kontakt" className="bg-[#2E8540] text-white px-6 py-2 rounded-lg hover:bg-[#247032] transition">Kontakt</a>
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

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
                Profesjonalna pomoc prawna <span className="text-[#2E8540]">online</span> dla osób fizycznych
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
                Rozwody, spadki, podział majątku, odszkodowania, nieruchomości i więcej.
              </p>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
                <div className="text-center p-2 sm:p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-xl sm:text-3xl font-bold text-[#2E8540]">20</div>
                  <div className="text-xs sm:text-sm text-gray-600">lat doświadczenia</div>
                </div>
                <div className="text-center p-2 sm:p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-xl sm:text-3xl font-bold text-[#2E8540]">25000+</div>
                  <div className="text-xs sm:text-sm text-gray-600">udzielonych porad</div>
                </div>
                <div className="text-center p-2 sm:p-4 bg-white rounded-lg shadow-sm">
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
                  className={`px-4 sm:px-6 py-3 rounded-lg transition flex items-center justify-center space-x-2 ${contactMethod === 'chat' ? 'bg-[#2E8540] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => setContactMethod('voice')}
                  className={`px-4 sm:px-6 py-3 rounded-lg transition flex items-center justify-center space-x-2 ${contactMethod === 'voice' ? 'bg-[#2E8540] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Imię i nazwisko</label>
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
                          placeholder="Opisz swoją sytuację prawną..."
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
                          Wyrażam zgodę na przetwarzanie przez Kancelarię Prawną Gramatowscy moich danych osobowych, podanych w powyższym formularzu, w celach związanych z udzieleniem odpowiedzi na zadane pytanie i świadczenia pomocy prawnej. Przyjmuję do wiadomości, że zgoda może być cofnięta w każdym czasie. Szczegółowe zasady przetwarzania danych osobowych przez Kancelarię Prawną Gramatowscy zawarte są w{' '}
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
                        {isSubmitting ? 'Wysyłanie...' : 'Wyślij zapytanie'}
                      </button>
                      <p className="text-xs text-gray-500 text-center">
                        Odpowiedź w ciągu 24 godzin. Gwarantujemy poufność.
                      </p>
                    </form>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-[#2E8540] mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Dziękujemy za kontakt!</h3>
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Chat z Kancelarią</h3>
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
                    Preferujesz rozmowę telefoniczną? Zadzwoń lub umów się na konsultację.
                  </p>
                  <a href="tel:+48573133556" className="inline-block bg-[#2E8540] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#247032] transition">
                    +48 573 133 556
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="jak-dziala" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Jak działa nasza pomoc prawna?</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">Trzy proste kroki do rozwiązania Twojego problemu</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
            <div className="text-center">
              <div className="bg-[#2E8540] text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6">1</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Zamów konsultację</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Poprzez formularz albo czat zamów i opłać konsultację prawną. Podaj przy tym, jakiego zagadnienia dotyczy Twoja sprawa.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#2E8540] text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6">2</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Wybierz termin konsultacji</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Nasz asystent w ciągu 24 h (lub najbliższy dzień roboczy) skontaktuje się z Tobą i umówi konkretny termin rozmowy z prawnikiem.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#2E8540] text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6">3</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Otrzymaj odpowiedź</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Podczas konsultacji nasz prawnik przeanalizuje Twoją sprawę i przedstawi możliwe rozwiązania
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="uslugi" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Nasze specjalizacje</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">Kompleksowa obsługa prawna dla osób fizycznych</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {SERVICES.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Trust Us */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Dlaczego warto nam zaufać?</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">Co nas wyróżnia na tle innych kancelarii</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-8">
            <div className="text-center">
              <div className="bg-green-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-[#2E8540]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Pełna poufność</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Gwarantujemy tajemnicę zawodową i bezpieczeństwo Twoich danych
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-[#2E8540]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Sprawne działanie</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Szybki kontakt. Analiza problemu i warianty możliwych rozwiązań
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <DollarSign className="h-8 w-8 sm:h-10 sm:w-10 text-[#2E8540]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Przejrzyste ceny</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Znasz koszty przed rozpoczęciem współpracy. Bez ukrytych opłat
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-[#2E8540]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Doświadczenie</h3>
              <p className="text-sm sm:text-base text-gray-600">
                20 lat praktyki i ponad 25000 udzielonych porad
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#2E8540] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">20</div>
              <div className="text-sm sm:text-base text-green-100">Lat doświadczenia</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">25000+</div>
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

      {/* Testimonials */}
      {/* <section id="opinie" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Co mówią nasi klienci</h2>
            <p className="text-xl text-gray-600">Opinie osób, którym pomogliśmy</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <div className="border-t pt-4">
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-[#2E8540]">{testimonial.case}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* FAQ */}
      <section id="faq" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Najczęściej zadawane pytania</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">Odpowiedzi na Twoje wątpliwości</p>
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

      {/* CTA */}
      <section id="kontakt" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#2E8540] to-[#247032] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Potrzebujesz pomocy prawnej?</h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-green-50">
            Nie czekaj. Skontaktuj się z nami już dziś i zyskaj pewność, że Twoja sprawa jest w dobrych rękach.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a href="#" className="bg-white text-[#2E8540] px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center justify-center">
              <Mail className="h-5 w-5 mr-2" />
              Formularz
            </a>
            <a href="tel:+48573133556" className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-[#2E8540] transition inline-flex items-center justify-center">
              <Phone className="h-5 w-5 mr-2" />
              +48 573 133 556
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <img src="/logo.svg" alt="E-Kancelaria Gramatowscy" className="h-8" />
              </div>
              <p className="text-sm sm:text-base text-gray-400">
                Profesjonalna pomoc prawna online dla osób fizycznych w całej Polsce.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-3 sm:mb-4 text-base sm:text-lg">Kontakt</h3>
              <div className="space-y-2">
                <p className="flex items-center text-sm sm:text-base">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  kontakt@gramatowscy.pl
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-3 sm:mb-4 text-base sm:text-lg">Godziny dostępności</h3>
              <div className="space-y-2 text-gray-400">
                <p className="text-sm sm:text-base">Telefon czynny: Pn-Pt: 8:00 - 16:00</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-sm sm:text-base">&copy; 2026 <a href="https://procesflow.pl/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Procesflow</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
