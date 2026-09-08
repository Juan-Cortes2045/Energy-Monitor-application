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
import esJoinHomeModal from "./locales/es/JoinHomeModal.json";
import esCreateHomeModal from "./locales/es/createHomeModal.json";
import esHomeCard from "./locales/es/homeCard.json";
import esEmptyState from "./locales/es/emptyState.json";
import esFavorites from "./locales/es/favorites.json";
import esValidations from "./locales/es/validations.json";
import esSettings from "./locales/es/settings.json";
import esConsumption from "./locales/es/consumption.json";
import esHome from "./locales/es/home.json";
import esUsers from "./locales/es/users.json";
import esHistory from "./locales/es/history.json";
import esBenefits from "./locales/es/benefits.json";
import esSupport from "./locales/es/support.json";
import esDevices from "./locales/es/devices.json";
import esLinkDeviceModal from "./locales/es/linkDeviceModal.json";
import esAuthLayout from "./locales/es/authLayout.json";
import esThresholds from "./locales/es/thresholds.json";
import esNotifications from "./locales/es/notifications.json";
import esAbout from "./locales/es/about.json";
import esLegalModal from "./locales/es/legalModal.json";

// Inglés

import enAccount from "./locales/en/account.json";
import enAuth from "./locales/en/auth.json";
import enNavbar from "./locales/en/navbar.json";
import enSidebar from "./locales/en/sidebar.json";
import enHero from "./locales/en/hero.json";
import enHowItWorks from "./locales/en/howItWorks.json";
import enRecoverPassword from "./locales/en/recoverPassword.json";
import enDashboard from "./locales/en/dashboard.json";
import enJoinHomeModal from "./locales/en/JoinHomeModal.json";
import enCreateHomeModal from "./locales/en/createHomeModal.json";
import enHomeCard from "./locales/en/homeCard.json";
import enEmptyState from "./locales/en/emptyState.json";
import enFavorites from "./locales/en/favorites.json";
import enValidations from "./locales/en/validations.json";
import enSettings from "./locales/en/settings.json";
import enConsumption from "./locales/en/consumption.json";
import enHome from "./locales/en/home.json";
import enUsers from "./locales/en/users.json";
import enHistory from "./locales/en/history.json";
import enBenefits from "./locales/en/benefits.json";
import enSupport from "./locales/en/support.json";
import enDevices from "./locales/en/devices.json";
import enLinkDeviceModal from "./locales/en/linkDeviceModal.json";
import enAuthLayout from "./locales/en/authLayout.json";
import enThresholds from "./locales/en/thresholds.json";
import enNotifications from "./locales/en/notifications.json";
import enAbout from "./locales/en/about.json";
import enLegalModal from "./locales/en/legalModal.json";

// Frances

import frAccount from "./locales/fr/account.json";
import frAuth from "./locales/fr/auth.json";
import frNavbar from "./locales/fr/navbar.json";
import frSidebar from "./locales/fr/sidebar.json";
import frHero from "./locales/fr/hero.json";
import frHowItWorks from "./locales/fr/howItWorks.json";
import frRecoverPassword from "./locales/fr/recoverPassword.json";
import frDashboard from "./locales/fr/dashboard.json";
import frJoinHomeModal from "./locales/fr/JoinHomeModal.json";
import frCreateHomeModal from "./locales/fr/createHomeModal.json";
import frHomeCard from "./locales/fr/homeCard.json";
import frEmptyState from "./locales/fr/emptyState.json";
import frFavorites from "./locales/fr/favorites.json";
import frValidations from "./locales/fr/validations.json";
import frSettings from "./locales/fr/settings.json";
import frConsumption from "./locales/fr/consumption.json";
import frHome from "./locales/fr/home.json";
import frUsers from "./locales/fr/users.json";
import frHistory from "./locales/fr/history.json";
import frBenefits from "./locales/fr/benefits.json";
import frSupport from "./locales/fr/support.json";
import frDevices from "./locales/fr/devices.json";
import frLinkDeviceModal from "./locales/fr/linkDeviceModal.json";
import frAuthLayout from "./locales/fr/authLayout.json";
import frThresholds from "./locales/fr/thresholds.json";
import frNotifications from "./locales/fr/notifications.json";
import frAbout from "./locales/fr/about.json";
import frLegalModal from "./locales/fr/legalModal.json";

// Portugués

import ptAccount from "./locales/pt/account.json";
import ptAuth from "./locales/pt/auth.json";
import ptNavbar from "./locales/pt/navbar.json";
import ptSidebar from "./locales/pt/sidebar.json";
import ptHero from "./locales/pt/hero.json";
import ptHowItWorks from "./locales/pt/HowItWorks.json";
import ptRecoverPassword from "./locales/pt/recoverPassword.json";
import ptDashboard from "./locales/pt/dashboard.json";
import ptJoinHomeModal from "./locales/pt/JoinHomeModal.json";
import ptCreateHomeModal from "./locales/pt/createHomeModal.json";
import ptHomeCard from "./locales/pt/homeCard.json";
import ptEmptyState from "./locales/pt/emptyState.json";
import ptFavorites from "./locales/pt/favorites.json";
import ptValidations from "./locales/pt/validations.json";
import ptSettings from "./locales/pt/settings.json";
import ptConsumption from "./locales/pt/consumption.json";
import ptHome from "./locales/pt/home.json";
import ptUsers from "./locales/pt/users.json";
import ptHistory from "./locales/pt/history.json";
import ptBenefits from "./locales/pt/benefits.json";
import ptSupport from "./locales/pt/support.json";
import ptDevices from "./locales/pt/devices.json";
import ptLinkDeviceModal from "./locales/pt/linkDeviceModal.json";
import ptAuthLayout from "./locales/pt/authLayout.json";
import ptThresholds from "./locales/pt/thresholds.json";
import ptNotifications from "./locales/pt/notifications.json";
import ptAbout from "./locales/pt/about.json";
import ptLegalModal from "./locales/pt/legalModal.json"

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
      joinHomeModal: esJoinHomeModal,
      createHomeModal: esCreateHomeModal,
      homeCard: esHomeCard,
      emptyState: esEmptyState,
      favorites: esFavorites,
      validations: esValidations,
      settings: esSettings,
      consumption: esConsumption,
      home: esHome,
      users: esUsers,
      history: esHistory,
      benefits: esBenefits,
      support: esSupport,
      devices: esDevices,
      linkDeviceModal: esLinkDeviceModal,
      authLayout: esAuthLayout,
      thresholds: esThresholds,
      notifications: esNotifications,
      about: esAbout,
      legalModal: esLegalModal
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
      joinHomeModal: enJoinHomeModal,
      createHomeModal: enCreateHomeModal,
      homeCard: enHomeCard,
      emptyState: enEmptyState,
      favorites: enFavorites,
      validations: enValidations,
      settings: enSettings,
      consumption: enConsumption,
      home: enHome,
      users: enUsers,
      history: enHistory,
      benefits: enBenefits,
      support: enSupport,
      devices: enDevices,
      linkDeviceModal: enLinkDeviceModal,
      authLayout: enAuthLayout,
      thresholds: enThresholds,
      notifications: enNotifications,
      about: enAbout,
      legalModal: enLegalModal
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
      joinHomeModal: frJoinHomeModal,
      createHomeModal: frCreateHomeModal,
      homeCard: frHomeCard,
      emptyState: frEmptyState,
      favorites: frFavorites,
      validations: frValidations,
      settings: frSettings,
      consumption: frConsumption,
      home: frHome,
      users: frUsers,
      history: frHistory,
      benefits: frBenefits,
      support: frSupport,
      devices: frDevices,
      linkDeviceModal: frLinkDeviceModal,
      authLayout: frAuthLayout,
      thresholds: frThresholds,
      notifications: frNotifications,
      about: frAbout,
      legalModal: frLegalModal
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
      joinHomeModal: ptJoinHomeModal,
      createHomeModal: ptCreateHomeModal,
      homeCard: ptHomeCard,
      emptyState: ptEmptyState,
      favorites: ptFavorites,
      validations: ptValidations,
      settings: ptSettings,
      consumption: ptConsumption,
      home: ptHome,
      users: ptUsers,
      history: ptHistory,
      benefits: ptBenefits,
      support: ptSupport,
      devices: ptDevices,
      linkDeviceModal: ptLinkDeviceModal,
      authLayout: ptAuthLayout,
      thresholds: ptThresholds,
      notifications: ptNotifications,
      about: ptAbout,
      legalModal: ptLegalModal
    },
  },
});

export default i18n;
