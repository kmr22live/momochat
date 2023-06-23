import React, { useContext, useEffect, useState } from "react";

import Messages from "./Messages";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import {
  arrayUnion,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { v4 } from "uuid";
import { Link } from "react-router-dom";
import Loading from "./Loading";

const Chat = () => {
  const [text, setText] = useState("");
  const [textHide, setTextHide] = useState("");
  const [img, setImg] = useState(null);
  const [loadingSpinner, setLoadingSpinner] = useState(true);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const className = textHide.length > 0 ? "active" : "";

  useEffect(() => {
    setTimeout(() => {
      setLoadingSpinner(false);
    }, 500);
  }, []);

  const handleSend = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setTextHide("");
    await updateDoc(doc(db, "chats", data.chatId), {
      messages: arrayUnion({
        id: v4(),
        text,
        senderId: currentUser.uid,
        date: Timestamp.now(),
      }),
    });

    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    setText("");
    setImg(null);
  };

  return (
    <>
      {loadingSpinner ? (
        <Loading />
      ) : (
        <div className="wrapper">
          <section className="chat-area" id="chat-area">
            <header>
              <Link to={"/"} className="back-icon">
                <i className="fas fa-arrow-left"></i>
              </Link>
              <img src={data.user?.photoURL} alt="" />
              <div className="details">
                <span>{data.user?.displayName}</span>
                <p></p>
              </div>
            </header>
            <div className="chat-box">
              <Messages />
            </div>
            <form action="#" className="typing-area">
              <input
                type="text"
                name="message"
                className="input-field"
                placeholder="Type a message here..."
                autoComplete="off"
                onChange={(e) => {
                  setText(e.target.value);
                  setTextHide(e.target.value);
                }}
                value={textHide}
              />

              <button className={className} onClick={handleSend}>
                <i className="fa-brands fa-telegram"></i>
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
};

export default Chat;
