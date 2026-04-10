const Input = ({ value, type, placeholder, id, ...props }) => {
  return <input id={id} type={type} value={value} placeholder={placeholder} {...props} />;
};

export default Input;
