import { useTranslation } from "react-i18next";
import { RadioTower } from "lucide-react";

import styles from "./EmptyChart.module.css";

const EmptyChart = ({ mensaje, detalle }) => {
  const { t } = useTranslation("consumption");
  return (
    <div className={styles.emptyChart}>
      <RadioTower size={28} className={styles.emptyChartIcon} aria-hidden="true" />
      <p className={styles.emptyChartMsg}>{mensaje ?? t("empty.noData")}</p>
      {detalle && <span className={styles.emptyChartSub}>{detalle}</span>}
    </div>
  );
};

export default EmptyChart;
