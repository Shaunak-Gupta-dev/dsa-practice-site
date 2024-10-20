import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import {
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  Button,
} from "@chakra-ui/react";
import "./LiveChat.css";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useChatContext } from "./../context/ChatContext.js";

const socket = io("https://dsa-practice-site-server.onrender.com");


const LiveChat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const { messages: messagesC, addMessages } = useChatContext();

  useEffect(() => {
    if (messagesC.length > 0) {
      setMessages(messagesC);
    }
  }, [messagesC]);

  useEffect(() => {
    socket.emit("joinRoom", location.state.room);
    const messageListener = (message) => {
      setMessages((messages) => [...messages, message]);
      addMessages(message);
    };

    socket.on("message", messageListener);

    // Cleanup function
    return () => {
      socket.off("message", messageListener);
    };
  }, [location.state.room, addMessages]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (location.state.name && message) {
      socket.emit("sendMessage", {
        name: location.state.name,
        message,
        room: location.state.room,
      });
      setMessage("");
    }
  };

  const handleBackClick = () => {
    navigate("/codeeditor", { state: { name: location.state.name } });
  };

  return (
    <div>
      <h1 id="heading">{location.state.room}</h1>
      <Button onClick={handleBackClick} mt={4}>
        Back to Editor ✏️
      </Button>
      <div
        className="chat"
        style={{
          width: "50%",
          margin: "0 auto",
          position: "absolute",
          top: "24px",
          left: "25%",
        }}
      >
        <form onSubmit={handleSubmit}>
          <InputGroup size="md" mt={5}>
            <InputLeftAddon
              style={{ width: "109px", color: "orange", fontSize: "16px" }}
            >
              Message:
            </InputLeftAddon>
            <Input
              className="input-field"
              value={message}
              variant="flushed"
              pr="4.5rem"
              type="text"
              placeholder="   Your message"
              onChange={(event) => setMessage(event.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                type="submit"
                colorScheme="orange"
                style={{ fontSize: "17px" }}
              >
                Send
              </Button>
            </InputRightElement>
          </InputGroup>
        </form>
        <ul>
          {messages.map((msg, index) => (
            <li
              key={index}
              style={{
                color: msg.name === location.state.name ? "lightgreen" : "lightblue",
                textAlign: msg.name === location.state.name ? "right" : "left",
                listStyleType: "none",
                margin: "10px 0",
              }}
            >
              <strong>{msg.name}</strong>: {msg.message}
            </li>
          ))}
        </ul>
        <p id="note">
          NOTE: Discuss doubts with other users that are online. Remember to be
          patient & polite! Also, a user will not be able to see messages that
          were sent when they weren't in the chat.
        </p>
      </div>
    </div>
  );
};

export default LiveChat;
