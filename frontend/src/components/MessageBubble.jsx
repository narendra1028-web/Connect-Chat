
function MessageBubble({ message }) {
  const isMine = message.sender === "me";

  return (
    <div className={`message-row ${isMine ? "message-mine" : ""}`}>
      <div className={`message-bubble ${isMine ? "bubble-mine" : "bubble-theirs"}`}>
        <p>{message.text}</p>

        <div className="message-meta">
          <span className="message-time">{message.time}</span>

          {isMine && (
            <span className={`message-status ${message.status || "sent"}`} aria-label={`Message ${message.status || "sent"}`} title={`Message ${message.status || "sent"}`}>
              {message.status === "read"
                ? "✓✓"
                : message.status === "delivered"
                ? "✓✓"
                : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;