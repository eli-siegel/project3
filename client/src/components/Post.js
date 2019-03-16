import React, { Component } from 'react';
import '../App.css';

class Post extends Component {
  render() {
    return (
      <p key={this.props._id}> 
        {this.props.name} | {this.props.type} <button onClick={this.props.delete} data-id={this.props._id}>x</button> 
        | <a onClick={this.props.edit} href="#" data-id={this.props._id} data-name={this.props.name} data-type={this.props.type}>edit</a>
      </p>
    );
  }
}

export default Post;