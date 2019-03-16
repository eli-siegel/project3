import React, { Component } from 'react';
import '../App.css';

class Form extends Component {
  render() {
    return (
      <form id={this.props.cssId} onSubmit={this.props.func}>
        <input type="text" name="post" placeholder="Write a Post" />
        <input type="text" name="type" placeholder="Time/Date" />

        <button>{this.props.submitButton}</button>
      </form>
    );
  }
}

export default Form;