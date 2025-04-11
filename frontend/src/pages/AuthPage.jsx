import { useRecoilValue } from "recoil";
import LoginCard from "../components/LoginCard";
import SignupCard from "../components/SignupCard";
import ResetPasswordCard from "../components/ResetPasswordCard";
import authScreenAtom from "../../atoms/authAtom";

const AuthPage = () => {
  const authScreenState = useRecoilValue(authScreenAtom);

  if (authScreenState === "login") return <LoginCard />;
  if (authScreenState === "signup") return <SignupCard />;
  if (authScreenState === "reset") return <ResetPasswordCard />;
};

export default AuthPage;
