import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Result() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [image, setImage] = useState(null);
  const [todayTotal, setTodayTotal] = useState(0);
  const [log, setLog] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const result = sessionStorage.getItem('calorieResult');
    const img = sessionStorage.getItem('foodImage');
    if (!result) { router.push('/'); return; }
    setData(JSON.parse(result));
    setImage(img);
    // Load today's log
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem('calorieLog') || '[]');
    const todayLog = stored.filter(e => e.date === today);
    setLog(todayLog);
    const total = todayLog.reduce((s, e) => s + e.calories, 0);
    setTodayTotal(total);
  }, []);

  const saveToLog = () => {
    if (!data || saved) return;
    const today = new Date().toDateString();
    const entry = {
      id: Date.now(),
      date: today,
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      name: data.foodName,
      calories: data.calories,
      emoji: data.emoji || '🍽️',
    };
    const stored = JSON.parse(localStorage.getItem('calorieLog') || '[]');
    stored.push(entry);
    localStorage.setItem('calorieLog', JSON.stringify(stored));
    setTodayTotal(t => t + data.calories);
    setLog(l => [...l, entry]);
    setSaved(true);
  };

  if (!data) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,107,53,0.3)', borderTopColor: '#ff6b35', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const dailyGoal = 2000;
  const percentage = Math.min(((todayTotal + (saved ? 0 : data.calories)) / dailyGoal) * 100, 100);
  const remaining = dailyGoal - todayTotal - (saved ? 0 : data.calories);
  const calorieColor = data.calories < 200 ? '#4ade80' : data.calories < 500 ? '#ffd60a' : '#f87171';

  const macros = [
    { label: 'প্রোটিন', value: data.protein, unit: 'গ্রাম', color: '#60a5fa', icon: '💪' },
    { label: 'কার্বোহাইড্রেট', value: data.carbs, unit: 'গ্রাম', color: '#ffd60a', icon: '⚡' },
    { label: 'ফ্যাট', value: data.fat, unit: 'গ্রাম', color: '#f87171', icon: '🫧' },
    { label: 'ফাইবার', value: data.fiber || '—', unit: data.fiber ? 'গ্রাম' : '', color: '#4ade80', icon: '🌿' },
  ];

  return (
    <>
      <Head>
        <title>{data.foodName} — ক্যালোরি ফলাফল</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <div style={styles.page}>
        <div style={styles.bgOrb1} />

        {/* Header */}
        <header style={styles.header}>
          <button style={styles.backBtn} onClick={() => router.push('/')}>
            ← ফিরে যান
          </button>
          <span style={styles.headerTitle}>বিশ্লেষণ ফলাফল</span>
          <div style={{ width: 80 }} />
        </header>

        <main style={styles.main}>
          {/* Food image + name */}
          {image && (
            <div style={styles.imageCard}>
              <img src={image} alt="food" style={styles.foodImg} />
              <div style={styles.imageOverlay}>
                <span style={styles.foodEmoji}>{data.emoji || '🍽️'}</span>
                <h2 style={styles.foodName}>{data.foodName}</h2>
                {data.portion && <p style={styles.portion}>{data.portion}</p>}
              </div>
            </div>
          )}

          {/* Calorie hero */}
          <div style={styles.calorieCard}>
            <p style={styles.calorieLabel}>মোট ক্যালোরি</p>
            <div style={styles.calorieValue}>
              <span style={{ ...styles.calorieNumber, color: calorieColor }}>{data.calories}</span>
              <span style={styles.calorieUnit}>kcal</span>
            </div>
            <div style={styles.calorieBar}>
              <div style={{ ...styles.calorieBarFill, width: `${Math.min((data.calories / 800) * 100, 100)}%`, background: calorieColor }} />
            </div>
            <p style={styles.calorieNote}>
              {data.calories < 200 ? '✅ কম ক্যালোরি — স্বাস্থ্যকর পছন্দ!' :
               data.calories < 500 ? '⚠️ মাঝারি ক্যালোরি' :
               '🔴 উচ্চ ক্যালোরি — পরিমাণে খান'}
            </p>
          </div>

          {/* Macros grid */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>পুষ্টিমান বিবরণ</h3>
            <div style={styles.macrosGrid}>
              {macros.map((m, i) => (
                <div key={i} style={styles.macroCard}>
                  <span style={styles.macroIcon}>{m.icon}</span>
                  <span style={{ ...styles.macroValue, color: m.color }}>{m.value}{m.unit && <span style={styles.macroUnit}>{m.unit}</span>}</span>
                  <span style={styles.macroLabel}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily tracker */}
          <div style={styles.trackerCard}>
            <div style={styles.trackerHeader}>
              <span style={styles.trackerTitle}>📅 আজকের ক্যালোরি ট্র্যাকার</span>
              <span style={styles.trackerGoal}>{dailyGoal} kcal লক্ষ্য</span>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${percentage}%` }} />
            </div>
            <div style={styles.trackerStats}>
              <div>
                <span style={styles.trackerNum}>{todayTotal + (saved ? 0 : data.calories)}</span>
                <span style={styles.trackerSub}> গ্রহণ</span>
              </div>
              <div>
                <span style={{ ...styles.trackerNum, color: remaining >= 0 ? '#4ade80' : '#f87171' }}>{Math.abs(remaining)}</span>
                <span style={styles.trackerSub}> {remaining >= 0 ? 'বাকি' : 'বেশি'}</span>
              </div>
            </div>
          </div>

          {/* Health advice */}
          {data.advice && (
            <div style={styles.adviceCard}>
              <h3 style={styles.adviceTitle}>💡 স্বাস্থ্য পরামর্শ</h3>
              <p style={styles.adviceText}>{data.advice}</p>
            </div>
          )}

          {/* Ingredients */}
          {data.ingredients && data.ingredients.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🧪 সম্ভাব্য উপাদান</h3>
              <div style={styles.tagCloud}>
                {data.ingredients.map((ing, i) => (
                  <span key={i} style={styles.tag}>{ing}</span>
                ))}
              </div>
            </div>
          )}

          {/* Alternatives */}
          {data.healthyAlternatives && (
            <div style={styles.altCard}>
              <h3 style={styles.altTitle}>🥗 স্বাস্থ্যকর বিকল্প</h3>
              <p style={styles.altText}>{data.healthyAlternatives}</p>
            </div>
          )}

          {/* Action buttons */}
          <div style={styles.actions}>
            <button
              style={{ ...styles.saveBtn, ...(saved ? styles.saveBtnDone : {}) }}
              onClick={saveToLog}
              disabled={saved}
            >
              {saved ? '✅ লগে যোগ হয়েছে' : '+ আজকের লগে যোগ করুন'}
            </button>
            <button style={styles.newScanBtn} onClick={() => router.push('/')}>
              📸 নতুন স্ক্যান
            </button>
          </div>

          {/* Today's log */}
          {log.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🕐 আজকের খাবার তালিকা</h3>
              {log.map((entry) => (
                <div key={entry.id} style={styles.logItem}>
                  <span style={styles.logEmoji}>{entry.emoji}</span>
                  <div style={styles.logInfo}>
                    <span style={styles.logName}>{entry.name}</span>
                    <span style={styles.logTime}>{entry.time}</span>
                  </div>
                  <span style={styles.logCal}>{entry.calories} kcal</span>
                </div>
              ))}
            </div>
          )}
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
    paddingBottom: '60px',
  },
  bgOrb1: {
    position: 'fixed',
    top: '-60px',
    right: '-60px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    position: 'sticky',
    top: 0,
    background: 'rgba(10,10,15,0.95)',
    backdropFilter: 'blur(12px)',
    zIndex: 10,
  },
  backBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#f0f0f8',
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  headerTitle: {
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    fontSize: '16px',
    color: '#f0f0f8',
  },
  main: {
    padding: '20px',
    maxWidth: '480px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  imageCard: {
    position: 'relative',
    borderRadius: '20px',
    overflow: 'hidden',
    animation: 'fadeUp 0.5s ease forwards',
  },
  foodImg: {
    width: '100%',
    height: '220px',
    objectFit: 'cover',
    display: 'block',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
    padding: '20px 16px 16px',
  },
  foodEmoji: { fontSize: '28px' },
  foodName: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '22px',
    fontWeight: 800,
    color: 'white',
    marginTop: '4px',
  },
  portion: { fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginTop: '2px' },
  calorieCard: {
    background: '#13131a',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px',
    padding: '24px',
    textAlign: 'center',
    animation: 'fadeUp 0.5s ease 0.1s forwards',
    opacity: 0,
  },
  calorieLabel: { color: '#888899', fontSize: '13px', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' },
  calorieValue: { display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '6px', marginBottom: '16px' },
  calorieNumber: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '64px',
    fontWeight: 800,
    lineHeight: 1,
    animation: 'countUp 0.6s ease 0.3s both',
  },
  calorieUnit: { color: '#888899', fontSize: '18px', fontWeight: 500 },
  calorieBar: { height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' },
  calorieBarFill: { height: '100%', borderRadius: '3px', transition: 'width 1s ease' },
  calorieNote: { fontSize: '14px', color: '#888899' },
  section: {
    animation: 'fadeUp 0.5s ease 0.15s forwards',
    opacity: 0,
  },
  sectionTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '15px',
    fontWeight: 700,
    color: '#f0f0f8',
    marginBottom: '12px',
    letterSpacing: '0.3px',
  },
  macrosGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  macroCard: {
    background: '#13131a',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  macroIcon: { fontSize: '20px' },
  macroValue: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '24px',
    fontWeight: 800,
    lineHeight: 1.2,
  },
  macroUnit: { fontSize: '13px', fontWeight: 400, marginLeft: '2px', color: '#888899' },
  macroLabel: { fontSize: '12px', color: '#888899' },
  trackerCard: {
    background: '#13131a',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px',
    padding: '20px',
    animation: 'fadeUp 0.5s ease 0.2s forwards',
    opacity: 0,
  },
  trackerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  trackerTitle: { fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#f0f0f8' },
  trackerGoal: { fontSize: '12px', color: '#888899' },
  progressBar: {
    height: '8px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '14px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    background: 'linear-gradient(90deg, #ff6b35, #ffd60a)',
    transition: 'width 1s ease',
  },
  trackerStats: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  trackerNum: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '20px',
    fontWeight: 800,
    color: '#f0f0f8',
  },
  trackerSub: { fontSize: '13px', color: '#888899' },
  adviceCard: {
    background: 'linear-gradient(135deg, rgba(96,165,250,0.08), rgba(167,139,250,0.08))',
    border: '1px solid rgba(96,165,250,0.2)',
    borderRadius: '16px',
    padding: '18px',
    animation: 'fadeUp 0.5s ease 0.25s forwards',
    opacity: 0,
  },
  adviceTitle: { fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#60a5fa', marginBottom: '8px' },
  adviceText: { fontSize: '14px', color: '#c0c0d0', lineHeight: 1.6 },
  tagCloud: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tag: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#c0c0d0',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
  },
  altCard: {
    background: 'rgba(74,222,128,0.07)',
    border: '1px solid rgba(74,222,128,0.2)',
    borderRadius: '16px',
    padding: '18px',
    animation: 'fadeUp 0.5s ease 0.3s forwards',
    opacity: 0,
  },
  altTitle: { fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#4ade80', marginBottom: '8px' },
  altText: { fontSize: '14px', color: '#c0c0d0', lineHeight: 1.6 },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    animation: 'fadeUp 0.5s ease 0.35s forwards',
    opacity: 0,
  },
  saveBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #ff6b35, #ff8c42)',
    border: 'none',
    color: 'white',
    padding: '16px',
    borderRadius: '14px',
    fontSize: '16px',
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 24px rgba(255,107,53,0.25)',
  },
  saveBtnDone: {
    background: 'rgba(74,222,128,0.15)',
    boxShadow: 'none',
    color: '#4ade80',
    border: '1px solid rgba(74,222,128,0.3)',
  },
  newScanBtn: {
    width: '100%',
    background: '#13131a',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#f0f0f8',
    padding: '14px',
    borderRadius: '14px',
    fontSize: '15px',
    fontFamily: 'Syne, sans-serif',
    fontWeight: 600,
    cursor: 'pointer',
  },
  logItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#13131a',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '12px 14px',
    marginBottom: '8px',
  },
  logEmoji: { fontSize: '22px' },
  logInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  logName: { fontSize: '14px', fontWeight: 600, color: '#f0f0f8' },
  logTime: { fontSize: '12px', color: '#888899' },
  logCal: { fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#ff6b35' },
};
