import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.pageWrapper}>
      {/* Animated ocean depth blobs */}
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      {/* ── HEADER ── */}
      <header className={styles.header}>
        {/* Inline SVG ORCA logo — no image file needed */}
        <div className={styles.brandLogo}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="18" cy="18" r="18" fill="#00e5ff" fillOpacity="0.15"/>
            <path d="M9 22 C12 14, 20 10, 28 14 C24 16, 22 20, 18 22 C14 24, 10 24, 9 22Z" fill="#00e5ff"/>
            <path d="M14 20 C15 17, 19 15, 23 17 L19 21Z" fill="#001f3f"/>
            <ellipse cx="22" cy="13" rx="2.5" ry="1.5" fill="white" fillOpacity="0.8"/>
          </svg>
          <span className={styles.brandName}>
            ORCA <span className={styles.brandSub}>by Rotaract SNSCT</span>
          </span>
        </div>

        {/* Rotaract gear — inline SVG badge */}
        <div className={styles.rotaractBadge} title="Rotaract Club of SNS College of Technology">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="11" cy="11" r="5" stroke="#00e5ff" strokeWidth="2" fill="none"/>
            <circle cx="11" cy="11" r="2" fill="#00e5ff"/>
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const x1 = 11 + 6.5 * Math.cos(rad);
              const y1 = 11 + 6.5 * Math.sin(rad);
              const x2 = 11 + 9.5 * Math.cos(rad);
              const y2 = 11 + 9.5 * Math.sin(rad);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00e5ff" strokeWidth="2" strokeLinecap="round"/>;
            })}
          </svg>
          <span className={styles.rotaractText}>Rotaract<br/><small>SNSCT</small></span>
        </div>
      </header>

      {/* ── HERO ── */}
      <main className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.tagline}>One Ripple. Countless Action.</p>
          <h1 className={styles.headline}>
            Your voice<br/>
            <span className={styles.accent}>shapes us.</span>
          </h1>
          <p className={styles.body}>
            Share honest feedback after every Rotaract event and help your club grow stronger.
          </p>
          <Link href="/auth" className={styles.cta}>
            Get Started →
          </Link>
        </div>

        {/* Mascot — the clean generated orca illustration */}
        <div className={styles.mascotArea} aria-hidden="true">
          <div className={styles.mascotGlow} />
          <Image
            src="/mascot.jpg"
            alt="ORCA mascot"
            width={320}
            height={320}
            priority
            className={styles.mascotImg}
          />
        </div>
      </main>

      {/* ── BOTTOM WAVE STRIP ── */}
      <div className={styles.waveStrip} aria-hidden="true">
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,80 L0,80 Z" fill="#00b4d8" fillOpacity="0.25"/>
          <path d="M0,55 C150,30 350,70 600,55 C850,40 1050,70 1200,55 L1200,80 L0,80 Z" fill="#0077b6" fillOpacity="0.5"/>
          <path d="M0,70 C300,60 600,80 900,65 C1050,58 1150,72 1200,70 L1200,80 L0,80 Z" fill="#023e8a"/>
        </svg>
      </div>
    </div>
  );
}
