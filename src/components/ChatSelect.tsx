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
import "../assets/css/modal.css";
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
  const [userList, setUserList] = useState<any[]>([]);

  const handleList = async () => {
    const q = await query(collection(db, "users"));
    console.log(q);
    // console.log("hai hai");

    try {
      const querySnapshot = await getDocs(q);

      let newdata: any = [];

      querySnapshot.forEach((doc) => {
        newdata.push(doc.data());
      });
      await setUserList(newdata);
    } catch (err) {
      console.log(err);
    }

    await console.log(userList);
  };

  useEffect(() => {
    setTimeout(() => {
      setLoadingSpinner(false);
    }, 1500);
    handleList();
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
              <div className="wrapper">
                <details>
                  <summary>
                    <div className="button-userlist-search2">Userlist</div>
                    <div className="details-modal-overlay"></div>
                  </summary>
                  <div className="details-modal">
                    <div className="details-modal-close">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M13.7071 1.70711C14.0976 1.31658 14.0976 0.683417 13.7071 0.292893C13.3166 -0.0976311 12.6834 -0.0976311 12.2929 0.292893L7 5.58579L1.70711 0.292893C1.31658 -0.0976311 0.683417 -0.0976311 0.292893 0.292893C-0.0976311 0.683417 -0.0976311 1.31658 0.292893 1.70711L5.58579 7L0.292893 12.2929C-0.0976311 12.6834 -0.0976311 13.3166 0.292893 13.7071C0.683417 14.0976 1.31658 14.0976 1.70711 13.7071L7 8.41421L12.2929 13.7071C12.6834 14.0976 13.3166 14.0976 13.7071 13.7071C14.0976 13.3166 14.0976 12.6834 13.7071 12.2929L8.41421 7L13.7071 1.70711Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                    <div className="details-modal-title">
                      <h1>Userlist</h1>
                      <p>(search this user and start chat)</p>
                    </div>
                    <div className="details-modal-content">
                      {userList &&
                        userList.map((user, i) => {
                          return (
                            <div className="userChat" key={i}>
                              <img src={user.photoURL} alt="" />
                              <div className="userChatInfo">
                                <span>{user.displayName}</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </details>
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
