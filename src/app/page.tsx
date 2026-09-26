import Link from 'next/link';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <main className={styles.container}>
      <div className={styles.backgroundRipples}></div>
      <div className={styles.backgroundRipples2}></div>
      
      <div className={styles.content}>
        <div className={styles.logo}>Rotaract SNSCT</div>
        
        <div className={styles.mascotWrapper}>
          {/* Placeholder for the real mascot image later */}
          <div className={styles.mascotIcon}>🐬</div> 
        </div>

        <h1 className={styles.title}>ORCA</h1>
        <p className={styles.subtitle}>
          One Ripple, Countless Action. <br/>
          Your feedback shapes our future. Make your ripple today.
        </p>

        <div className={styles.actions}>
          <Link href="/auth" className="btn-primary">
            Let&apos;s Begin
          </Link>
        </div>
      </div>
    </main>
  );
}
