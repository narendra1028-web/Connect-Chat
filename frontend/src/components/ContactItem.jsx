function ContactItem({contact, active, messages, onClick}){
    const lastMessage = messages.length>0?messages[messages.length-1].text:"Start a conversation";
    const lastMessageTime = messages.length>0?messages[messages.length-1].time:"";
    return(
        <button className={`contact ${active ? "contact-active":""}`} onClick={onClick}>
            <div className="avatar" style={{background:contact.color}}>
                {contact.initials}
                <span className={`status-dot ${contact.status==="online"?"online":""}`}/>
            </div>
            <div className="contact-info">
                <div className="contact-top">
                    <strong>{contact.name}</strong>
                    <span className="contact-time">
                        {lastMessage?.time||""}
                    </span>
                </div>
                <p>{lastMessage?.text||"Start a converstion"}</p>
            </div>
        </button>
    );
}
export default ContactItem;4