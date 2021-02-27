import React, { Component } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessageForm from "./MessageForm";
import MessagesHeader from "./MessagesHeader";

class Messages extends Component {
  render() {
    return (
      <>
        <MessagesHeader />
        <Segment className="messages-container">
          <Comment className="messages">{/* Messages */}</Comment>
        </Segment>
        <MessageForm />
      </>
    );
  }
}
export default Messages;
