import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('beranda');

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const navHeight = 80;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.getAttribute('id'));
          }
        });
      },
      { threshold: 0, rootMargin: `-${navHeight}px 0px -50% 0px` }
    );

    sections.forEach(section => observer.observe(section));

    const handleScroll = () => {
      const isAtBottom = (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 100);
      if (isAtBottom) {
        const lastSection = sections[sections.length - 1];
        if (lastSection) setActiveSection(lastSection.getAttribute('id'));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: 'fa-envelope',
      bg: '#2563EB',
      title: 'Surat Masuk',
      desc: 'Kelola surat masuk secara cepat dan terstruktur.',
    },
    {
      icon: 'fa-paper-plane',
      bg: '#10B981',
      title: 'Surat Keluar',
      desc: 'Pencatatan surat keluar lebih rapi dan terdokumentasi.',
    },
    {
      icon: 'fa-folder',
      bg: '#7C3AED',
      title: 'Disposisi Arsip',
      desc: 'Distribusi surat antar perangkat desa lebih efisien.',
    },
    {
      icon: 'fa-chart-column',
      bg: '#F59E0B',
      title: 'Laporan & Statistik',
      desc: 'Pantau statistik dan riwayat arsip secara akurat.',
    },
  ];

  const benefits = [
    {
      icon: 'fa-bolt',
      iconColor: '#F59E0B',
      bg: '#FEF3C7',
      title: 'Pelayanan Lebih Cepat',
      desc: 'Proses pengelolaan surat lebih cepat tanpa menunggu proses manual.',
    },
    {
      icon: 'fa-shield-halved',
      iconColor: '#10B981',
      bg: '#D1FAE5',
      title: 'Data Lebih Aman',
      desc: 'Penyimpanan digital dengan sistem keamanan yang terjamin.',
    },
    {
      icon: 'fa-folder',
      iconColor: '#F59E0B',
      bg: '#FEF3C7',
      title: 'Arsip Lebih Terstruktur',
      desc: 'Arsip tertata rapi, mudah dicari dan tidak mudah hilang.',
    },
  ];

  const advantages = [
    { icon: 'fa-clipboard', title: 'Transparan', desc: 'Setiap proses arsip dapat dipantau dengan jelas.' },
    { icon: 'fa-clock', title: 'Efisien', desc: 'Menghemat waktu dan biaya operasional.' },
    { icon: 'fa-user', title: 'Mudah Digunakan', desc: 'Antarmuka sederhana dan ramah pengguna.' },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#FFFFFF', color: '#6B7280', lineHeight: 1.5 }}>

      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: '#FFFFFF', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', height: 72, maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifySelf: 'start' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(30,58,95,0.15)' }}>
              <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1E3A5F', lineHeight: 1.2, letterSpacing: 0.5 }}>E-ARSIP DESA</div>
              <div style={{ fontSize: 10, color: '#6B7280', lineHeight: 1.2 }}>Desa Karangasem</div>
            </div>
          </div>
          <ul style={{ display: 'flex', alignItems: 'center', gap: 36, listStyle: 'none', justifySelf: 'center', margin: 0, padding: 0 }}>
            {[
              { id: 'beranda', label: 'Beranda' },
              { id: 'fitur', label: 'Fitur' },
              { id: 'manfaat', label: 'Manfaat' },
              { id: 'tentang', label: 'Tentang' },
            ].map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => { e.preventDefault(); scrollTo(item.id); }}
                    style={{ fontSize: 15, fontWeight: 500, color: isActive ? '#111827' : '#6B7280', textDecoration: 'none', padding: '6px 0', position: 'relative' }}
                  >
                    {item.label}
                    {isActive && <span style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 2.5, background: '#1E3A5F', borderRadius: 2, display: 'block' }}></span>}
                  </a>
                </li>
              );
            })}
          </ul>
          <div style={{ justifySelf: 'end' }}></div>
        </div>
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section id="beranda" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, alignItems: 'stretch', minHeight: 500, margin: 0, padding: 0, background: 'linear-gradient(160deg, #F0F4F8 0%, #E8F0FE 40%, #DBEAFE 100%)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '50px 60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#2563EB', letterSpacing: '1.5px', marginBottom: 20, textTransform: 'uppercase' }}>
            <i className="fa-solid fa-building" style={{ fontSize: 14 }}></i>
            SISTEM PEMERINTAHAN DESA DIGITAL
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 700, color: '#111827', lineHeight: 1.1, margin: 0 }}>E-Arsip Desa</h1>
          <h1 style={{ fontSize: 44, fontWeight: 700, color: '#1E3A5F', lineHeight: 1.1, margin: 0 }}>Karangasem</h1>
          <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.7, marginTop: 20, maxWidth: 480 }}>
            Sistem Pengelolaan Arsip Digital untuk Administrasi Desa yang Lebih Cepat, Tertata, dan Transparan
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#1E3A5F', color: 'white', fontSize: 15, fontWeight: 600, padding: '14px 28px', borderRadius: 12, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(30,58,95,0.3)' }}>
              <i className="fa-solid fa-right-to-bracket"></i>
              Masuk ke Sistem
            </button>
            <button onClick={() => scrollTo('fitur')} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#FFFFFF', color: '#1E3A5F', fontSize: 15, fontWeight: 600, padding: '14px 28px', borderRadius: 12, border: '1.5px solid #1E3A5F', cursor: 'pointer' }}>
              <i className="fa-solid fa-arrow-right"></i>
              Pelajari Fitur
            </button>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 32, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6B7280' }}><i className="fa-solid fa-shield-halved" style={{ color: '#10B981', fontSize: 15 }}></i> Aman &amp; Terpercaya</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6B7280' }}><i className="fa-regular fa-calendar" style={{ color: '#10B981', fontSize: 15 }}></i> Tertata &amp; Rapi</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6B7280' }}><i className="fa-regular fa-circle-check" style={{ color: '#10B981', fontSize: 15 }}></i> Mudah Diakses</span>
          </div>
        </div>
        <div style={{ position: 'relative', overflow: 'hidden', height: '100%', minHeight: 500, padding: 0, margin: 0 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '30%', height: '100%', background: 'linear-gradient(to right, #ffffff 0%, transparent 100%)', zIndex: 1, pointerEvents: 'none' }}></div>
          <img src="/kantor.png" alt="Kantor Kepala Desa Karangasem" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block' }} />
        </div>
      </section>

      {/* ═══════════════════════ SECTION DIVIDER ═══════════════════════ */}
      <div className="section-divider"></div>

      {/* ═══════════════════ FITUR UNGGULAN ═══════════════════ */}
      <section id="fitur" style={{ padding: '80px 0', background: 'linear-gradient(180deg, #F8FAFE 0%, #FFFFFF 50px, #FFFFFF 100%)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>Fitur Unggulan</h2>
            <div style={{ width: 56, height: 4, background: '#F59E0B', borderRadius: 3, margin: '12px auto 14px' }}></div>
            <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 500, margin: '0 auto' }}>Seluruh kebutuhan pengarsipan desa dalam satu platform digital</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card" style={{ background: '#FFFFFF', border: '1px solid #e2e8f0', borderRadius: 16, padding: '32px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', marginBottom: 18, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <i className={`fa-solid ${f.icon}`}></i>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ SECTION DIVIDER ═══════════════════════ */}
      <div className="section-divider"></div>

      {/* ═══════════════════ MANFAAT ═══════════════════ */}
      <section id="manfaat" style={{ padding: '80px 0', background: 'linear-gradient(180deg, #FFFFFF 0%, #F3F6FA 50px, #EEF2F7 100%)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>Manfaat Menggunakan E-Arsip Desa</h2>
            <div style={{ width: 56, height: 4, background: '#F59E0B', borderRadius: 3, margin: '12px auto 14px' }}></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, margin: '0 auto 16px' }}>
                  <i className={`fa-solid ${b.icon}`} style={{ color: b.iconColor }}></i>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>{b.title}</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: '0 auto', maxWidth: 300 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ SECTION DIVIDER ═══════════════════════ */}
      <div className="section-divider"></div>

      {/* ═══════════════════ TENTANG SISTEM ═══════════════════ */}
      <section id="tentang" style={{ padding: '80px 0', background: 'linear-gradient(180deg, #F5F8FC 0%, #FFFFFF 50px, #F0F4FA 100%)', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 64, alignItems: 'center' }}>
          <div style={{ flex: '0 0 40%', maxWidth: '40%' }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 30px rgba(30,58,95,0.12)' }}>
              <img src="/kantor.png" alt="Kantor Kepala Desa Karangasem" style={{ width: '100%', display: 'block', borderRadius: 16 }} />
            </div>
          </div>
          <div style={{ flex: '0 0 60%', maxWidth: '60%' }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>Tentang Sistem</h2>
            <div style={{ width: 48, height: 4, background: '#F59E0B', borderRadius: 3, margin: '12px 0 20px' }}></div>
            <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.8, marginBottom: 28 }}>
              E-Arsip Desa Karangasem dikembangkan untuk mendukung transformasi digital administrasi desa melalui pengelolaan arsip yang efisien, transparan, dan akuntabel.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              {advantages.map((a, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, color: '#1E3A5F', marginBottom: 8 }}><i className={`fa-solid ${a.icon}`}></i></div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>{a.title}</h4>
                  <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, margin: 0 }}>{a.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
                <i className="fa-solid fa-users" style={{ color: '#1E3A5F', fontSize: 18 }}></i>
                <span>3 Role Pengguna — Sistem dirancang untuk mendukung berbagai peran di desa.</span>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 20px', minWidth: 120, borderRadius: 50, background: '#DBEAFE', color: '#1E40AF', textAlign: 'center', lineHeight: 1.2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Admin</span>
                  <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.8 }}>Kepala Desa</span>
                </div>
                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 20px', minWidth: 120, borderRadius: 50, background: '#D1FAE5', color: '#065F46', textAlign: 'center', lineHeight: 1.2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Operator</span>
                  <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.8 }}>Kelola Arsip</span>
                </div>
                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 20px', minWidth: 120, borderRadius: 50, background: '#EDE9FE', color: '#5B21B6', textAlign: 'center', lineHeight: 1.2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Pengguna</span>
                  <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.8 }}>Perangkat Desa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ SECTION DIVIDER ═══════════════════════ */}
      <div className="section-divider"></div>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)', padding: '56px 0 0', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>E-ARSIP DESA</div>
                  <div style={{ fontSize: 9, color: '#94A3B8', lineHeight: 1.2 }}>Desa Karangasem</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7, marginBottom: 18 }}>
                Sistem pengelolaan arsip digital untuk mewujudkan administrasi desa yang modern, transparan, dan terpercaya.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <a href="#" style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #475569', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 14, textDecoration: 'none' }}><i className="fa-brands fa-facebook-f"></i></a>
                <a href="#" style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #475569', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 14, textDecoration: 'none' }}><i className="fa-brands fa-instagram"></i></a>
                <a href="#" style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #475569', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 14, textDecoration: 'none' }}><i className="fa-brands fa-youtube"></i></a>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 18 }}>Menu</h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {['Beranda', 'Fitur', 'Manfaat', 'Tentang'].map((item, i) => (
                  <li key={i} style={{ marginBottom: 10 }}>
                    <a href={`#${item.toLowerCase()}`} onClick={(e) => { e.preventDefault(); scrollTo(item.toLowerCase()); }} style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 18 }}>Layanan</h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                <li style={{ marginBottom: 10, fontSize: 13, color: '#94A3B8' }}>Surat Masuk</li>
                <li style={{ marginBottom: 10, fontSize: 13, color: '#94A3B8' }}>Surat Keluar</li>
                <li style={{ marginBottom: 10, fontSize: 13, color: '#94A3B8' }}>Disposisi Arsip</li>
                <li style={{ marginBottom: 10, fontSize: 13, color: '#94A3B8' }}>Laporan &amp; Statistik</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 18 }}>Kontak</h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                <li style={{ marginBottom: 10, fontSize: 13, color: '#94A3B8', display: 'flex', gap: 10, alignItems: 'flex-start' }}><i className="fa-solid fa-phone" style={{ marginTop: 3, width: 14 }}></i> (0285) 1234 5678</li>
                <li style={{ marginBottom: 10, fontSize: 13, color: '#94A3B8', display: 'flex', gap: 10, alignItems: 'flex-start' }}><i className="fa-solid fa-envelope" style={{ marginTop: 3, width: 14 }}></i> admin@karangasem.desa.id</li>
                <li style={{ marginBottom: 10, fontSize: 13, color: '#94A3B8', display: 'flex', gap: 10, alignItems: 'flex-start' }}><i className="fa-solid fa-location-dot" style={{ marginTop: 3, width: 14 }}></i> Jl. Raya Karangasem No. 01, Kec. Talun, Kab. Pekalongan 51175</li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #334155', marginTop: 40, padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>&copy; 2026 E-Arsip Desa Karangasem. All rights reserved.</p>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>Dikembangkan untuk mendukung transformasi digital desa <span style={{ color: '#EF4444' }}><i className="fa-solid fa-heart"></i></span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}