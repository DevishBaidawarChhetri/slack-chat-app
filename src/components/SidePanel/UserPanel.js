import React, { Component } from "react";
import AvatarEditor from "react-avatar-editor";
import { toast } from "react-toastify";
import {
  Button,
  Dropdown,
  Grid,
  Header,
  Icon,
  Image,
  Input,
  Modal,
} from "semantic-ui-react";
import firebase from "../../firebase";

class UserPanel extends Component {
  state = {
    user: this.props.currentUser,
    modal: false,
    previewImage: "",
    croppedImage: "",
    uploadedCroppedImage: "",
    blob: null,
    storageRef: firebase.storage().ref(),
    userRef: firebase.auth().currentUser,
    usersRef: firebase.database().ref("users"),
    metadata: {
      contentType: "image/jpeg",
    },
  };

  // Handle Modal lenghty process... lol 😆 (Just for test)
  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });

  // Dropdown Options
  dropdownOptions = () => [
    {
      key: "user",
      text: (
        <p>
          Signed in as <strong>{this.state.user.displayName}</strong>
        </p>
      ),
      disabled: true,
    },
    {
      key: "avatar",
      text: <p onClick={this.openModal}>Change Avatar</p>,
    },
    {
      key: "signout",
      text: <p onClick={this.handleSignout}>Sign Out</p>,
    },
  ];

  // Handle Change
  handleChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        this.setState({ previewImage: reader.result });
      });
    }
  };

  // Handle Crop Image
  handleCropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob((blob) => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageUrl,
          blob,
        });
      });
    }
  };

  // uploadCroppedImage handler
  uploadCroppedImage = () => {
    const { storageRef, userRef, blob, metadata } = this.state;
    storageRef
      .child(`avatars/user-${userRef.uid}`)
      .put(blob, metadata)
      .then((snap) => {
        snap.ref.getDownloadURL().then((downloadURL) => {
          this.setState({ uploadedCroppedImage: downloadURL }, () =>
            this.changeAvatar()
          );
        });
      });
  };

  // Changing user avatar
  changeAvatar = () => {
    this.state.userRef
      .updateProfile({
        photoURL: this.state.uploadedCroppedImage,
      })
      .then(() => {
        console.log("PhotoURL Updated");
        this.closeModal();
      })
      .catch((err) => {
        console.error(err);
      });

    this.state.usersRef
      .child(this.state.user.uid)
      .update({ avatar: this.state.uploadedCroppedImage })
      .then(() => {
        console.log("User Avatar Updated ");
        toast("😎 Avatar Updated Successfully! 😝");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // Handeling Signout
  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log("signed-out"));
  };

  render() {
    const { user, modal, previewImage, croppedImage } = this.state;
    const { primaryColor } = this.props;

    return (
      <Grid style={{ background: primaryColor }}>
        <Grid.Column>
          {/* Header */}
          <Grid.Row
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "1.2em",
            }}
          >
            <Header inverted as="h2">
              <Icon name="slack" />
              <Header.Content style={{ paddingLeft: "0.5rem" }}>
                Slack
              </Header.Content>
            </Header>
          </Grid.Row>
          {/* Dropdown */}
          <Header
            style={{
              margin: "0",
              textAlign: "center",
              paddingBottom: "1rem",
            }}
            as="h4"
            inverted
          >
            <Dropdown
              trigger={
                <span>
                  <Image src={user.photoURL} spaced="right" avatar />
                  {user.displayName}
                </span>
              }
              options={this.dropdownOptions()}
            />
          </Header>
          {/* Change avatar */}
          <Modal basic inverted="true" open={modal} onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input
                fluid
                type="file"
                label="New Avatar"
                name="previewImage"
                onChange={this.handleChange}
              />
              <Grid centered stackable columns={3}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {/* Image Preview */}
                    {previewImage && (
                      <AvatarEditor
                        image={previewImage}
                        width={120}
                        height={120}
                        border={50}
                        scale={1.2}
                        ref={(node) => (this.avatarEditor = node)}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {/* Cropped Image */}
                    {croppedImage && (
                      <Image
                        style={{ margin: "3.5em auto" }}
                        width={100}
                        height={100}
                        src={croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {croppedImage && (
                <Button
                  inverted
                  color="green"
                  onClick={this.uploadCroppedImage}
                >
                  <Icon name="save" /> Change Avatar
                </Button>
              )}
              <Button inverted color="blue" onClick={this.handleCropImage}>
                <Icon name="image" /> Preview
              </Button>
              <Button inverted color="red" onClick={this.closeModal}>
                <Icon name="remove" /> Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;
