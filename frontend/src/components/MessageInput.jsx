function MessageInput({input, setInput, onSend, contactName}){
    return(
        <>
        <form onSubmit={onSend} className="message-form">
            <input type="text" placeholder={`Message ${contactName}...`} value={input} onChange={(event)=> setInput(event.target.value)}  aria-label="Message text"/>
            <button type="submit" disabled={!input.trim()}>
                Send <span>➡️</span>
            </button>
        </form>
        <p className="footer-note">
            Connect with the people who matter.
        </p>
        </>
    );
}
export default MessageInput;