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
        <div className={styles.brandLogo}>
          <div className={styles.headerLogoWrapper}>
             <Image src="/orca-logo.png" alt="ORCA" fill className={styles.cyanLogo} />
          </div>
        </div>

        <div className={styles.rotaractBadge}>
          <div className={styles.headerLogoWrapperRight}>
             <Image src="/rotaract-logo.png" alt="Rotaract" fill className={styles.cyanLogo} />
          </div>
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

        <div className={styles.mascotArea} aria-hidden="true">
          <div className={styles.mascotGlow} />
          <div className={styles.mainMascotWrapper}>
             <Image src="/orca-logo.png" alt="Orca Mascot" fill priority className={styles.cyanLogoMascot} />
          </div>
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
