import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { Dashboard } from "./components/Dashboard";

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [view, setView] = useState<"login" | "signup">("login");

  if (!currentUser) {
    return view === "login" ? (
      <LoginPage onSwitchToSignup={() => setView("signup")} />
    ) : (
      <SignupPage onSwitchToLogin={() => setView("login")} />
    );
  }

  return <Dashboard />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
