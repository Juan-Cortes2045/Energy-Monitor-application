import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Español

import esAccount from "./locales/es/account.json";
import esAuth from "./locales/es/auth.json";
import esNavbar from "./locales/es/navbar.json";
import esSidebar from "./locales/es/sidebar.json";
import esHero from "./locales/es/hero.json";
import esHowItWorks from "./locales/es/howItWorks.json";
import esRecoverPassword from "./locales/es/recoverPassword.json";
import esDashboard from "./locales/es/dashboard.json";
import esCreateProjectModal from "./locales/es/createProjectModal.json";
import esProjectCard from "./locales/es/projectCard.json";
import esEmptyState from "./locales/es/emptyState.json";
import esFavorites from "./locales/es/favorites.json";
import esValidations from "./locales/es/validations.json";
import esSettings from "./locales/es/settings.json";
import esConsumption from "./locales/es/consumption.json";
import esProject from "./locales/es/project.json";
import esUsers from "./locales/es/users.json";
import esHistory from "./locales/es/history.json";
import esBenefits from "./locales/es/benefits.json";
import esSupport from "./locales/es/support.json";

// Inglés

import enAccount from "./locales/en/account.json";
import enAuth from "./locales/en/auth.json";
import enNavbar from "./locales/en/navbar.json";
import enSidebar from "./locales/en/sidebar.json";
import enHero from "./locales/en/hero.json";
import enHowItWorks from "./locales/en/howItWorks.json";
import enRecoverPassword from "./locales/en/recoverPassword.json";
import enDashboard from "./locales/en/dashboard.json";
import enCreateProjectModal from "./locales/en/createProjectModal.json";
import enProjectCard from "./locales/en/projectCard.json";
import enEmptyState from "./locales/en/emptyState.json";
import enFavorites from "./locales/en/favorites.json";
import enValidations from "./locales/en/validations.json";
import enSettings from "./locales/en/settings.json";
import enConsumption from "./locales/en/consumption.json";
import enProject from "./locales/en/project.json";
import enUsers from "./locales/en/users.json";
import enHistory from "./locales/en/history.json";
import enBenefits from "./locales/en/benefits.json";
import enSupport from "./locales/en/support.json";

// Frances

import frAccount from "./locales/fr/account.json";
import frAuth from "./locales/fr/auth.json";
import frNavbar from "./locales/fr/navbar.json";
import frSidebar from "./locales/fr/sidebar.json";
import frHero from "./locales/fr/hero.json";
import frHowItWorks from "./locales/fr/howItWorks.json";
import frRecoverPassword from "./locales/fr/recoverPassword.json";
import frDashboard from "./locales/fr/dashboard.json";
import frCreateProjectModal from "./locales/fr/createProjectModal.json";
import frProjectCard from "./locales/fr/projectCard.json";
import frEmptyState from "./locales/fr/emptyState.json";
import frFavorites from "./locales/fr/favorites.json";
import frValidations from "./locales/fr/validations.json";
import frSettings from "./locales/fr/settings.json";
import frConsumption from "./locales/fr/consumption.json";
import frProject from "./locales/fr/project.json";
import frUsers from "./locales/fr/users.json";
import frHistory from "./locales/fr/history.json";
import frBenefits from "./locales/fr/benefits.json";
import frSupport from "./locales/fr/support.json";

// Portugués

import ptAccount from "./locales/pt/account.json";
import ptAuth from "./locales/pt/auth.json";
import ptNavbar from "./locales/pt/navbar.json";
import ptSidebar from "./locales/pt/sidebar.json";
import ptHero from "./locales/pt/hero.json";
import ptHowItWorks from "./locales/pt/HowItWorks.json";
import ptRecoverPassword from "./locales/pt/recoverPassword.json";
import ptDashboard from "./locales/pt/dashboard.json";
import ptCreateProjectModal from "./locales/pt/createProjectModal.json";
import ptProjectCard from "./locales/pt/projectCard.json";
import ptEmptyState from "./locales/pt/emptyState.json";
import ptFavorites from "./locales/pt/favorites.json";
import ptValidations from "./locales/pt/validations.json";
import ptSettings from "./locales/pt/settings.json";
import ptConsumption from "./locales/pt/consumption.json";
import ptProject from "./locales/pt/project.json";
import ptUsers from "./locales/pt/users.json";
import ptHistory from "./locales/pt/history.json";
import ptBenefits from "./locales/pt/benefits.json";
import ptSupport from "./locales/pt/support.json";

// Configuración de i18next
i18n.use(initReactI18next).init({
  fallbackLng: "es",
  lng: localStorage.getItem("lang") || "es",

  resources: {
    es: {
      account: esAccount,
      auth: esAuth,
      navbar: esNavbar,
      sidebar: esSidebar,
      hero: esHero,
      howItWorks: esHowItWorks,
      recoverPassword: esRecoverPassword,
      dashboard: esDashboard,
      createProjectModal: esCreateProjectModal,
      projectCard: esProjectCard,
      emptyState: esEmptyState,
      favorites: esFavorites,
      validations: esValidations,
      settings: esSettings,
      consumption: esConsumption,
      project: esProject,
      users: esUsers,
      history: esHistory,
      benefits: esBenefits,
      support: esSupport,
    },
    en: {
      account: enAccount,
      auth: enAuth,
      navbar: enNavbar,
      sidebar: enSidebar,
      hero: enHero,
      howItWorks: enHowItWorks,
      recoverPassword: enRecoverPassword,
      dashboard: enDashboard,
      createProjectModal: enCreateProjectModal,
      projectCard: enProjectCard,
      emptyState: enEmptyState,
      favorites: enFavorites,
      validations: enValidations,
      settings: enSettings,
      consumption: enConsumption,
      project: enProject,
      users: enUsers,
      history: enHistory,
      benefits: enBenefits,
      support: enSupport,
    },
    fr: {
      account: frAccount,
      auth: frAuth,
      navbar: frNavbar,
      sidebar: frSidebar,
      hero: frHero,
      howItWorks: frHowItWorks,
      recoverPassword: frRecoverPassword,
      dashboard: frDashboard,
      createProjectModal: frCreateProjectModal,
      projectCard: frProjectCard,
      emptyState: frEmptyState,
      favorites: frFavorites,
      validations: frValidations,
      settings: frSettings,
      consumption: frConsumption,
      project: frProject,
      users: frUsers,
      history: frHistory,
      benefits: frBenefits,
      support: frSupport,
    },
    pt: {
      account: ptAccount,
      auth: ptAuth,
      navbar: ptNavbar,
      sidebar: ptSidebar,
      hero: ptHero,
      howItWorks: ptHowItWorks,
      recoverPassword: ptRecoverPassword,
      dashboard: ptDashboard,
      createProjectModal: ptCreateProjectModal,
      projectCard: ptProjectCard,
      emptyState: ptEmptyState,
      favorites: ptFavorites,
      validations: ptValidations,
      settings: ptSettings,
      consumption: ptConsumption,
      project: ptProject,
      users: ptUsers,
      history: ptHistory,
      benefits: ptBenefits,
      support: ptSupport,
    },
  },
});

export default i18n;
