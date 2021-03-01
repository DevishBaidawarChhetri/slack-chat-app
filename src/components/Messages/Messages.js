import React, { Component } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessageForm from "./MessageForm";
import MessagesHeader from "./MessagesHeader";
import firebase from "../../firebase";
import Message from "./Message";

class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    mesasges: [],
    messagesLoading: true,
  };

  // Adding Listner
  componentDidMount() {
    const { channel, user } = this.state;
    if (channel && user) {
      this.addListeners(channel.id);
    }
  }

  addListeners = (channelId) => {
    this.addMessageListener(channelId);
  };

  addMessageListener = (channelId) => {
    let loadedMessages = [];
    this.state.messagesRef.child(channelId).on("child_added", (snap) => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messagesLoading: false,
      });
    });
  };

  displayMessages = (messages) => {
    if (messages && messages.length) {
      return messages.map((message) => (
        <Message
          key={message.timestamp}
          message={message}
          user={this.state.user}
        />
      ));
    }
  };

  render() {
    const { messagesRef, channel, user, messages } = this.state;
    return (
      <>
        <MessagesHeader />
        <Segment className="messages-container">
          <Comment className="messages">
            {/* Messages */}
            {this.displayMessages(messages)}
          </Comment>
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
