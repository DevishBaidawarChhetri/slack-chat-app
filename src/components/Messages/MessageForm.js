import React, { Component } from "react";
import { Button, Input, Segment } from "semantic-ui-react";
import firebase from "../../firebase";

class MessageForm extends Component {
  state = {
    message: "",
    user: this.props.currentUser,
    channel: this.props.currentChannel,
    loading: false,
    errors: [],
  };

  // Handle Message Input
  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  // Creating a Message
  createMessage = () => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL,
      },
      content: this.state.message,
    };
    return message;
  };

  // Handle Send Message
  handleSendMessage = () => {
    const { messagesRef } = this.props;
    const { message, channel } = this.state;
    if (message) {
      this.setState({ loading: true });
      messagesRef
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "", errors: [] });
        })
        .catch((err) => {
          console.error(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err),
          });
        });
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: "Add a message" }),
      });
    }
  };

  render() {
    const { errors, message, loading } = this.state;
    return (
      <Segment className="message-form">
        <Input
          fluid
          name="message"
          className={
            errors.some((error) => error.message.includes("message"))
              ? "error"
              : ""
          }
          value={message}
          style={{ marginBottom: "0.7em" }}
          label={<Button icon={"add"} />}
          labelPosition="left"
          placeholder="Write your message"
          onChange={this.handleChange}
        />
        <Button.Group icon widths="2">
          <Button
            color="orange"
            content="Add Reply"
            labelPosition="left"
            icon="edit"
            onClick={this.handleSendMessage}
            disabled={loading}
          />
          <Button
            color="teal"
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
          />
        </Button.Group>
      </Segment>
    );
  }
}

export default MessageForm;
