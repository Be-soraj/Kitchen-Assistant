import React, { useContext, useState, useEffect, createContext } from "react";
import type { User } from "../types";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user from local storage on initial render
  useEffect(() => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      if (storedUsers.length === 0) {
        const demoUser = {
          id: "demo-user",
          name: "Demo User",
          email: "demo@kitchen.ai",
          password: "password",
        };
        localStorage.setItem("users", JSON.stringify([demoUser]));
      }

      const storedUserId = localStorage.getItem("currentUser");
      if (storedUserId) {
        const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
        const user = users.find((u) => u.id === storedUserId);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          setCurrentUser(userWithoutPassword);
        }
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate async operation
        const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
        const user = users.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          const { password: userPassword, ...userToStore } = user;
          localStorage.setItem("currentUser", user.id);
          setCurrentUser(userToStore);
          resolve();
        } else {
          reject(new Error("Invalid email or password."));
        }
      }, 500);
    });
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate async operation
        const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
        if (users.some((u) => u.email === email)) {
          return reject(
            new Error("An account with this email already exists.")
          );
        }

        const newUser: User = {
          id: new Date().toISOString(),
          name,
          email,
          password,
        };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        const { password: userPassword, ...userToStore } = newUser;
        localStorage.setItem("currentUser", newUser.id);
        setCurrentUser(userToStore);
        resolve();
      }, 500);
    });
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  const updateProfile = async (name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!currentUser) {
        return reject(new Error("No user is logged in."));
      }
      setTimeout(() => {
        const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
        const userIndex = users.findIndex((u) => u.id === currentUser.id);

        if (userIndex > -1) {
          users[userIndex].name = name;
          localStorage.setItem("users", JSON.stringify(users));
          const updatedUser = { ...currentUser, name };
          setCurrentUser(updatedUser);
          resolve();
        } else {
          reject(new Error("User not found in storage."));
        }
      }, 500);
    });
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
