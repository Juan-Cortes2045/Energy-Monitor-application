import { Component } from "react";
import { useTranslation } from "react-i18next";
import ErrorState from "../ErrorState/ErrorState";

const RenderError = () => {
  const { t } = useTranslation("errorState");
  return (
    <ErrorState
      title={t("render.title")}
      description={t("render.description")}
      retryLabel={t("reload")}
      // Recargar también recupera una parte de la app que no se pudo descargar tras un despliegue.
      onRetry={() => globalThis.location.reload()}
    />
  );
};

/**
 * Atrapa los errores de render de su contenido y muestra ErrorState en lugar de una pantalla
 * en blanco. Con `resetKey` (p. ej. la ruta actual) se recupera solo al navegar a otra pantalla.
 */
class ErrorBoundary extends Component {
  state = { failed: false, resetKey: this.props.resetKey };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.resetKey) return { failed: false, resetKey: props.resetKey };
    return null;
  }

  render() {
    return this.state.failed ? <RenderError /> : this.props.children;
  }
}

export default ErrorBoundary;
