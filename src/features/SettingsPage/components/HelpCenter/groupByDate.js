/** Agrupa las entradas (ya ordenadas de la más nueva) por fecha. */
export const groupByDate = (entries) => {
  const groups = [];
  for (const entry of entries) {
    const last = groups.at(-1);
    if (last?.date === entry.date) last.items.push(entry);
    else groups.push({ date: entry.date, items: [entry] });
  }
  return groups;
};
