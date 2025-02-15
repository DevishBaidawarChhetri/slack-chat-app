import React from "react";
import { Comment, Image } from "semantic-ui-react";
import moment from "moment";

// Check own message
const isOwnMessage = (msg, usr) => {
  return msg.user.id === usr.uid ? "message_self" : "message_other";
};

// TimeStamp
const timeFromNow = (timestamp) => moment(timestamp).fromNow();

// Check if message has an Image
const isImage = (message) => {
  return message.hasOwnProperty("image") && !message.hasOwnProperty("content");
};

const conditions = ["http://", "https://", "www"];

const Message = ({ message, user }) => (
  <Comment.Group>
    <Comment>
      <Comment.Avatar src={message.user.avatar} />
      <Comment.Content className={isOwnMessage(message, user)}>
        <Comment.Author as="a" style={{ textDecoration: "underline" }}>
          {message.user.name}
        </Comment.Author>
        <Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>
        {isImage(message) ? (
          <Image src={message.image} className="message_image" />
        ) : conditions.some((isLink) => message.content.includes(isLink)) ? (
          <Comment.Text>
            <a
              style={{ textDecoration: "underline" }}
              href={message.content}
              target="_blank"
            >
              {message.content}
            </a>
          </Comment.Text>
        ) : (
          <Comment.Text>{message.content}</Comment.Text>
        )}
      </Comment.Content>
    </Comment>
  </Comment.Group>
);

export default Message;
