import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import VRPassword from "../components/RPasswordForm/VRPassword";
import NewPasswordForm from "../components/RPasswordForm/NewPasswordForm";
import AuthLayout from "../components/AuthLayout/AuthLayout";

const VerifyRecoverPassword = () => {
  const { t } = useTranslation("recoverPassword");
  const navigate = useNavigate();
  const email = useLocation().state?.email;
  // El código vive solo en memoria: no se guarda ni viaja por la URL.
  const [code, setCode] = useState(null);
  const [rejected, setRejected] = useState(false);

  if (!email) return <Navigate to="/recover-password" replace />;

  return (
    <AuthLayout>
      {code ? (
        <NewPasswordForm
          email={email}
          code={code}
          onDone={() =>
            navigate("/login", { replace: true, state: { notice: "passwordReset" } })
          }
          onCodeRejected={() => {
            setCode(null);
            setRejected(true);
          }}
        />
      ) : (
        <VRPassword
          key={rejected ? "retry" : "first"}
          email={email}
          initialError={rejected ? t("codeRejected") : ""}
          onVerified={setCode}
        />
      )}
    </AuthLayout>
  );
};

export default VerifyRecoverPassword;
