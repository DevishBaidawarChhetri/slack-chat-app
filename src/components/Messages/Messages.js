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
    numUniqueUsers: "",
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
      this.countUniqueUsers(loadedMessages);
    });
  };

  // Displaying Messages
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

  // Displaying Channel name
  displayChannelName = (channel) => (channel ? `#${channel.name}` : "");

  // Count total unique user in current channel
  countUniqueUsers = (messages) => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
    this.setState({ numUniqueUsers });
  };

  render() {
    const { messagesRef, channel, user, messages, numUniqueUsers } = this.state;
    return (
      <>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
        />
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
