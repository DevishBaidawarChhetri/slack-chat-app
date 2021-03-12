import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Button,
  Form,
  Icon,
  Input,
  Label,
  Menu,
  Modal,
} from "semantic-ui-react";
import firebase from "../../firebase";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { toast } from "react-toastify";

class Channels extends Component {
  state = {
    user: this.props.currentUser,
    channels: [],
    modal: false,
    channelName: "",
    channelDetails: "",
    channelsRef: firebase.database().ref("channels"),
    firstLoad: true,
    activeChannel: "",
    channel: null,
    messagesRef: firebase.database().ref("messages"),
    notifications: [],
    typingRef: firebase.database().ref("typing"),
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
      details: channelDetails,
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
        // console.log("channel added");
        toast(`😲 New Channel Added! 🙏`);
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

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on("child_added", (snap) => {
      loadedChannels.push(snap.val());
      this.setState(
        {
          channels: loadedChannels,
        },
        () => this.setFirstChannel()
      );
      this.addNotificationListner(snap.key);
    });
  };

  removeListeners = () => {
    this.state.channelsRef.off();
  };

  // Notification Listner
  addNotificationListner = (channelId) => {
    this.state.messagesRef.child(channelId).on("value", (snap) => {
      if (this.state.channel) {
        this.handleNotifications(
          channelId,
          this.state.channel.id,
          this.state.notifications,
          snap
        );
      }
    });
  };

  // Handle Notification
  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;
    let index = notifications.findIndex(
      (notification) => notification.id === channelId
    );
    if (index !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total;
        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren();
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0,
      });
    }
    this.setState({ notifications });
  };

  // Setting First channel to global state
  setFirstChannel = () => {
    const firstChannel = this.state.channels[0];
    if (this.state.firstLoad && this.state.channels.length > 0) {
      this.props.setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
      this.setState({ channel: firstChannel });
    }
    this.setState({
      firstLoad: false,
    });
  };

  // Set Active to active channel
  setActiveChannel = (channel) => {
    this.setState({
      activeChannel: channel.id,
    });
  };

  // Change Channel
  changeChannel = (channel) => {
    this.setActiveChannel(channel);
    this.state.typingRef
      .child(this.state.channel.id)
      .child(this.state.user.uid)
      .remove();
    this.clearNotifications();
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
    this.setState({ channel });
  };

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(
      (notification) => notification.id === this.state.channel.id
    );
    if (index !== -1) {
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].total = this.state.notifications[
        index
      ].lastKnownTotal;
      updatedNotifications[index].count = 0;
      this.setState({ notifications: updatedNotifications });
    }
  };

  // Get Notification Count
  getNotificationCount = (channel) => {
    let count = 0;
    this.state.notifications.forEach((notification) => {
      if (notification.id === channel.id) {
        count = notification.count;
      }
    });
    if (count > 0) return count;
  };

  // Display Available Channels
  displayChannels = (channels) =>
    channels.length > 0 &&
    channels.map((channel) => (
      <Menu.Item
        key={channel.id}
        onClick={() => {
          this.changeChannel(channel);
        }}
        name={channel.name}
        style={{ marginLeft: "1rem" }}
        active={channel.id === this.state.activeChannel}
      >
        {this.getNotificationCount(channel) && (
          <Label circular size="tiny" color="red">
            {this.getNotificationCount(channel)}
          </Label>
        )}
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
        <Menu.Menu className="menu">
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
        <Modal
          basic
          open={modal}
          //  onClose={() => this.handleModal(modal)}
        >
          <Modal.Header>Add Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  size="large"
                  name="channelName"
                  label={<Button color="teal" icon={"tag"} />}
                  labelPosition="left"
                  placeholder="Channel Name"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  size="large"
                  name="channelDetails"
                  label={<Button color="teal" icon={"info circle"} />}
                  labelPosition="left"
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

export default connect(null, { setCurrentChannel, setPrivateChannel })(
  Channels
);
