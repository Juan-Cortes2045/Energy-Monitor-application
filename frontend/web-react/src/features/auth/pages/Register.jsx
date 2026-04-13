import RegisterForm from "../components/RegisterForm/RegisterForm";
import AuthLayout from "../components/AuthLayout/AuthLayout";

const Register = () => {
  return (
    <>
      <AuthLayout>
        <RegisterForm />
      </AuthLayout>
    </>
  );
};

export default Register;
