import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const analyzeFood = async () => {
    if (!preview) return;
    setLoading(true);
    setError('');
    try {
      const base64 = preview.split(',')[1];
      const mediaType = preview.split(';')[0].split(':')[1];
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mediaType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'বিশ্লেষণ ব্যর্থ হয়েছে');
      // Store result and image in sessionStorage
      sessionStorage.setItem('calorieResult', JSON.stringify(data));
      sessionStorage.setItem('foodImage', preview);
      router.push('/result');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetImage = () => {
    setPreview(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <Head>
        <title>ক্যালোরি ডিটেক্টর — AI খাদ্য বিশ্লেষক</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="ছবি তুলুন, ক্যালোরি জানুন" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0f" />
      </Head>

      <div style={styles.page}>
        {/* Background decoration */}
        <div style={styles.bgOrb1} />
        <div style={styles.bgOrb2} />

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🔥</span>
            <span style={styles.logoText}>ক্যালোরি<span style={styles.logoAccent}>AI</span></span>
          </div>
          <div style={styles.badge}>Beta</div>
        </header>

        {/* Hero */}
        <main style={styles.main}>
          <div style={styles.heroText}>
            <h1 style={styles.title}>
              খাবারের ছবি তুলুন<br />
              <span style={styles.titleAccent}>ক্যালোরি জানুন</span>
            </h1>
            <p style={styles.subtitle}>
              AI দিয়ে তাৎক্ষণিকভাবে খাদ্যের পুষ্টিমান বিশ্লেষণ করুন
            </p>
          </div>

          {/* Camera / Preview area */}
          {!preview ? (
            <div
              style={{ ...styles.dropZone, ...(dragOver ? styles.dropZoneActive : {}) }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={styles.cameraRing}>
                <div style={styles.cameraRingInner}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#ff6b35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="13" r="4" stroke="#ff6b35" strokeWidth="1.5"/>
                  </svg>
                </div>
              </div>
              <p style={styles.dropText}>ক্যামেরায় ছবি তুলুন</p>
              <p style={styles.dropSubtext}>অথবা গ্যালারি থেকে বেছে নিন</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCapture}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div style={styles.previewContainer}>
              <img src={preview} alt="food" style={styles.previewImg} />
              <button style={styles.changeBtn} onClick={resetImage}>✕ পরিবর্তন করুন</button>
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          {/* Action button */}
          <button
            style={{
              ...styles.analyzeBtn,
              ...(loading ? styles.analyzeBtnLoading : {}),
              ...(!preview ? styles.analyzeBtnDisabled : {}),
            }}
            onClick={analyzeFood}
            disabled={!preview || loading}
          >
            {loading ? (
              <>
                <span style={styles.spinner} />
                বিশ্লেষণ চলছে...
              </>
            ) : (
              <>
                <span>🔍</span>
                ক্যালোরি বিশ্লেষণ করুন
              </>
            )}
          </button>

          {/* Feature chips */}
          <div style={styles.features}>
            {[
              { icon: '⚡', text: 'তাৎক্ষণিক ফলাফল' },
              { icon: '🥗', text: 'পুষ্টিমান বিশ্লেষণ' },
              { icon: '📊', text: 'দৈনিক ট্র্যাকিং' },
              { icon: '💡', text: 'স্বাস্থ্য পরামর্শ' },
            ].map((f, i) => (
              <div key={i} style={styles.chip}>
                <span>{f.icon}</span>
                <span style={styles.chipText}>{f.text}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0f',
    position: 'relative',
    overflow: 'hidden',
    padding: '0 0 60px',
  },
  bgOrb1: {
    position: 'fixed',
    top: '-100px',
    right: '-100px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'fixed',
    bottom: '-80px',
    left: '-80px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    fontSize: '20px',
    color: '#f0f0f8',
  },
  logoIcon: { fontSize: '22px' },
  logoText: { letterSpacing: '-0.5px' },
  logoAccent: { color: '#ff6b35' },
  badge: {
    background: 'rgba(255,107,53,0.15)',
    border: '1px solid rgba(255,107,53,0.3)',
    color: '#ff6b35',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '1px',
  },
  main: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    maxWidth: '480px',
    margin: '0 auto',
  },
  heroText: {
    textAlign: 'center',
    animation: 'fadeUp 0.6s ease forwards',
  },
  title: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '32px',
    fontWeight: 800,
    lineHeight: 1.2,
    color: '#f0f0f8',
    marginBottom: '12px',
  },
  titleAccent: {
    background: 'linear-gradient(90deg, #ff6b35, #ffd60a)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    color: '#888899',
    fontSize: '15px',
    lineHeight: 1.5,
  },
  dropZone: {
    width: '100%',
    background: '#13131a',
    border: '2px dashed rgba(255,107,53,0.3)',
    borderRadius: '24px',
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    animation: 'fadeUp 0.6s ease 0.1s forwards',
    opacity: 0,
  },
  dropZoneActive: {
    border: '2px dashed #ff6b35',
    background: 'rgba(255,107,53,0.05)',
  },
  cameraRing: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'rgba(255,107,53,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'pulse-ring 2.5s ease-in-out infinite',
    marginBottom: '8px',
  },
  cameraRingInner: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'rgba(255,107,53,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropText: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '18px',
    fontWeight: 700,
    color: '#f0f0f8',
  },
  dropSubtext: {
    fontSize: '13px',
    color: '#888899',
  },
  previewContainer: {
    width: '100%',
    position: 'relative',
    borderRadius: '20px',
    overflow: 'hidden',
    animation: 'fadeUp 0.4s ease forwards',
  },
  previewImg: {
    width: '100%',
    maxHeight: '320px',
    objectFit: 'cover',
    display: 'block',
    borderRadius: '20px',
  },
  changeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(0,0,0,0.7)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#f0f0f8',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
  },
  errorBox: {
    width: '100%',
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.3)',
    color: '#f87171',
    padding: '14px 18px',
    borderRadius: '12px',
    fontSize: '14px',
  },
  analyzeBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #ff6b35, #ff8c42)',
    border: 'none',
    color: 'white',
    padding: '18px 24px',
    borderRadius: '16px',
    fontSize: '17px',
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 8px 32px rgba(255,107,53,0.3)',
    transition: 'all 0.2s ease',
    animation: 'fadeUp 0.6s ease 0.2s forwards',
    opacity: 0,
  },
  analyzeBtnDisabled: {
    background: '#1c1c28',
    boxShadow: 'none',
    color: '#888899',
    cursor: 'not-allowed',
    opacity: 0,
    animation: 'fadeUp 0.6s ease 0.2s forwards',
  },
  analyzeBtnLoading: {
    background: 'linear-gradient(135deg, #cc5529, #cc6e33)',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    width: '100%',
    animation: 'fadeUp 0.6s ease 0.3s forwards',
    opacity: 0,
  },
  chip: {
    background: '#13131a',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  chipText: {
    fontSize: '13px',
    color: '#888899',
    fontWeight: 500,
  },
};
