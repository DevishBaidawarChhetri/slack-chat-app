import React, { Component } from "react";
import { connect } from "react-redux";
import { Menu, Icon } from "semantic-ui-react";
import firebase from "../../firebase";
import { setCurrentChannel, setPrivateChannel } from "../../actions";

class DirectMessages extends Component {
  state = {
    user: this.props.currentUser,
    users: [],
    usersRef: firebase.database().ref("users"),
    connectedRef: firebase.database().ref(".info/connected"),
    presenceRef: firebase.database().ref("presence"),
    activeChannel: "",
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListeners(this.state.user.uid);
    }
  }

  addListeners = (currentUserId) => {
    let loadedUsers = [];
    // Set Loaded users along with id and status
    this.state.usersRef.on("child_added", (snap) => {
      if (currentUserId !== snap.key) {
        let user = snap.val();
        // console.log(user);
        user["uid"] = snap.key;
        user["status"] = "offline";
        loadedUsers.push(user);
        this.setState({ users: loadedUsers });
      }
    });

    // Set preseence reference true if logged in
    this.state.connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        const ref = this.state.presenceRef.child(currentUserId);
        ref.set(true);
        ref.onDisconnect().remove((err) => {
          if (err !== null) {
            console.error(err);
          }
        });
      }
    });

    // Add Active Status to users
    this.state.presenceRef.on("child_added", (snap) => {
      if (currentUserId !== snap.key) {
        this.addStatusToUser(snap.key);
      }
    });

    // Remove Active Status to users
    this.state.presenceRef.on("child_removed", (snap) => {
      if (currentUserId !== snap.key) {
        this.addStatusToUser(snap.key, false);
      }
    });
  };

  // Add user status if logged in
  addStatusToUser = (userId, connected = true) => {
    const updatedUsers = this.state.users.reduce((acc, user) => {
      if (user.uid === userId) {
        user["status"] = `${connected ? "online" : "offline"}`;
      }
      return acc.concat(user);
    }, []);
    this.setState({ users: updatedUsers });
  };

  // Check user status for displaying "dot" status (online ? "Green" : "Grey" )
  isUserOnline = (user) => user.status === "online";

  // Change Channel for direct message
  changeChannel = (user) => {
    const channelId = this.getChannelId(user.uid);
    const channelData = {
      id: channelId,
      name: user.name,
    };
    this.props.setCurrentChannel(channelData);
    this.props.setPrivateChannel(true);
    this.setActiveChannel(user.uid);
  };

  // Set Active in active channel (Direct Message)
  setActiveChannel = (userId) => {
    this.setState({ activeChannel: userId });
  };

  getChannelId = (userId) => {
    const currentUserId = this.state.user.uid;
    return userId === currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`;
  };

  render() {
    const { users, activeChannel } = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            {/* <Icon name="mail" /> Direct Messages */}
            <Icon name="users" /> Total Users
          </span>{" "}
          ({users.length})
        </Menu.Item>
        {/* Users to send direct messages */}
        {users.map((user) => {
          return (
            // <Menu.Item
            //   key={user.uid}
            //   style={{ fontStyle: "italic" }}
            //   active={user.uid === activeChannel}
            //   onClick={() => this.changeChannel(user)}
            // >
            <Menu.Item
              key={user.uid}
              style={{ fontStyle: "italic" }}
              // active={user.uid === activeChannel}
              // onClick={() => this.changeChannel(user)}
            >
              <Icon
                name="circle"
                color={this.isUserOnline(user) ? "green" : "grey"}
                size="small"
              />
              @ {user.name}
            </Menu.Item>
          );
        })}
      </Menu.Menu>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(
  DirectMessages
);
