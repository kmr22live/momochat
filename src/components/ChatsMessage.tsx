import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

interface MessageProps {
  message: {
    senderId: string;
    text: string;
    date?: {
      seconds: number;
    };
    img?: string;
  };
}

const ChatsMessage = ({ message }: MessageProps, key: number | string) => {
  const { currentUser } = useContext(AuthContext);
  //   const { data } = useContext(ChatContext);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const timeUpdate = (value: number) => {
    const date = new Date(value * 1000);
    const time = date.toLocaleString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });
    return time;
  };

  return (
    <div
      ref={ref}
      className={`chat ${
        message.senderId === currentUser?.uid ? "outgoing" : "incoming"
      }`}
    >
      <div className="details">
        <p>{message.text}</p>
        <span>
          {message.date?.seconds && timeUpdate(message.date?.seconds)}
        </span>
        {message.img && (
          <img style={{ width: "150px" }} src={message.img} alt="" />
        )}
      </div>
    </div>
  );
};

export default ChatsMessage;
