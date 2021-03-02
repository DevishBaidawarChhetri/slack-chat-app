import React, { Component } from "react";
import { Button, Input, Segment } from "semantic-ui-react";
import firebase from "../../firebase";
import FileModal from "./FileModal";
import { v4 as uuidv4 } from "uuid";
import ProgressBar from "./ProgressBar";

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

  // Uploading file
  uploadFile = (file, metadata) => {
    const ext = file.name.split(".").pop(); // get file extension
    const pathToUpload = this.state.channel.id;
    const ref = this.props.messagesRef;
    const filePath = `chat/public/${uuidv4()}.${ext}`;
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
    ref
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

  render() {
    const {
      errors,
      message,
      loading,
      modal,
      uploadState,
      percentUploaded,
    } = this.state;
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
      </Segment>
    );
  }
}

export default MessageForm;
