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
        <p>
          Signed in as <strong>{this.state.user.displayName}</strong>
        </p>
      ),
      disabled: true,
    },
    {
      key: "avatar",
      text: <p>Change Avatar</p>,
    },
    {
      key: "signout",
      text: <p onClick={this.handleSignout}>Sign Out</p>,
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
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;
