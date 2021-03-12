import React, { Component } from "react";
import { Button, Form, Input, Segment } from "semantic-ui-react";
import firebase from "../../firebase";
import FileModal from "./FileModal";
import { v4 as uuidv4 } from "uuid";
import ProgressBar from "./ProgressBar";
import { Picker, emojiIndex } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

class MessageForm extends Component {
  state = {
    message: "",
    user: this.props.currentUser,
    channel: this.props.currentChannel,
    loading: false,
    errors: [],
    modal: false,
    uploadState: "",
    uploadTask: null,
    storageRef: firebase.storage().ref(),
    percentUploaded: 0,
    typingRef: firebase.database().ref("typing"),
    emojiPicker: false,
  };

  // Handle Message Input
  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  // Handle Modal Visibility
  handleModal = (modal) => {
    this.setState({
      modal: !modal,
    });
  };

  // Creating a Message
  createMessage = (fileUrl = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL,
      },
    };
    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = this.state.message;
    }
    return message;
  };

  // Handle Send Message
  handleSendMessage = () => {
    const { getMessagesRef } = this.props;
    const { message, channel, user, typingRef } = this.state;
    if (message) {
      this.setState({ loading: true });
      getMessagesRef()
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "", errors: [] });
          typingRef.child(channel.id).child(user.uid).remove();
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

  // Handle Key Down (Showing animation while others are typing)
  handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      // check key code at http://keycode.info/
      
      this.handleSendMessage();
    }
    const { channel, message, typingRef, user } = this.state;
    if (message) {
      typingRef.child(channel.id).child(user.uid).set(user.displayName);
    } else {
      typingRef.child(channel.id).child(user.uid).remove();
    }
  };

  // Setting up the path
  getPath = () => {
    if (this.props.isPrivateChannel) {
      return `chat/private-${this.state.channel.id}`;
    } else {
      return `chat/public`;
    }
  };

  // Uploading file
  uploadFile = (file, metadata) => {
    const ext = file.name.split(".").pop(); // get file extension
    const pathToUpload = this.state.channel.id;
    const ref = this.props.getMessagesRef;
    const filePath = `${this.getPath()}/${uuidv4()}.${ext}`;
    console.log(filePath);
    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.state.storageRef.child(filePath).put(file, metadata),
      },
      () => {
        this.state.uploadTask.on(
          "state_change",
          (snap) => {
            const percentUploaded =
              Math.round(snap.bytesTransferred / snap.totalBytes) * 100;
            this.setState({ percentUploaded });
          },
          (err) => {
            console.error(err);
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null,
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then((downloadUrl) => {
                this.sendFileMessage(downloadUrl, ref, pathToUpload);
              })
              .catch((err) => {
                console.error(err);
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null,
                });
              });
          }
        );
      }
    );
  };

  // Send File
  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref()
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: "done" });
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err),
        });
      });
  };

  // Toggle Emoji Picker
  handleTogglePicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker });
  };

  // Handle Picked Emoji
  handleAddEmoji = (emoji) => {
    const oldMessage = this.state.message;
    const newMessage = this.colonToUnicode(`${oldMessage} ${emoji.colons} `);
    this.setState({ message: newMessage, emojiPicker: false });
    setTimeout(() => this.messageInputRef.focus(), 0);
  };

  colonToUnicode = (message) => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, (x) => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };

  render() {
    const {
      errors,
      message,
      loading,
      modal,
      uploadState,
      percentUploaded,
      emojiPicker,
    } = this.state;
    return (
      <Segment className="message-form">
        {emojiPicker && (
          <div className="emoji_holder">
            <Picker
              set="facebook"
              className="emoji_picker"
              title="Pick Your Emoji"
              emoji="point_up"
              theme="auto"
              onSelect={this.handleAddEmoji}
            />
          </div>
        )}
        {/* <Form size="large" onSubmit={this.handleSendMessage}> */}
        <Input
          fluid
          name="message"
          className={
            errors.some((error) => error.message.includes("message"))
              ? "error"
              : ""
          }
          value={message}
          ref={(node) => (this.messageInputRef = node)}
          style={{ marginBottom: "0.7em" }}
          label={
            <Button
              icon={emojiPicker ? "close" : "smile outline"}
              onClick={this.handleTogglePicker}
            />
          }
          color="red"
          labelPosition="left"
          placeholder="Write your message"
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
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
            disabled={uploadState === "uploading"}
            onClick={() => this.handleModal(modal)}
          />
          <FileModal
            modal={modal}
            handleModal={() => this.handleModal(modal)}
            uploadFile={this.uploadFile}
          />
        </Button.Group>
        <FileModal
          modal={modal}
          handleModal={() => this.handleModal(modal)}
          uploadFile={this.uploadFile}
        />
        <ProgressBar
          uploadState={uploadState}
          percentUploaded={percentUploaded}
        />
        {/* </Form> */}
      </Segment>
    );
  }
}

export default MessageForm;
