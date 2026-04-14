import styles from "../../css/Input.module.css";
import colors from "../../tokens/colors";
import typography from "../../tokens/typography";
import radius from "../../tokens/radius";
import spacing from "../../tokens/spacing";
import shadows from "../../tokens/shadows";

const Input = ({ 
  value, 
  type= "text", 
  placeholder, 
  id, 
  children,
  onChange,
  icon,
  onIconClick,
  ...rest
  }) => {
  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor={id}
      style={{
        fontFamily: typography.fontPrimary,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
      }}
      >
        {children}
      </label>
      <div
      className={styles.inputWrapper}
      style={{
        borderRadius: radius.sm,
        padding: `${spacing.sm} ${spacing.md}`,
      }}
      >
        
      <input
        className={styles.input}
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        {...rest}
        style={{
          fontSize: typography.sizes.sm,
          color: colors.textPrimary,
          fontFamily: typography.textPrimary,
        }}
      />
      {icon &&(
         <span className={styles.icon} onClick={onIconClick}>
            {icon}
          </span>
      )}
      </div>
    </div>
  );
};

export default Input;
