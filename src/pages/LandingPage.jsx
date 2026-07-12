import React, { useEffect, useRef } from "react";
import "./landing.css";

// Import de vos images
import tablette from "../assets/images/landing-page/tablette.png";
import mobile from "../assets/images/landing-page/mobile.png";
import windows from "../assets/images/landing-page/windows.png";

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

  // 2. Animation 3D Tilt + Auto-rotation sans conflit
  useEffect(() => {
    const card = centerCardRef.current;
    if (!card) return;

    // Initialisation VanillaTilt
    VanillaTilt.init(card, {
      max: 20,
      speed: 800,
      glare: true,
      "max-glare": 0.4,
      perspective: 1000,
    });

    let angle = 0;
    let animationFrameId;
    let isHovered = false;

    const handleMouseEnter = () => { isHovered = true; };
    const handleMouseLeave = () => { isHovered = false; };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    const autoTiltLoop = () => {
      if (!isHovered) {
        angle += 0.02;
        const tiltX = Math.sin(angle) * 15;
        const tiltY = Math.cos(angle) * 10;

        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

        const img = card.querySelector("img");
        if (img) {
          img.style.transform = `translate3d(0, 0, 20px)`;
        }
      }
      animationFrameId = requestAnimationFrame(autoTiltLoop);
    };

    autoTiltLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
      if (card.vanillaTilt) {
        card.vanillaTilt.destroy();
      }
    };
  }, []);

  return (
    <div className="page-container">
      {/* 1. SECTION HERO SHOPIFY */}
      <div className="hero-shopify-wrap">
        <header>
          <div className="logo">
            <i className="fa-solid fa-compass"></i>
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
              <h1 className="main-title">Adék</h1>
              <h2 className="sub-title">GESTION</h2>
            </div>
            <p className="description">
              Gérez facilement les entrées et sorties de vos produits, vos dépenses, vos cotisations ainsi que tous les flux financiers de vos financeurs, en toute simplicité et avec une vision claire de votre activité.
            </p>

            <div className="download-section">
              <p className="download-label">Disponible sur toutes vos plateformes</p>
              <div className="download-buttons">
                <a href="#" className="btn-download" title="Télécharger sur Mobile">
                  <i className="fa-solid fa-mobile-button"></i>
                  <span>Mobile</span>
                </a>
                <a href="#" className="btn-download" title="Télécharger pour Windows">
                  <i className="fa-brands fa-windows"></i>
                  <span>Windows</span>
                </a>
                <a href="/signin" className="btn-download" title="Accéder à la version Web">
                  <i className="fa-solid fa-globe"></i>
                  <span>Web App</span>
                </a>
              </div>
            </div>
          </div>

          <div className="cards-gallery animate-fade-in">
            <div className="card card-low">
              <div className="card-badge badge-1">MOBILE</div>
              <img src={tablette} alt="Interface Mobile App" />
            </div>

            <div ref={centerCardRef} className="card card-high">
              <div className="card-badge badge-2 highlight">DESKTOP</div>
              <img id="img-centre" src={mobile} alt="Interface Windows App" />
            </div>

            <div className="card card-mid">
              <div className="card-badge badge-3">WEB</div>
              <img src={windows} alt="Interface Web App" />
            </div>
          </div>
        </main>
      </div>

      {/* 2. SECTION FONCTIONNALITÉS */}
      <div id="fonctionnalites" className="fonction-container">
        <div className="hero-left animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <p className="greeting">Fonctionnalité</p>
          <h1>Une gestion <span className="highlight">simple</span> et efficace</h1>
          <p className="fonctionnalite">
            Adék Gestion vous permet de suivre vos marchandises, vos dépenses, vos cotisations et vos mouvements financiers en temps réel à partir d'une interface simple et intuitive.
          </p>
          <div className="cta-buttons">
            <button className="btn btn-primary-video">
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
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60" alt="Rio - Designer" className="profile-img" />
          </div>

          <div className="badge badge-top">
            <div className="badge-icon icon-green"><i className="fa-solid fa-layer-group"></i></div>
            <div className="badge-text">
              <span className="badge-num">Vos marchandises</span>
              <span className="badge-label">Gestion des stocks</span>
            </div>
          </div>

          <div className="badge badge-right">
            <div className="badge-icon icon-teal"><i className="fa-solid fa-briefcase"></i></div>
            <div className="badge-text">
              <span className="badge-num">Vos dépenses</span>
              <span className="badge-label">Suivi financier</span>
            </div>
          </div>

          <div className="badge badge-bottom">
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

      {/* 3. SECTION SERVICES */}
      <div className="services-container">
        <div className="services-header animate-slide-up">
          <p className="greeting-light">Nos Expertises Terrain</p>
          <h2>Services d'Inventaire et<span className="highlight-light"> Accompagnement Opérationnel</span></h2>
          <p className="services-description">
            L'Ambassade Dékon accompagne les entreprises, commerces et organisations dans la digitalisation de leur gestion de stock grâce à des interventions terrain et à l'utilisation de la plateforme Adék Gestion.
          </p>
        </div>

        <div className="services-grid">
          <div className="service-box animate-fade-in">
            <div className="service-icon"><i className="fa-solid fa-mobile-screen-button"></i></div>
            <h3>Digitalisation des stocks</h3>
            <p>Organisation et mise en place d'une gestion de stock numérique performante à travers la solution Adék Gestion.</p>
          </div>
          <div className="service-box animate-fade-in">
            <div className="service-icon"><i className="fa-solid fa-bolt"></i></div>
            <h3>Enregistrement des produits</h3>
            <p>Prise en charge complète de l'enregistrement et de la structuration de l'ensemble de vos produits dans la plateforme en seulement 24 heures.</p>
          </div>
          <div className="service-box animate-fade-in">
            <div className="service-icon"><i className="fa-solid fa-clipboard-list"></i></div>
            <h3>Inventaire & Recensement</h3>
            <p>Comptage physique, contrôle et vérification de vos marchandises afin de garantir des données fiables et actualisées.</p>
          </div>
          <div className="service-box animate-fade-in">
            <div className="service-icon"><i className="fa-solid fa-calendar-check"></i></div>
            <h3>Suivi Périodique</h3>
            <p>Mise en place d'inventaires réguliers et de contrôles périodiques selon vos besoins : hebdomadaire, mensuel ou trimestriel.</p>
          </div>
        </div>
      </div>

      {/* 4. SECTION LOCALISATION */}
      <div id="contact" className="location-container animate-fade-in">
        <div className="location-content">
          <p className="greeting-light">Qui sommes-nous ?</p>
          <h2>Notre Complexe <span className="highlight-light">Tech & Matériel</span></h2>

          <p className="location-description">
            <strong>L'Ambassade Dékon</strong> est un hub technologique qui développe la solution Adék Gestion, accompagne les entreprises dans la gestion de leurs stocks et propose également des services de maintenance et de vente de matériel informatique et téléphonique.
          </p>

          <div className="collab-box">
            <div className="collab-icon">
              <i className="fa-solid fa-brain"></i>
            </div>
            <div className="collab-text">
              <h3>Nos domaines d'expertise</h3>
              <ul className="collab-list">
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
              <i className="fa-solid fa-location-dot"></i> Quartier Dékon, Lomé - Togo
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
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
  );
};

export default LandingPage;