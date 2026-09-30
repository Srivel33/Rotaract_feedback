import Link from 'next/link';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.pageWrapper}>
      {/* Animated Mesh Gradient Background */}
      <div className={styles.meshBackground}>
        <div className={styles.meshBlob1}></div>
        <div className={styles.meshBlob2}></div>
        <div className={styles.meshBlob3}></div>
      </div>

      <main className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={`${styles.logo} ${styles.stagger1}`}>Rotaract SNSCT</div>
          
          <div className={`${styles.mascotWrapper} ${styles.stagger2}`}>
            <div className={styles.mascotHalo}></div>
            <div className={styles.mascotIcon}>🐬</div> 
          </div>

          <h1 className={`${styles.title} ${styles.stagger3}`}>
            ORCA
          </h1>
          <p className={`${styles.subtitle} ${styles.stagger4}`}>
            One Ripple, Countless Action. <br/>
            Your feedback shapes our future. Make your ripple today.
          </p>

          <div className={`${styles.actions} ${styles.stagger5}`}>
            <Link href="/auth" className={styles.magneticButton}>
              Let&apos;s Begin
              <div className={styles.buttonShine}></div>
            </Link>
          </div>
        </div>
      </main>

      <section className={styles.howItWorksSection}>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <div className={styles.cardsGrid}>
          <div className={styles.infoCard}>
            <div className={styles.cardIcon}>🔒</div>
            <h3>1. Log In Seamlessly</h3>
            <p>Access the platform securely using your Rotaract email or Google account.</p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.cardIcon}>📅</div>
            <h3>2. Pick Your Event</h3>
            <p>Browse through recent Rotaract events you attended and select one.</p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.cardIcon}>🌊</div>
            <h3>3. Make Your Ripple</h3>
            <p>Provide interactive feedback and help us shape future initiatives.</p>
          </div>
        </div>
      </section>
      
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Rotaract Club of SNSCT. All rights reserved.</p>
      </footer>
    </div>
  );
}
