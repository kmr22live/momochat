import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import ChatsMessage from "./ChatsMessage";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const { data } = useContext(ChatContext);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      doc.exists() && setMessages(doc.data().messages);
    });

    return () => {
      unSub();
    };
  }, [data.chatId]);

  return (
    <div className="">
      {messages.length > 0 ? (
        messages.map((m, i) => <ChatsMessage message={m} key={i} />) //key={m.id}
      ) : (
        <div className="text">
          No messages are available. Once you send message they will appear
          here.
        </div>
      )}
    </div>
  );
};

export default Messages;
