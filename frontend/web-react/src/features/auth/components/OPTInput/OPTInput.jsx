import { useState, useRef } from "react";
import styles from "./OTPInput.module.css";

const OTPInput = ({ length = 6, onChange, onComplete }) => {
  const [code, setCode] = useState(Array(length).fill(""));
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    onChange?.(newCode.join(""));

    if (value && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }

    if (newCode.every((digit) => digit !== "")) {
      onComplete?.(newCode.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    <div className={styles.otpContainer}>
      {code.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          value={digit}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          maxLength={1}
          className={styles.input}
        />
      ))}
    </div>
  );
};

export default OTPInput;
