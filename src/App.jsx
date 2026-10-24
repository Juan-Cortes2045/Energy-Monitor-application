import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/shared/ErrorBoundary/ErrorBoundary";
import "./styles/global.css";

function App() {
  // Último recurso: un error de render fuera del layout muestra ErrorState, no una pantalla en blanco.
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}
export default App;
