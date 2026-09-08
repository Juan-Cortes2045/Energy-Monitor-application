import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../../../../design/components/Input/Input';
import styles from './AddressInput.module.css';

const MAX_LENGTH = 200;

const sanitize = (value) => {
  if (!value) return '';
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[<>{}[\]|"`']/g, '')
    .slice(0, MAX_LENGTH);
};

// Valida si la cadena tiene la estructura típica de una dirección colombiana
const isValidAddressPattern = (value) => {
  const hasHash = /#/.test(value);
  const hasNo = /No\.?\s+\d/i.test(value);
  const hasKeyword = /\b(Calle|Cra\.?|Carrera|Av\.?|Avenida|Transversal|Diagonal|Vereda|Finca|Apartamento|Apto|Oficina|Local)\b/i.test(value);
  return hasHash || hasNo || hasKeyword;
};

const getAddressError = (value, t) => {
  if (!value.trim()) return t('errors.addressRequired');
  if (value.trim().length > MAX_LENGTH) return t('errors.addressMax');
  if (/[<>{}[\]|"`']/.test(value)) return t('errors.addressInvalidChars');
  // Asegurar caracteres básicos permitidos (letras, números, espacios, # - ., () /)
  if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s#\-.,()/]+$/.test(value.trim())) {
    return t('errors.addressInvalidChars');
  }
  if (!isValidAddressPattern(value.trim())) {
    return t('errors.addressInvalidFormat');
  }
  return null;
};

const AddressInput = ({ value, onChange, error: externalError, ...rest }) => {
  const { t } = useTranslation('createHomeModal');
  const [internalError, setInternalError] = useState(null);

  const handleChange = (e) => {
    const clean = sanitize(e.target.value);
    if (internalError) setInternalError(null);
    onChange?.({ target: { value: clean } });
  };

  const handleBlur = useCallback(() => {
    const errorMsg = getAddressError(value, t);
    setInternalError(errorMsg);
  }, [value, t]);

  const displayError = internalError || externalError;

  return (
    <div className={styles.wrapper}>
      <Input
        {...rest}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        maxLength={MAX_LENGTH}
        error={displayError}
      />
      <div className={styles.helper}>
        <span className={styles.counter}>
          {value.length}/{MAX_LENGTH}
        </span>
        <span className={styles.examples}>
          {t('fields.addressExamples')}
        </span>
      </div>
      {displayError && !rest.error && (
        <span className={styles.errorMsg}>{displayError}</span>
      )}
    </div>
  );
};

export default AddressInput;