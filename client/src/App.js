import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { _loadPosts, _deletePost, _createPost, _updatePost } from './services/PostService';
import { _signUp, _login } from './services/AuthService';
import Post from './components/Post';
import Form from './components/Form';

class App extends Component {
  constructor() {
    super();

    this.state = {
      posts : [],
      name : '',
      edit_id : '',
      logged_in: false
    }

  }


  getToken = () => {
    return localStorage.getItem('token');
  }

  deletePost = (event) => {


    var id = event.target.getAttribute('data-id');

    return _deletePost(id, this.getToken()).then(deletedPostId => {

            let posts = this.state.posts.filter(post => post._id !== deletedPostId)

            this.setState({posts})
          })



  }

  createPost = (event) => {
    event.preventDefault();

    let name = event.target.children[0].value;
    let type = event.target.children[1].value;

    return _createPost(name, type, this.getToken()).then(rj => {
        let posts = [...this.state.posts, rj];
        this.setState({posts})
      })
  }

  updatePost = (event) => {
    event.preventDefault();

    let form = event.target;

    let updatedId = this.state.edit_id;
    let name = form.children[0].value;
    let type = form.children[1].value;

    return _updatePost(updatedId, name, type, this.getToken()).then(updatedPost => {

      let posts = this.state.posts.map(oldPost => {
        if (oldPost._id != updatedId) return oldPost;
        else return updatedPost;
      })

      this.setState({posts})
    })
  }

  editPost = (event) => {
    event.preventDefault();

    let name = event.target.getAttribute('data-name');
    let type = event.target.getAttribute('data-type');

    this.setState({
      edit_id : event.target.getAttribute('data-id')
    }, function(){

      let form = document.querySelector('#editForm');

      form.children[0].value = name;
      form.children[1].value = type;

    })


  }

  hideEditForm = (event) => {
    event.preventDefault();

    this.setState({edit_id : ""})
  }

  signUp = (event) => {
    event.preventDefault();

    let inputs = event.target.children;

    let username = inputs[0].value;
    let password = inputs[1].value;
    let passwordConf = inputs[2].value;

    if (password == passwordConf){

      return _signUp(username, password).then(res => {
        console.log(res);
        alert(res.message)
      });

    }else{
      alert('your password and password confirmation have to match!')
    }

  }

  login = (event) => {
    event.preventDefault();

    let inputs = event.target.children;

    let username = inputs[0].value;
    let password = inputs[1].value;

    return _login(username, password).then(res => {
      if (res.token){
        this.setState({logged_in: true}, function(){
          localStorage.setItem('token', res.token);
        });
      }else{
        alert('you were not logged in')
      }
    });
  }

  logout = (event) => {
    event.preventDefault();
    
    this.setState({logged_in: false}, function(){
      localStorage.removeItem('token');
    });
  }

  componentDidMount() {
    return _loadPosts()
      .then(resultingJSON => this.setState({posts : resultingJSON}))
  }

  render() {
    return (
      <div className="App">
        <header>
          

          {(!this.state.logged_in) && 
          
          <div>
            <h2>Sign Up</h2>

            <form id="signUpForm" onSubmit={this.signUp}>
              <input type="text" name="username" placeholder="put in a username" />
              <input type="password" name="password" placeholder="put in a password" />
              <input type="password" name="password" placeholder="confirm your password" />

              <button>Sign Up</button>
            </form>

            <h2>Log In</h2>

            <form id="logInForm" onSubmit={this.login}>
              <input type="text" name="username" placeholder="put in a username" />
              <input type="password" name="password" placeholder="put in a password" />

              <button>Log In</button>
            </form>

            <br /><br /><br />
          </div>}

          {(this.state.logged_in) && 
          
          <div>
            <h2>Sign Out</h2>

            <form id="logOutForm" onSubmit={this.logout}>
              <button>Log Out</button>
              <br></br><br></br>
            </form>

            <Form func= {this.createPost} submitButton="Add Task" />

            {(this.state.edit_id != "") && <Form cssId="editForm" func={this.updatePost} submitButton="Update Task" />}

            {(this.state.edit_id != "") && <a href="#" onClick={this.hideEditForm}>Hide Edit form</a>}

            {this.state.posts.map((x) => <Post _id={x._id} name={x.name} type={x.type} delete={this.deletePost} edit={this.editPost} />)}

            <br /><br /><br />
          </div>}

        </header>
      </div>
    );
  }
}

export default App;