const Input = ({ value, type, placeholder, id, children }) => {
  return (
    <>
      <label id={id}>{children}</label>
      <input id={id} type={type} value={value} placeholder={placeholder} />
    </>
  );
};

export default Input;
