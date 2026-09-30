import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <div className={styles.logoLeft}>
          <Image src="/orca-logo.png" alt="ORCA Logo" width={180} height={80} style={{ objectFit: 'contain', filter: 'invert(1)', mixBlendMode: 'screen' }} />
        </div>
        <div className={styles.logoRight}>
          <Image src="/rotaract-logo.png" alt="Rotaract Logo" width={150} height={60} style={{ objectFit: 'contain', filter: 'invert(1)', mixBlendMode: 'screen' }} />
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.textContent}>
          <h1 className={styles.title}>
            Empower your<br/>
            Rotaract<br/>
            <span className={styles.highlight}>journey</span>
          </h1>
          <p className={styles.subtitle}>
            Every ripple creates a wave.<br />
            Share your insights to help us build better events, stronger communities, and impactful actions.
          </p>
        </div>

        <div className={styles.illustrationWrapper}>
          <div className={styles.speechBubble}>
            Hi, I&apos;m <strong>Orca</strong>!<br />
            Ready to make some waves?
          </div>
          <div className={styles.mascot}>
            <Image src="/mascot.jpg" alt="Orca Mascot" width={250} height={250} style={{ objectFit: 'contain', mixBlendMode: 'screen', borderRadius: '50%' }} />
          </div>
        </div>
      </main>

      <div className={styles.footerAction}>
        <Link href="/auth" className={styles.beginButton}>
          Let&apos;s Begin &rarr;
        </Link>
      </div>

      {/* Decorative SVG Waves at the bottom */}
      <div className={styles.wavesContainer}>
         <svg className={styles.waves} xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
            <defs>
               <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
            </defs>
            <g className={styles.parallax}>
               <use href="#gentle-wave" x="48" y="0" fill="rgba(0, 180, 216, 0.2)" />
               <use href="#gentle-wave" x="48" y="3" fill="rgba(0, 180, 216, 0.4)" />
               <use href="#gentle-wave" x="48" y="5" fill="rgba(0, 180, 216, 0.6)" />
               <use href="#gentle-wave" x="48" y="7" fill="var(--color-ocean-blue)" />
            </g>
         </svg>
      </div>
    </div>
  );
}
