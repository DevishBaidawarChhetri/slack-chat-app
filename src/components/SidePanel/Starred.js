import React, { Component } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { Icon, Menu } from "semantic-ui-react";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import firebase from "../../firebase";

class Starred extends Component {
  state = {
    starredChannels: [],
    activeChannel: "",
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListeners(this.state.user.uid);
    }
  }

  // Listner
  addListeners = (userId) => {
    this.state.usersRef
      .child(userId)
      .child("starred")
      .on("child_added", (snap) => {
        const starredChannel = { id: snap.key, ...snap.val() };
        this.setState({
          starredChannels: [...this.state.starredChannels, starredChannel],
        });
      });
    this.state.usersRef
      .child(userId)
      .child("starred")
      .on("child_removed", (snap) => {
        const channelToRemove = { id: snap.key, ...snap.val() };
        const filteredChannels = this.state.starredChannels.filter(
          (channel) => {
            return channel.id !== channelToRemove.id;
          }
        );
        this.setState({ starredChannels: filteredChannels });
      });
  };

  // Display Available Channels
  displayChannels = (starredChannels) =>
    starredChannels.length > 0 &&
    starredChannels.map((channel) => (
      <Menu.Item
        key={channel.id}
        onClick={() => {
          this.changeChannel(channel);
        }}
        name={channel.name}
        style={{ marginLeft: "1rem" }}
        active={channel.id === this.state.activeChannel}
      >
        <Icon.Group>
          <Icon name="slack hash" />{" "}
          <span style={{ fontStyle: "normal" }}>{channel.name}</span>
        </Icon.Group>
      </Menu.Item>
    ));

  // Set Active to active channel
  setActiveChannel = (channel) => {
    this.setState({
      activeChannel: channel.id,
    });
  };

  // Change Channel
  changeChannel = (channel) => {
    this.setActiveChannel(channel);
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
  };

  render() {
    const { starredChannels } = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star" /> STARRED
          </span>{" "}
          ({starredChannels.length}){" "}
        </Menu.Item>
        {/* All Channels */}
        {this.displayChannels(starredChannels)}
      </Menu.Menu>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(Starred);
