import Navbar from "./components/Navbar";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";
import { lazy, Suspense } from "react";
// 使用React.lazy进行懒加载
const HomePage = lazy(() => import("./pages/HomePage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SettingPage = lazy(() => import("./pages/SettingPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  console.log(theme);
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  console.log(isCheckingAuth, authUser);

  if (isCheckingAuth & !authUser)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-ring w-32 h-32"></span>
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <span className="loading loading-ring w-32 h-32"></span>
          </div>
        }
      >
        <Routes>
          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route path="/settings" element={<SettingPage />} />
          <Route
            path="/profile"
            element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
          />
        </Routes>
      </Suspense>
      <Toaster />
    </div>
  );
};

export default App;
