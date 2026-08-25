import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./landing.css";

import logoImg from "../assets/images/logo.png";

// Importation des images locales
import tablette from "../assets/images/landing-page/tab.png";
import mobile from "../assets/images/landing-page/mobile.png";
import windows from "../assets/images/landing-page/ordi.png";

// Importation de VanillaTilt
import VanillaTilt from "vanilla-tilt";

const LandingPage = () => {
  const centerCardRef = useRef(null);

  // 1. Header Sticky au Scroll
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector("header");
      if (window.scrollY > 50) {
        header?.classList.add("sticky");
      } else {
        header?.classList.remove("sticky");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Animation 3D Tilt + Auto-rotation sur la carte centrale
  useEffect(() => {
    const card = centerCardRef.current;
    if (!card) return;

    VanillaTilt.init(card, {
      max: 20,
      speed: 800,
      glare: true,
      "max-glare": 0.4,
      perspective: 1000,
    });

    let angle = 0;
    let animationFrameId;

    const autoTiltLoop = () => {
      angle += 0.02;

      if (!card.matches(":hover")) {
        const tiltX = Math.sin(angle) * 25;
        const tiltY = Math.cos(angle) * 17;

        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1, 1, 1)`;

        const img = card.querySelector("img");
        if (img) {
          img.style.transform = `translate3d(0, 0, 30px) scale(1.02)`;
        }
      }

      animationFrameId = requestAnimationFrame(autoTiltLoop);
    };

    autoTiltLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (card.vanillaTilt) {
        card.vanillaTilt.destroy();
      }
    };
  }, []);

  return (
    <>
      {/* SVG CLIP-PATHS POUR LE STYLE SHOPIFY */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="shopify-curve-clip" clipPathUnits="objectBoundingBox">
            <path
              d="M 0,0 
                 L 1,0 
                 L 1,0.88 
                 C 0.85,0.98 0.70,0.88 0.50,0.90
                 C 0.30,0.92 0.15,0.99 0,0.93 
                 Z"
            />
          </clipPath>

          <clipPath id="shopify-curve-mobile-clip" clipPathUnits="objectBoundingBox">
            <path
              d="M 0,0 
                 L 1,0 
                 L 1,0.94 
                 C 0.85,0.98 0.65,0.92 0.50,0.94
                 C 0.35,0.96 0.15,0.99 0,0.97 
                 Z"
            />
          </clipPath>
        </defs>
      </svg>

      <div className="page-container">

        {/* ── 1. HERO ─────────────────────────────────── */}
        <div className="hero-shopify-wrap">
          <header>
            <div className="logo">
              <img src={logoImg} alt="Logo Adék" className="landing-header-logo" />
              <span><strong>AMBASSADE</strong> DECKON</span>
            </div>
            <nav className="nav-links">
              <a href="#" className="nav-item active">ACCUEIL</a>
              <a href="#fonctionnalites" className="nav-item">FONCTIONNALITÉS</a>
              <a href="/signin" className="nav-item">INSCRIPTION</a>
              <a href="#contact" className="nav-item">CONTACT</a>
            </nav>
          </header>

          <main className="main-content">
            <div className="hero-text-section animate-slide-up">
              <div className="title-container">
                <div className="title-brand-wrap">
                  <div className="title-text-group">
                    <h1 className="main-title">Adék</h1>
                    <h2 className="sub-title">GESTION</h2>
                  </div>
                </div>
              </div>
              <p className="description">
                Gérez facilement les entrées et sorties de vos produits, vos dépenses,
                vos cotisations ainsi que tous les flux financiers de vos financeurs,
                en toute simplicité et avec une vision claire de votre activité.
              </p>

              <div className="download-section">
                <p className="download-label">Télécharger pour</p>
                <div className="download-buttons">
                  <a href="#" className="btn-download" title="Télécharger pour Windows">
                    <i className="fa-brands fa-windows"></i>
                    <span>Windows</span>
                  </a>
                  <a href="#" className="btn-download" title="Télécharger l'application Android bientôt disponible">
                    <i className="fa-brands fa-android"></i>
                    <span>Android</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="cards-gallery animate-fade-in">
              <div className="card card-low">
                <div className="card-badge badge-1">Tablette</div>
                <img src={tablette} alt="Interface Mobile App" />
              </div>

              <div ref={centerCardRef} className="card card-high">
                <div className="card-badge badge-2 highlight">MOBILE</div>
                <img id="img-centre" src={mobile} alt="Interface Desktop App" />
              </div>

              <div className="card card-mid">
                <div className="card-badge badge-3">Windows</div>
                <img src={windows} alt="Interface Web App" />
              </div>
            </div>
          </main>
        </div>

        {/* ── 2. FONCTIONNALITÉS ──────────────────────── */}
        <div id="fonctionnalites" className="fonction-container">
          <div className="hero-left animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <p className="greeting">Fonctionnalité</p>
            <h1>
              Une gestion <span className="highlight">simple</span> et efficace
            </h1>
            <p className="fonctionnalite">
              Adék Gestion vous permet de suivre vos marchandises, vos dépenses,
              vos cotisations et vos mouvements financiers en temps réel à partir
              d'une interface simple et intuitive.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary-video">
                <i className="fa-solid fa-circle-play"></i>
                <span>Voir la vidéo</span>
              </button>
            </div>
          </div>

          <div className="hero-right animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="watermark-play">
              <i className="fa-solid fa-play"></i>
            </div>

            <div className="profile-card">
              <div className="profile-bg-arc"></div>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60"
                alt="Rio - Designer"
                className="profile-img"
              />
            </div>

            <div className="float-badge badge-top">
              <div className="badge-icon icon-green">
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <div className="badge-text">
                <span className="badge-num">Vos marchandises</span>
                <span className="badge-label">Gestion des stocks</span>
              </div>
            </div>

            <div className="float-badge badge-right">
              <div className="badge-icon icon-teal">
                <i className="fa-solid fa-briefcase"></i>
              </div>
              <div className="badge-text">
                <span className="badge-num">Vos dépenses</span>
                <span className="badge-label">Suivi financier</span>
              </div>
            </div>

            <div className="float-badge badge-bottom">
              <div className="badge-icon icon-teal">
                <i className="fa-solid fa-money-bill-wave"></i>
              </div>
              <div className="badge-text">
                <span className="badge-num">Vos cotisations</span>
                <span className="badge-label">Gestion des encaissements</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. SERVICES ─────────────────────────────── */}
        <div className="services-container">
          <div className="services-header animate-slide-up">
            <p className="greeting-light">Nos Expertises Terrain</p>
            <h2>
              Services d'Inventaire et
              <span className="highlight-light"> Accompagnement Opérationnel</span>
            </h2>
            <p className="services-description">
              L'Ambassade Dékon accompagne les entreprises, commerces et organisations
              dans la digitalisation de leur gestion de stock grâce à des interventions
              terrain et à l'utilisation de la plateforme Adék Gestion.
            </p>
          </div>

          <div className="services-grid">
            <div className="service-box animate-fade-in">
              <div className="service-icon">
                <i className="fa-solid fa-mobile-screen-button"></i>
              </div>
              <h3>Digitalisation des stocks</h3>
              <p>
                Organisation et mise en place d'une gestion de stock numérique
                performante à travers la solution Adék Gestion.
              </p>
            </div>
            <div className="service-box animate-fade-in">
              <div className="service-icon">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <h3>Enregistrement des produits</h3>
              <p>
                Prise en charge complète de l'enregistrement et de la structuration
                de l'ensemble de vos produits dans la plateforme en seulement 24 heures.
              </p>
            </div>
            <div className="service-box animate-fade-in">
              <div className="service-icon">
                <i className="fa-solid fa-clipboard-list"></i>
              </div>
              <h3>Inventaire &amp; Recensement</h3>
              <p>
                Comptage physique, contrôle et vérification de vos marchandises
                afin de garantir des données fiables et actualisées.
              </p>
            </div>
            <div className="service-box animate-fade-in">
              <div className="service-icon">
                <i className="fa-solid fa-calendar-check"></i>
              </div>
              <h3>Suivi Périodique</h3>
              <p>
                Mise en place d'inventaires réguliers et de contrôles périodiques
                selon vos besoins : hebdomadaire, mensuel ou trimestriel.
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. QUI SOMMES-NOUS / CARTE ──────────────── */}
        <div id="contact" className="location-container animate-fade-in">
          <div className="location-content">
            <p className="greeting-light">Qui sommes-nous ?</p>
            <h2>
              Notre Complexe <span className="highlight-light">Tech &amp; Matériel</span>
            </h2>

            <p className="location-description">
              <strong>L'Ambassade Dékon</strong> est un hub technologique qui développe
              la solution Adék Gestion, accompagne les entreprises dans la gestion de
              leurs stocks et propose également des services de maintenance et de vente
              de matériel informatique et téléphonique.
            </p>

            <div className="collab-box">
              <div className="collab-icon">
                <i className="fa-solid fa-brain"></i>
              </div>
              <div className="collab-text">
                <h3>Nos domaines d'expertise</h3>
                <ul className="expertise-list">
                  <li>Réparation de téléphones et d'ordinateurs</li>
                  <li>Vente de pièces de rechange et d'accessoires téléphoniques</li>
                  <li>Commercialisation de matériel informatique</li>
                  <li>Développement d'applications web et mobiles</li>
                  <li>Accompagnement à la digitalisation des entreprises</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="location-map-wrap">
            <div className="map-card">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.671343717551!2d1.2223946!3d6.1747!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTAnMjguOCJOIDHCsDEzJzIwLjYiRQ!5e0!3m2!1sfr!2stg!4v1700000000000!5m2!1sfr!2stg"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localisation Ambassade Dékon"
              ></iframe>
              <div className="map-badge">
                <i className="fa-solid fa-location-dot"></i> Quartier Deckon, Lomé - Togo
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER ──────────────────────────────────── */}
        <footer>
          <div className="footer-tag">@SUIVEZ-NOUS</div>
          <div className="social-icons">
            <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
            <a href="#"><i className="fa-brands fa-instagram"></i></a>
            <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
            <a href="#"><i className="fa-brands fa-x-twitter"></i></a>
          </div>
        </footer>

      </div>
    </>
  );
};

export default LandingPage; 