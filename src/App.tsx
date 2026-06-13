/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { TrustWidget } from './components/sections/TrustWidget';
import { Services } from './components/sections/Services';
import { WhatWeDo } from './components/sections/WhatWeDo';
import { Portfolio } from './components/sections/Portfolio';
import { Testimonials } from './components/sections/Testimonials';
import { Contact } from './components/sections/Contact';
import { Newsletter } from './components/sections/Newsletter';
import { About as AboutPage } from './components/pages/About';
import { Login as LoginPage } from './components/pages/Login';
import { NotFound as NotFoundPage } from './components/pages/NotFound';
import { Pricing as PricingPage } from './components/pages/Pricing';
import { Privacy as PrivacyPage } from './components/pages/Privacy';
import { Cookies as CookiesPage } from './components/pages/Cookies';
import { Terms as TermsPage } from './components/pages/Terms';
import { ProjectDetails as ProjectDetailsPage } from './components/pages/ProjectDetails';
import { ProjectHub } from './components/pages/ProjectHub';
import { Footer } from './components/layout/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Maintenance as MaintenancePage } from './components/pages/Maintenance';
import { BackToTop } from './components/ui/BackToTop';
import { Preloader } from './components/ui/Preloader';
import { CookieConsent } from './components/ui/CookieConsent';
import { WhatsAppButton } from './components/ui/WhatsAppButton';
import { motion, useScroll, useSpring } from 'motion/react';
import { useState, useEffect } from 'react';
import { doc, getDocFromServer, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();

    const unsubSettings = onSnapshot(doc(db, 'settings', 'company-legal'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setShowMaintenance(!!data.showMaintenance);
      }
    });

    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      unsubSettings();
    };
  }, []);

  const isAdmin = currentHash === '#admin';
  const isAbout = currentHash === '#about';
  const isLogin = currentHash === '#login';
  const isWork = currentHash === '#work' || currentHash === '#work-archive';
  const isServices = currentHash === '#services';
  const isPricing = currentHash === '#pricing';
  const isContact = currentHash === '#contact';
  const isPrivacy = currentHash === '#privacy';
  const isCookies = currentHash === '#cookies';
  const isTerms = currentHash === '#terms';
  const isProjectDetail = currentHash.startsWith('#project/');
  const projectIdRaw = isProjectDetail ? currentHash.replace('#project/', '') : null;
  const projectId = projectIdRaw ? projectIdRaw.split('?')[0] : null;
  const isProjectHub = currentHash.startsWith('#project-hub/');
  const hubProjectIdRaw = isProjectHub ? currentHash.replace('#project-hub/', '') : null;
  const hubProjectId = hubProjectIdRaw ? hubProjectIdRaw.split('?')[0] : null;

  const validHashes = ['', '#admin', '#about', '#login', '#work', '#work-archive', '#services', '#pricing', '#contact', '#privacy', '#cookies', '#terms'];
  const is404 = !validHashes.includes(currentHash) && !isProjectDetail && !isProjectHub;

  try {
    if (isAdmin) {
      return <AdminDashboard onLogout={() => { window.location.hash = ''; }} />;
    }

    if (showMaintenance && !isLogin) {
      return <MaintenancePage />;
    }

    if (isProjectHub && hubProjectId) {
      return (
        <div className="relative min-h-screen bg-zarco-black selection:bg-zarco-cyan/30 text-white overflow-hidden">
          <Preloader />
          <WhatsAppButton />
          {/* Ambient Background Glows */}
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-zarco-cyan/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-zarco-purple/10 rounded-full blur-[150px] pointer-events-none" />
          <main>
            <ProjectHub projectId={hubProjectId} />
          </main>
          <BackToTop />
        </div>
      );
    }

    return (
      <div className="relative min-h-screen bg-zarco-black selection:bg-zarco-cyan/30 text-white overflow-hidden">
        <Preloader />
        <CookieConsent />
        <WhatsAppButton />
        {/* Ambient Background Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-zarco-cyan/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-zarco-purple/10 rounded-full blur-[150px] pointer-events-none" />

        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-zarco-cyan origin-left z-[60] shadow-[0_0_10px_rgba(34,211,238,0.5)]"
          style={{ scaleX }}
        />
        
        <Navbar />
        
        <main>
          {isLogin ? (
            <LoginPage />
          ) : isAbout ? (
            <AboutPage />
          ) : isProjectDetail && projectId ? (
            <ProjectDetailsPage projectId={projectId} />
          ) : isWork ? (
            <div className="pt-32 min-h-[70vh]">
              <Portfolio featuredOnly={false} />
            </div>
          ) : isServices ? (
            <div className="pt-32 min-h-[70vh]">
              <Services />
            </div>
          ) : isPricing ? (
            <PricingPage />
          ) : isPrivacy ? (
            <PrivacyPage />
          ) : isCookies ? (
            <CookiesPage />
          ) : isTerms ? (
            <TermsPage />
          ) : isContact ? (
            <div className="pt-32 min-h-[70vh]">
              <Contact />
            </div>
          ) : is404 ? (
            <NotFoundPage />
          ) : (
            <>
              <Hero />
              <TrustWidget />
              <Services />
              <WhatWeDo />
              <div id="pricing-section">
                <PricingPage />
              </div>
              <Portfolio featuredOnly={true} />
              <Testimonials />
              <Contact />
              <Newsletter />
            </>
          )}
        </main>

        <Footer />
        <BackToTop />
      </div>
    );
  } catch (err) {
    console.error("App render error:", err);
    return <div className="p-20 text-white bg-black min-h-screen">Error rendering app. Check console.</div>;
  }
}
