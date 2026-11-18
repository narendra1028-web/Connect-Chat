import { useEffect, useState } from "react";
import socket from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import "../App.css";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

function Chat() {
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showChat, setShowChat] = useState(false);
  const { user, token } = useAuth();
  const [onlineUserIds, setOnlineUserIds] = useState(null);

  const activeContact = contacts.find((contact) => contact.id === activeId);
  const currentMessages = messages[activeId] || [];
   
  useEffect(() => {
    if (!token || !user) return;

    socket.auth = { token };

    // Handle incoming messages
    function handleNewMessage(message) {
        console.log("New message received:", message);

        const contactId =
            String(message.sender) === String(user.id)
                ? String(message.receiver)
                : String(message.sender);

        const newMessage = {
            id: message._id,
            text: message.content,
            sender: "them",
            status: "received",
            time: new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
        };

        setMessages((previous) => ({
            ...previous,
            [contactId]: [
                ...(previous[contactId] || []),
                newMessage
            ]
        }));
        socket.emit("message_delivered", {
           messageId: message._id
        });
    }

    // Handle user coming online
   function handleUserOnline({ userId }) {
      setOnlineUserIds((previous) => {
        const updatedIds = previous || [];
        return [...new Set([...updatedIds, String(userId)])];
      });
    }

// Handle user going offline
   function handleUserOffline({ userId }) {
     setOnlineUserIds((previous) => {
        if (!previous) return [];

        return previous.filter(
            (id) => String(id) !== String(userId)
        );
     });
   }

// Handle currently online users
   function handleOnlineUsers(userIds) {
    console.log("Currently online users:", userIds);
    setOnlineUserIds(userIds.map(String));
   }
    const handleMessageStatusUpdated = (updatedMessage) => {
      setMessages((previous) => {
        const updatedMessages = { ...previous };

        Object.keys(updatedMessages).forEach((contactId) => {
            updatedMessages[contactId] = updatedMessages[contactId].map((msg) =>
                msg.id === updatedMessage.messageId
                    ? { ...msg, status: updatedMessage.status }
                    : msg
            );
        });

        return updatedMessages;
      });
    };
    // Register listeners BEFORE connecting
    socket.on("new_message", handleNewMessage);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("online_users", handleOnlineUsers);
    socket.on("message_status_updated", handleMessageStatusUpdated);
    // Connect after registering listeners
    socket.connect();

    console.log("Connecting to Socket.IO...");

    return () => {
        socket.off("new_message", handleNewMessage);
        socket.off("user_online", handleUserOnline);
        socket.off("user_offline", handleUserOffline);
        socket.off("online_users", handleOnlineUsers);
        socket.off("message_status_updated", handleMessageStatusUpdated);
        socket.disconnect();
    };

}, [token, user]);
  useEffect(() => {
    if (onlineUserIds === null) return;

    setContacts((previous) =>
        previous.map((contact) => ({
            ...contact,
            status: onlineUserIds.includes(String(contact.id))
                ? "online"
                : "offline"
        }))
      );
}, [onlineUserIds]);
  async function sendMessage(event) {
    event.preventDefault();

    const text = input.trim();

    if (!text || !activeId) return;

    try {
        const response = await fetch(
            "http://localhost:5000/api/messages/send",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiver: activeId,
                    content: text
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to send message");
        }

        const msg = data.data;

        const newMessage = {
            id: msg._id,
            text: msg.content,
            sender: "me",
            status: "sent",
            time: new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })
        };

        setMessages((previous) => ({
            ...previous,
            [activeId]: [
                ...(previous[activeId] || []),
                newMessage
            ]
        }));

        setInput("");

    } catch (error) {
        console.error("Send message error:", error);
    }
  }
  function selectContact(id){
    setActiveId(id);
    setShowChat(true);
    fetchConversation(id);
    socket.emit("messages_read", {
        senderId: id
    });
  }
  useEffect(() => {
    async function fetchUsers(){
      try{
        const response = await fetch(
          "http://localhost:5000/api/users",
          {
            method:"GET",
            headers:{
              Authorization:`Bearer ${token}`
            }
          }
        );
        const data = await response.json();
        if(!response.ok){
          throw new Error(data.message || "Failed to fetch users");
        }
        const users = Array.isArray(data)?data:data.users || [];
        const otherUsers = users.filter(
          (item)=>item._id !== user.id
        );
        setContacts(
          otherUsers.map((item) => ({
            id:item._id,
            name:item.name,
            initials:item.name.split(" ").map((word)=>word[0]).join("").toUpperCase(),
            color:"#dde8ff",
            status:item.isOline?"online":"offline"
          }))
        );
      }catch(error){
        console.error("Error fetching users:", error);
      }
    }
    if(token && user){
      fetchUsers();
    }
  }, [token, user]);
  async function fetchConversation(contactId){
    try{
      const response = await fetch(`http://localhost:5000/api/messages/conversation/${contactId}`,
        {
          method:"GET",
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      console.log("Conversation API response:", data);
      console.log("Fetched messages:", data.messages);
      if(!response.ok){
        throw new Error(data.message || "Failed to fetch conversation");
      }
      const formattedMessages = data.messages.map((msg) => ({
        id:msg._id,
        text:msg.content,
        sender:msg.sender===user.id?"me":"them",
        time:new Date(msg.createdAt).toLocaleTimeString([], {
          hour:"2-digit",
          minute:"2-digit"
        }),
        status:msg.status || "sent"
      }));
      setMessages((previous) => ({
        ...previous,
        [contactId]: formattedMessages
      }));
      console.log("Formatted messages:", formattedMessages);
    }catch(error){
      console.error("Conversation error:", error);
    }
  }
  return(
    <div className="app-shell">
      <Sidebar contacts={contacts} activeId={activeId} messages={messages} onSelectContact={selectContact} search={search} setSearch={setSearch} showChat={showChat}/>
      <ChatWindow activeContact={activeContact} messages={currentMessages} input={input} setInput={setInput} onSend={sendMessage} showChat={showChat} setShowChat={setShowChat}/>
    </div>
  );
}
export default Chat;