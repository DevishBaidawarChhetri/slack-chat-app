import React, { Component } from "react";
import { Modal, Input, Button, Icon } from "semantic-ui-react";
import mime, { contentType } from "mime-types";

class FileModal extends Component {
  state = {
    file: null,
    authorizedFileType: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
  };

  // File Handler
  fileHandler = (event) => {
    const file = event.target.files[0];
    // console.log(file.type);
    if (file) {
      this.setState({ file });
    }
  };

  // Check if file is accepted
  isAuthorized = (fileName) =>
    this.state.authorizedFileType.includes(mime.lookup(fileName));

  // Clearing File
  clearFile = () => this.setState({ file: null });

  // Send File Handler
  sendFileHandler = () => {
    const { file } = this.state;
    const { uploadFile, modal, handleModal } = this.props;
    if (file !== null) {
      if (this.isAuthorized(file.name)) {
        const metadata = { contentType: mime.lookup(file.name) };
        uploadFile(file, metadata);
        handleModal(modal);
        this.clearFile();
      }
    }
  };

  render() {
    const { modal, handleModal } = this.props;
    return (
      <Modal basic open={modal}>
        <Modal.Header>Select an Image File</Modal.Header>
        <Modal.Content>
          <Input
            onChange={this.fileHandler}
            fluid
            label="File types: JPEG/JPG, PNG, GIF"
            labelPosition="right"
            name="file"
            type="file"
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.sendFileHandler} color="green" inverted>
            <Icon name="checkmark" /> Send
          </Button>
          <Button color="red" inverted onClick={() => handleModal(modal)}>
            <Icon name="remove" /> Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default FileModal;
