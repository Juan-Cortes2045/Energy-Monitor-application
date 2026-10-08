import styles from "./EmptyChart.module.css";

const EmptyChart = ({ mensaje = "Sin datos disponibles", detalle }) => (
  <div className={styles.emptyChart}>
    <span className={styles.emptyChartIcon}>📡</span>
    <p className={styles.emptyChartMsg}>{mensaje}</p>
    {detalle && <span className={styles.emptyChartSub}>{detalle}</span>}
  </div>
);

export default EmptyChart;
