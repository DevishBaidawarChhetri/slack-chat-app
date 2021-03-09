import React, { Component } from "react";
import {
  Accordion,
  Header,
  Icon,
  Image,
  List,
  Segment,
} from "semantic-ui-react";

class MetaPanel extends Component {
  state = {
    activeIndex: 0,
    privateChannel: this.props.isPrivateChannel,
    channel: this.props.currentChannel,
  };

  setActiveIndex = (event, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
  };

  // Format count
  formatCount = (num) => (num > 1 ? `${num} posts` : `${num} post`);

  // Displaying top users with high posts
  displayTopPosters = (posts) =>
    // console.log(
    //   Object.entries(posts)
    //     .sort((a, b) => b[1].count - a[1].count)

    // );

    Object.entries(posts)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([key, value], i) => (
        <List.Item key={i}>
          <Image avatar src={value.avatar} />
          <List.Content>
            <List.Header as="a">{key}</List.Header>
            <List.Description>{this.formatCount(value.count)}</List.Description>
          </List.Content>
          <hr />
        </List.Item>
      ))
      .slice(0, 3);

  render() {
    const { activeIndex, privateChannel, channel } = this.state;
    const { userPosts } = this.props;

    if (privateChannel) return null;

    return (
      <Segment loading={!channel}>
        <Header as="h3" attached="top">
          About #{channel && channel.name}
        </Header>
        {/* Channel Details */}
        <Accordion styled attached="true">
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="info" />
            Channel Details
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            {channel && channel.details}
          </Accordion.Content>

          {/* Channel Top Posters */}
          <Accordion.Title
            active={activeIndex === 1}
            index={1}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="user circle" />
            Top Posters
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            <List>{userPosts && this.displayTopPosters(userPosts)}</List>
          </Accordion.Content>

          {/* Channel Created By */}
          <Accordion.Title
            active={activeIndex === 2}
            index={2}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="pencil alternate" />
            Created By
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <Header as="h4">
              <Image circular src={channel && channel.createdBy.avatar} />
              {channel && channel.createdBy.name}
            </Header>
          </Accordion.Content>
        </Accordion>
      </Segment>
    );
  }
}
export default MetaPanel;
