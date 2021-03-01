import React, { Component } from "react";
import { Modal, Input, Button, Icon } from "semantic-ui-react";

class FileModal extends Component {
  render() {
    const { modal, handleModal } = this.props;
    return (
      <Modal basic open={modal}>
        <Modal.Header>Select an Image File</Modal.Header>
        <Modal.Content>
          <Input fluid label="File types: JPEG, PNG" name="file" type="file" />
        </Modal.Content>
        <Modal.Actions>
          <Button color="green" inverted>
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
