import React, { useState } from 'react';
import '../styles/Message.css';
import DeleteMessage from './DeleteMessage';
import ReplyMessage from './ReplyMessage';
import RepliesList from './RepliesList';
import axios from 'axios';


function Message({ ident, author, content, date, onDeleteMessage, replies, topic }) {
    const [showReplies, setShowReplies] = useState(false);
    const [replyMessages, setReplyMessages] = useState([]);
    console.log(replies);
    const handleToggleReplies = async () => {
        setShowReplies(!showReplies);
        // Si les réponses ne sont pas encore chargées et que le composant est ouvert
        if (!replyMessages.length && showReplies) {
            try {
                // Récupérez les messages correspondant aux IDs de réponses
                const response = await axios.post('/api/messages/replies', { replyIds: replies });
                setReplyMessages(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des réponses :', error);
            }
        }
    };

    const handleDeleteMessage = () => {
        onDeleteMessage(ident);
    };

    return (
        <div className='message-item'>
            <p>Le {date} : {author} a écrit "{content}" </p>
            <p>Topic : {topic}</p>

            <button onClick={handleToggleReplies}>Réponses</button>

            {showReplies && replyMessages.length > 0 && (
                <>
                    <ul>
                        {replyMessages.map((reply, index) => (
                            <li key={index}>
                                <Message
                                    ident={reply._id}
                                    author={reply.author}
                                    content={reply.content}
                                    date={reply.date}
                                    onDeleteMessage={onDeleteMessage}
                                    replies={reply.repliesID}
                                    topic={reply.topic}
                                />
                            </li>
                        ))}
                    </ul>
                </>
            )}
            <ReplyMessage messageId={ident} currentUser={author} />

            <DeleteMessage onDelete={handleDeleteMessage} messageId={ident} />
        </div>
    );
}

export default Message;
