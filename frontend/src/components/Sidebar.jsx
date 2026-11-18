import ContactItem from "./ContactItem";

function Sidebar({
  contacts,
  activeId,
  messages,
  onSelectContact,
  search,
  setSearch,
  showChat,
}) {
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className={`sidebar ${showChat ? "sidebar-hidden" : ""}`}>
      <div className="brand">
        <div className="brand-icon">C</div>

        <div>
          <h1>Connect Chat</h1>
          <p>Stay connected</p>
        </div>
      </div>

      <div className="search-box">
        <span>🔎</span>

        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="section-heading">
        <span>MESSAGES</span>
        <span>{filteredContacts.length}</span>
      </div>

      <div className="contact-list">
        {filteredContacts.map((contact) => (
          <ContactItem
            key={contact.id}
            contact={contact}
            active={activeId === contact.id}
            messages={messages[contact.id] || []}
            onClick={() => onSelectContact(contact.id)}
          />
        ))}

        {filteredContacts.length === 0 && (
          <p className="empty-search">No contacts found.</p>
        )}
      </div>

      <div className="profile">
        <div className="avatar my-avatar">Y</div>

        <div className="profile-info">
          <strong>You</strong>
          <span>My account</span>
        </div>

        <div className="profile-menu">•••</div>
      </div>
    </aside>
  );
}

export default Sidebar;