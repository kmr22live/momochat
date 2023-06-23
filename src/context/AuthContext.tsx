import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

type User = any | {};

export const AuthContext = createContext<User | null>({});

export const AuthContextProvider = ({ children }: any) => {
  let localDataauth: any = JSON.parse(
    localStorage.getItem("momoLoginAuth") || "null"
  );
  const [currentUser, setCurrentUser] = useState(localDataauth);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: User) => {
      setCurrentUser(user);
      localStorage.setItem("momoLoginAuth", JSON.stringify(user));
    });

    return () => {
      unsub();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
