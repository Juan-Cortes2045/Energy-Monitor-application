// Atributos que enlazan un input con su ayuda y su error (los ids siguen el patrón
// `<campo>-hint` / `<campo>-error` que usan los formularios de auth).
export const errorId = (name) => `${name}-error`;

export const fieldA11y = (name, error, hintId) => {
  const ids = [hintId, error && errorId(name)].filter(Boolean);
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": ids.length ? ids.join(" ") : undefined,
  };
};
