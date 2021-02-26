import React, { Component } from "react";
import { Button, Form, Icon, Menu, Modal } from "semantic-ui-react";
import firebase from "../../firebase";

class Channels extends Component {
  state = {
    user: this.props.currentUser,
    channels: [],
    modal: false,
    channelName: "",
    channelDetails: "",
    channelsRef: firebase.database().ref("channels"),
  };

  // Handle Input Changes
  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  // Handle Modal Visibility
  handleModal = (modal) => {
    this.setState({
      modal: !modal,
    });
  };

  // Adding Channel
  addChannel = () => {
    const {
      channelsRef,
      channelName,
      channelDetails,
      user,
      modal,
    } = this.state;
    const key = channelsRef.push().key;
    const newChannel = {
      id: key,
      name: channelName,
      detaiils: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL,
      },
    };

    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({
          channelName: "",
          channelDetails: "",
        });
        this.handleModal(modal);
        console.log("channel added");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // Handle Modal Submit
  handleSubmit = (event) => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };

  // Check if form is valid
  isFormValid = ({ channelName, channelDetails }) =>
    channelName && channelDetails;

  componentDidMount() {
    this.addListeners();
  }
  addListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on("child_added", (snap) => {
      loadedChannels.push(snap.val());
      this.setState({
        channels: loadedChannels,
      });
    });
  };

  // Display Available Channels
  displayChannels = (channels) =>
    channels.length > 0 &&
    channels.map((channel) => (
      <Menu.Item
        key={channel.id}
        onClick={() => {
          console.log(channel);
        }}
        name={channel.name}
        style={{ marginLeft: "1rem" }}
      >
        <Icon.Group>
          <Icon name="slack hash" />{" "}
          <span style={{ fontStyle: "normal" }}>{channel.name}</span>
        </Icon.Group>
      </Menu.Item>
    ));

  render() {
    const { channels, modal } = this.state;
    return (
      <>
        <Menu.Menu style={{ paddingBottom: "2rem" }}>
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>{" "}
            ({channels.length}){" "}
            <Icon
              style={{ cursor: "pointer" }}
              name="add"
              onClick={() => this.handleModal(modal)}
            />
          </Menu.Item>
          {/* All Channels */}
          {this.displayChannels(channels)}
        </Menu.Menu>

        {/* Modal for adding channel */}
        <Modal basic open={modal} onClose={() => this.handleModal(modal)}>
          <Modal.Header>Add Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Form.Input
                  fluid
                  size="large"
                  name="channelName"
                  icon="tag"
                  iconPosition="left"
                  placeholder="Channel Name"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Form.Input
                  fluid
                  size="large"
                  name="channelDetails"
                  icon="info circle"
                  iconPosition="left"
                  placeholder="Channel Details"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button
              color="red"
              inverted
              onClick={() => this.handleModal(modal)}
            >
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </>
    );
  }
}

export default Channels;
