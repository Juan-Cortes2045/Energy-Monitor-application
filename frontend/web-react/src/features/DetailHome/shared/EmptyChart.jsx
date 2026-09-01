import styles from "./EmptyChart.module.css";
const EmptyChart = ({ mensaje = "Sin datos disponibles" }) => (
  <div className={styles.emptyChart}>
    <span className={styles.emptyChartIcon}>📡</span>
    <p className={styles.emptyChartMsg}>{mensaje}</p>
    <span className={styles.emptyChartSub}>
      Se mostrará cuando el back-end esté conectado
    </span>
  </div>
);

export default EmptyChart;
