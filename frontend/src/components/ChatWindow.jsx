import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { useEffect, useRef } from "react";

function ChatWindow({activeContact, messages, input, setInput, onSend, showChat, setShowChat,}){
    const conversationRef = useRef(null);
    useEffect(()=>{
        const conversation = conversationRef.current;
        if(conversation){
            conversationRef.scrollTop = conversation.scrollHeight;
        }
    }, [messages]);
    if (!activeContact) {
        return (
            <main className="chat-panel">
                <div className="empty-chat">
                    <h3>Welcome to Connect Chat!</h3>
                    <p>Select a contact to start chatting.</p>
                </div>
            </main>
        );
    }
    return(
        <main className={`chat-panel ${!showChat?"chat-hidden":""}`}>
            <header className="chat-header">
                <button className="back-button" onClick={()=>setShowChat(false)} aria-label="Back to contacts">
                   ⬅️
                </button>
                <div className="avatar header-avatar" style={{backgroundColor:activeContact.color}}>
                    {activeContact.initials}
                    <span className={`status-dot ${activeContact.status==="online"?"online":""}`}>

                    </span>
                </div>
                <div className="header-info">
                    <h2>{activeContact.name}</h2>
                    <p>{activeContact.status}</p>
                </div>
                <button className="header-action" aria-label="More options">...</button>
            </header>
            <div className="conversation" ref={conversationRef}>
                <div className="date-divider">
                    <span>Today</span>
                </div>
                {messages.map((message)=>(
                    <MessageBubble key={message.id} message={message}/>
                ))}
                {messages.length===0&&(
                    <div className="empty-chat">
                        <div>👋</div>
                        <h3>Say hello to {activeContact.name}!</h3>
                        <p>Your conversation starts here.</p>
                    </div>
                )}
            </div>
            <MessageInput input={input} setInput={setInput} onSend={onSend} contactName={activeContact.name}/>
        </main>
    );
}
export default ChatWindow;