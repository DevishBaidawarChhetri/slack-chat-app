import React, { Component } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessageForm from "./MessageForm";
import MessagesHeader from "./MessagesHeader";
import firebase from "../../firebase";

class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
  };
  render() {
    const { messagesRef, channel, user } = this.state;
    return (
      <>
        <MessagesHeader />
        <Segment className="messages-container">
          <Comment className="messages">{/* Messages */}</Comment>
        </Segment>
        <MessageForm
          messagesRef={messagesRef}
          currentUser={user}
          currentChannel={channel}
        />
      </>
    );
  }
}
export default Messages;
