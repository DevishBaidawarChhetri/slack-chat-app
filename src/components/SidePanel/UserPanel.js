import React, { Component } from "react";
import { Dropdown, Grid, Header, Icon, Image } from "semantic-ui-react";
import firebase from "../../firebase";

class UserPanel extends Component {
  state = {
    user: this.props.currentUser,
  };

  dropdownOptions = () => [
    {
      key: "user",
      text: (
        <span>
          Signed in as <strong>{this.state.user.displayName}</strong>
        </span>
      ),
      disabled: true,
    },
    {
      key: "avatar",
      text: <span>Change Avatar</span>,
    },
    {
      key: "signout",
      text: <span onClick={this.handleSignout}>Sign Out</span>,
    },
  ];

  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log("signed-out"));
  };

  render() {
    const { user } = this.state;
    return (
      <Grid style={{ background: "#4c3c4c" }}>
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
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;
