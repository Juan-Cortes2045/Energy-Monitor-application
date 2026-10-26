import Hero from "../components/Hero/Hero";
import HowItWorks from "../components/HowItWorks/HowItWorks";
import Benefits from "../components/Benefits/Benefits";
import Navbar from "../../../components/layout/Navbar/Navbar";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

const Home = () => {
  useDocumentTitle("Inicio", "Mide el consumo eléctrico de tu hogar en tiempo real, recibe alertas y recomendaciones para ahorrar energía.");
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.substring(1);

    const scrollToSection = () => {
      const element = document.getElementById(id);

      if (element) {
        const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        element.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    };

    // Esperamos a que React termine de renderizar
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToSection);
    });
  }, [location.hash]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks id="HowItWorks" />
        <Benefits />
      </main>
    </>
  );
};

export default Home;
