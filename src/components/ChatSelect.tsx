import React, { useContext, useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { AuthContext } from "../context/AuthContext";

import { signOut } from "firebase/auth";
import ChatSelectChats from "./ChatSelectChats";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";

const ChatSelect = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showuser, setshowUser] = useState(true);
  const [err, setErr] = useState(false);
  const [loadingSpinner, setLoadingSpinner] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setLoadingSpinner(false);
    }, 1500);
  }, []);

  const { currentUser } = useContext(AuthContext);
  const hai = useContext(AuthContext);

  const handleSearch = async () => {
    setshowUser(true);
    setErr(false);
    setUser(null);
    const q = query(
      collection(db, "users"),
      where("displayName", "==", username)
    );

    try {
      const querySnapshot = await getDocs(q);

      let newdata = [];

      querySnapshot.forEach((doc) => {
        setUser(doc.data() as any);
        newdata.push(doc.data());
      });
      newdata.length < 1 && setErr(true);
    } catch (err) {
      setErr(true);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.code === "Enter" && handleSearch();
  };

  const handleSelect = async () => {
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        setshowUser(false);

        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      }
    } catch (err) {}

    setUser(null);
    setUsername("");
  };
  return (
    <>
      {loadingSpinner ? (
        <Loading />
      ) : (
        <div className="wrapper">
          <section className="users">
            <div id="overflow-hidder"></div>
            <header>
              <div className="content">
                <img src={currentUser.photoURL} alt="" />
                <div className="details">
                  <span>{currentUser.displayName}</span>
                  <p></p>
                </div>
              </div>
              <a
                href=""
                className="logout"
                onClick={() => {
                  signOut(auth);
                  nav("/login");
                }}
              >
                Logout
              </a>
            </header>
            <div className="search">
              <span className="text"></span>
              <input
                type="text"
                className="show search-first-input"
                placeholder="Enter name to search..."
                onKeyDown={handleKey}
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
              <button>
                <i
                  className="fas fa-search"
                  style={{ color: "white" }}
                  onClick={() => handleSearch()}
                ></i>
              </button>
            </div>
            <div className="users-list">
              {err && <span>User not found!</span>}
              {user && showuser && (
                <div
                  className="userChat"
                  onClick={handleSelect}
                  style={{ cursor: "pointer" }}
                >
                  <img src={user.photoURL} alt="" />
                  <div className="userChatInfo">
                    <span>{user.displayName}</span>
                  </div>
                </div>
              )}
            </div>
            <hr />
            <ChatSelectChats />
          </section>
        </div>
      )}
    </>
  );
};

export default React.memo(ChatSelect);
