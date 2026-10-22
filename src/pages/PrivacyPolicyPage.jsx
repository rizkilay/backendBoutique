import React from "react";
import { Link } from "react-router-dom";
import "./privacyPolicy.css";

const PrivacyPolicyPage = () => (
  <main className="privacy-page">
    <article className="privacy-card">
      <Link to="/" className="privacy-back-link">
        &larr; Retour à l’accueil
      </Link>

      <h1>Politique de confidentialité</h1>
      <p className="privacy-updated">
        Dernière mise à jour : 22 octobre 2026
      </p>

      <p>
        L’Ambassade Dékon édite Adék Gestion, un outil de gestion destiné aux
        boutiques et aux entreprises. Nous traitons uniquement les informations
        nécessaires au fonctionnement du service. Elles ne sont ni vendues ni
        utilisées pour envoyer de la publicité.
      </p>

      <h2>Quelles informations sont traitées ?</h2>
      <p>
        Lorsque vous utilisez la plateforme, les informations traitées peuvent
        comprendre les informations relatives à la structure, à son responsable
        et aux utilisateurs autorisés, ainsi que les données de gestion :
        produits, stocks, ventes, dépenses, cotisations et transactions.
        Selon les informations saisies, elles peuvent également inclure les noms,
        identifiants ou coordonnées de clients, fournisseurs, partenaires ou
        financeurs.
      </p>

      <p>
        Les comptes des structures sont créés et configurés par l’intermédiaire
        du service. Un code boutique est attribué à chaque structure afin de
        permettre son identification et de faciliter les opérations de gestion
        et les transactions autorisées. Ce code est destiné à l’utilisation du
        service par la structure concernée et ne constitue pas, à lui seul,
        une preuve de l’identité d’une personne physique.
      </p>

      <h2>Pourquoi ces informations sont-elles utilisées ?</h2>
      <p>
        Les informations sont utilisées pour assurer les fonctions de gestion,
        enregistrer les transactions, synchroniser les données entre les appareils
        autorisés, identifier les boutiques concernées et assurer le bon
        fonctionnement du service. Elles ne sont ni vendues ni utilisées à des
        fins publicitaires.
      </p>

      <h2>Où sont-elles hébergées et avec qui sont-elles partagées ?</h2>
      <p>
        Les données de gestion sont enregistrées dans la base de données
        configurée pour le service, qui peut être hébergée par un prestataire
        technique. Elles sont accessibles aux personnes habilitées à administrer
        le service ou la boutique concernée, ainsi qu’aux prestataires techniques
        dans la mesure nécessaire à l’hébergement et au fonctionnement du service.
      </p>

      <h2>Durée de conservation et sécurité</h2>
      <p>
        Les informations sont conservées aussi longtemps qu’elles sont nécessaires
        à la gestion des boutiques, aux opérations enregistrées ou au fonctionnement
        du service, sous réserve des obligations légales applicables. Les
        informations peuvent être modifiées ou supprimées par les personnes
        habilitées, selon les fonctions disponibles. Les sauvegardes éventuelles
        dépendent du prestataire d’hébergement.
      </p>

      <p>
        Des mesures techniques et organisationnelles sont mises en œuvre pour
        protéger les données contre les accès non autorisés, la perte ou
        l’altération. Toutefois, aucun service en ligne ne peut garantir une
        sécurité absolue.
      </p>

      <h2>Vos demandes</h2>
      <p>
        Pour demander l’accès, la correction ou la suppression des informations
        liées à une boutique ou à ses activités, contactez l’administrateur de
        la structure ou le responsable du service. Les demandes seront traitées
        conformément aux règles applicables.
      </p>

      <p>
        Les structures doivent veiller à ne saisir que les informations
        personnelles nécessaires à leur activité et à informer les personnes
        concernées lorsque cela est requis.
      </p>

      <Link to="/" className="privacy-home-button">
        Retour à l’accueil
      </Link>
    </article>
  </main>
);

export default PrivacyPolicyPage;