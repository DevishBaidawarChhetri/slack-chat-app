import React, { Component } from "react";
import { SliderPicker } from "react-color";
import { connect } from "react-redux";
import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Icon,
  Label,
  Segment,
} from "semantic-ui-react";
import firebase from "../../firebase";
import { setColors } from "../../actions";

class ColorPanel extends Component {
  state = {
    modal: false,
    primaryColor: "",
    secondaryColor: "",
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
    userColors: [],
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListner(this.state.user.uid);
    }
  }

  // Add Listner for colors
  addListner = (userId) => {
    let userColors = [];
    this.state.usersRef.child(`${userId}/colors`).on("child_added", (snap) => {
      userColors.unshift(snap.val());
      this.setState({ userColors });
    });
  };

  // Handle Modal Visibility
  handleModal = (modal) => {
    this.setState({
      modal: !modal,
    });
  };

  // Handle Change Primary Color
  handlePrimaryColor = (primaryColor) => {
    this.setState({ primaryColor: primaryColor.hex });
  };
  // Handle Change Secondary Color
  handleSecondaryColor = (secondaryColor) => {
    this.setState({ secondaryColor: secondaryColor.hex });
  };

  // Handle Select selected colors
  handleSaveColors = () => {
    if (this.state.primaryColor && this.state.secondaryColor) {
      this.saveColors(
        this.state.primaryColor,
        this.state.secondaryColor,
        this.state.modal
      );
    }
  };

  // Save colors
  saveColors = (primaryColor, secondaryColor, modal) => {
    this.state.usersRef
      .child(`${this.state.user.uid}/colors`)
      .push()
      .update({
        primaryColor,
        secondaryColor,
      })
      .then(() => {
        // console.log("Colors Added");
        this.handleModal(modal);
      })
      .catch((err) => console.error(err));
  };

  displayUserColors = (colors) =>
    colors.length > 0 &&
    colors.map((color, i) => (
      <React.Fragment key={i}>
        <Divider />
        <div
          className="color_container"
          onClick={() =>
            this.props.setColors(color.primaryColor, color.secondaryColor)
          }
        >
          <div
            className="color_square"
            style={{ background: color.primaryColor }}
          >
            <div
              className="color_overlay"
              style={{ background: color.secondaryColor }}
            ></div>
          </div>
        </div>
      </React.Fragment>
    ));
  render() {
    const { modal, primaryColor, secondaryColor, userColors } = this.state;
    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button
          icon="add"
          size="small"
          color="blue"
          onClick={() => this.handleModal(modal)}
        />
        {this.displayUserColors(userColors)}
        {/* Color Picker Modal */}
        <Modal basic open={modal} onClose={() => this.handleModal(modal)}>
          <Modal.Header>Choose App Colors</Modal.Header>
          <Modal.Content>
            <Segment inverted>
              <Label content="Primary Color" style={{ marginBottom: "1rem" }} />
              <SliderPicker
                color={primaryColor}
                onChange={this.handlePrimaryColor}
              />
            </Segment>
            <Segment inverted>
              <Label
                content="Secondary Color"
                style={{ marginBottom: "1rem" }}
              />
              <SliderPicker
                color={secondaryColor}
                onChange={this.handleSecondaryColor}
              />
            </Segment>
          </Modal.Content>

          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColors}>
              <Icon name="checkmark" /> Save Colors
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
      </Sidebar>
    );
  }
}
export default connect(null, { setColors })(ColorPanel);
