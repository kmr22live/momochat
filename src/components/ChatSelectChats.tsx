import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

const ChatSelectChats = () => {
  const [chats, setChats] = useState<any[]>([]);
  const nav = useNavigate();

  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  const timeUpdate = (value: number) => {
    const date = new Date(value * 1000);
    const time = date.toLocaleString("en-US", {
      day: "numeric",
      month: "long",
      hour12: true,
    });
    return time;
  };

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        if (doc.exists()) {
          setChats(doc.data() as any);
        }
      });

      return () => {
        unsub();
      };
    };

    currentUser.uid && getChats();
  }, [currentUser.uid]);

  const handleSelect = (userInfo: any) => {
    dispatch({ type: "CHANGE_USER", payload: userInfo });
    nav("/chat");
  };

  return (
    <div className="chats" id="search-chats">
      {Object.entries(chats)
        ?.sort((a, b) => b[1].date - a[1].date)
        .map((chat) => (
          <div
            className="users-list"
            key={chat[0]}
            onClick={() => handleSelect(chat[1].userInfo)}
          >
            <a>
              <div style={{ display: "flex", alignItems: "center" }}>
                <img src={chat[1].userInfo.photoURL} alt="" />
                <div className="details" style={{ marginLeft: "20px" }}>
                  {chat[1].userInfo.displayName}
                  <p>
                    {chat[1].lastMessage?.text.slice(0, 30)}
                    {chat[1].lastMessage?.text && "..."}
                  </p>
                </div>
              </div>
              <div className="status-dot">
                {chat[1].date?.seconds
                  ? timeUpdate(chat[1].date?.seconds)
                  : "New"}
              </div>
            </a>
          </div>
        ))}
      {Object.keys(chats).length === 0 && (
        <div className="search-welcome">
          Welcome to MoMo Chat's! This is an anonymous chat app. You can message
          anyone within this app with a unique username. Let's start messaging
          with <span style={{ fontWeight: "700" }}>momo</span>. Search{" "}
          <span style={{ fontWeight: "700" }}>momo</span> in the search bar and
          click the result to start. (Usernames are case-sensitive.)
        </div>
      )}
    </div>
  );
};

export default ChatSelectChats;
