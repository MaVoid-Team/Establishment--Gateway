import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AtSign, Key, LogIn, User, AlertCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAuth } from '../../hooks/useAuth';

export default function Component() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("default");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, checkAuth } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/main-page', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const url = `${apiUrl}/api/v1/auth/login`;
    const loginData = { email, password };

    try {
      const response = await axios.post(url, loginData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      setMessage(t("loginSuccessful"));
      setAlertType("default");
      await checkAuth(); // Re-check authentication state
    } catch (error) {
      setMessage(t("loginFailed"));
      setAlertType("destructive");
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const url = `${apiUrl}/api/v1/auth/forgetpassword`;
    const forgotPasswordData = { email };

    try {
      const response = await axios.post(url, forgotPasswordData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      setMessage(t("passwordResetSent"));
      setAlertType("default");
    } catch (error) {
      setMessage(t("passwordResetFailed"));
      setAlertType("destructive");
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAxiosError = (error) => {
    if (error.response) {
      console.error("Error Response Data:", error.response.data);
      console.error("Error Response Status:", error.response.status);
      console.error("Error Response Headers:", error.response.headers);
    } else if (error.request) {
      console.error("Error Request:", error.request);
    } else {
      console.error("Error Message:", error.message);
    }
    console.error("Error Config:", error.config);
  };

  return (
    <div
      className="flex items-center justify-center bg-landingPageBg bg-no-repeat h-screen bg-cover "
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md p-8 mx-11 space-y-8 rounded-2xl shadow-2xl transition-all duration-300 ease-in-out hover:scale-105 dark:hover:shadow-[#000000] dark:shadow-[#000000] backdrop-blur-lg">
        <div className="text-center">
          <div className="inline-block p-4 bg-[#d4ab71] bg-opacity-20 rounded-full">
            <User size={40} className="text-[#d4ab71]" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold">
            {isForgotPassword ? t("forgotPassword") : t("welcomeBack")}
          </h1>
          <p className="mt-2">
            {isForgotPassword ? t("EnterYourEmail") : t("signInToAccount")}
          </p>
        </div>
        {message && (
          <Alert variant={alertType} className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <form
          onSubmit={isForgotPassword ? handleForgotPassword : handleLogin}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              {t("email")}
            </Label>
            <div className="relative">
              <AtSign
                className={`absolute ${
                  i18n.language === "ar" ? "right-3" : "left-3"
                } top-1/2 transform -translate-y-1/2 text-black`}
              />
              <Input
                id="email"
                type="email"
                placeholder={t("enterEmailOrExtension")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${
                  i18n.language === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"
                } py-2 border-gray-300 rounded-md focus:ring-[#d4ab71] focus:border-[#d4ab71]`}
                required
              />
            </div>
          </div>
          {!isForgotPassword && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                {t("password")}
              </Label>
              <div className="relative">
                <Key
                  className={`absolute ${
                    i18n.language === "ar" ? "right-3" : "left-3"
                  } top-1/2 transform -translate-y-1/2 text-black`}
                />
                <Input
                  id="password"
                  type="password"
                  placeholder={t("enterPassword")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${
                    i18n.language === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"
                  } py-2 border-gray-300 rounded-md focus:ring-[#d4ab71] focus:border-[#d4ab71]`}
                  required
                />
              </div>
            </div>
          )}
          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#d4ab71] hover:bg-[#c09a60] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4ab71] transition-colors duration-200"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>
                    {isForgotPassword
                      ? t("SendingResetLink")
                      : t("signingIn")}
                  </span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>
                    {isForgotPassword ? t("SendResetLink") : t("signIn")}
                  </span>
                </>
              )}
            </Button>
          </div>
        </form>
        <div className="text-center">
          <Button
            variant="link"
            onClick={() => {
              setIsForgotPassword(!isForgotPassword);
              setMessage("");
              setAlertType("default");
            }}
            className="text-sm text-[#bebbbb] hover:text-[#c09a60]"
          >
            {isForgotPassword ? t("BackToLogin") : t("forgotPassword")}
          </Button>
        </div>
      </div>
    </div>
  );
}

