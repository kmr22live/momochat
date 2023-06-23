import { createContext, useContext, useReducer } from "react";
import { AuthContext } from "./AuthContext";

interface ChatAction {
  type: string;
  payload: any;
}

interface ChatData {
  chatId: string;
  user: any;
}

export const ChatContext = createContext<{
  data: ChatData;
  dispatch: (action: ChatAction) => void;
}>({
  data: {
    chatId: "null",
    user: {},
  },
  dispatch: () => {},
});

let localData = JSON.parse(localStorage.getItem("momoid") || "null");

const ChatContextProvider = ({ children }: any) => {
  const { currentUser } = useContext(AuthContext);
  const INITIAL_STATE = {
    chatId: localData ? localData.chatId : "null",
    user: localData ? localData.user : {},
  };

  const chatReducer = (state: any, action: ChatAction) => {
    switch (action.type) {
      case "CHANGE_USER":
        localStorage.setItem(
          "momoid",
          JSON.stringify({
            user: action.payload,
            chatId:
              currentUser.uid > action.payload.uid
                ? currentUser.uid + action.payload.uid
                : action.payload.uid + currentUser.uid,
          })
        );

        return {
          user: action.payload,
          chatId:
            currentUser.uid > action.payload.uid
              ? currentUser.uid + action.payload.uid
              : action.payload.uid + currentUser.uid,
        };

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContextProvider;
