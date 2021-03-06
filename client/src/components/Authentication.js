import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import 'react-tabs/style/react-tabs.css';
import axios from 'axios';
import { Container, Form, FormGroup, Button, Modal } from 'react-bootstrap';
import defaultAvatar from '../lib/default-avatar.jpg'
import bsCustomFileInput from 'bs-custom-file-input'

import './Authentication.css'



export default class Authentication extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      usernameavailable: true,
      showInvalidUserName: false,
      modalMessage: '',
      profilePic: null,
      uploadedImage: defaultAvatar,
      image: '',
      name: '',
      formData: '',
      info: {
        image: '',
        name: ''
      },
      fileLabel: 'Choose Profile Avatar'

    }

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleClose = this.handleClose.bind(this)
  }

  componentDidMount(){
    bsCustomFileInput.init()
  }
  handleUsernameChange = (e) => {
    this.setState(
      { username: e.target.value });
  }

  handlePasswordChange = (e) => {
    this.setState(
      { password: e.target.value });
  }


  handleClose = () => {
    this.setState(
      { showInvalidUserName: false }
    )
  }

  updateProfilePic = (event) => {
    this.setState(
      {
        uploadedImage: event.target.files[0],
        fileLabel: event.target.files[0].name
      },()=>{
        console.log(this.state.uploadedImage)
    console.log( defaultAvatar)
      }
    )

    
  }

  handleLog = async (e) => {
    e.preventDefault()
    await axios.get('http://localhost:3000/handleLogin', {
      headers: {
        username: this.state.username,
        password: this.state.password,
        isonline: 'yes'
      }
    })
      .then((res) => {
        if (res.data.login) {
          this.setState(
            {
              showInvalidUserName: true,
              modalMessage: 'Connection succeeded'
            }
          )
          sessionStorage.setItem('username', this.state.username);
          document.getElementById("Login-form").reset();
          this.props.history.push('/chat');
        }
        else {
          this.setState(
            {
              showInvalidUserName: true,
              modalMessage: res.data.message
            }
          )

          document.getElementById("Login-form").reset();
        }
      }).catch(err=>console.log('fault'));
  }

  upload = (e) => {
    let data = new FormData();
    data.append('Image', e.target.files[0]);
    data.append('name', e.target.files[0].name);
    this.setState(
      {
        formData: data
      }
    )
    this.setState(
      {
        image: URL.createObjectURL(e.target.files[0])
      }
    )
  }



  handleSign = async (e) => {
    e.preventDefault()

    const data = new FormData()

    data.append("username", this.state.username)
    data.append("password", this.state.password)
   if( this.state.uploadedImage)data.append("avatar", this.state.uploadedImage)
    


    await axios.post('http://localhost:3000/handleSignup', data)
      .then((res) => {
        if (res.data.registered) {
          this.setState(
            {
              showInvalidUserName: true,
              modalMessage: res.data.message
            }
          )
          sessionStorage.setItem('username', this.state.username);
          document.getElementById("Signup-form").reset();
          this.props.history.push('/chat');
        }
        else {
          this.setState(
            {
              showInvalidUserName: true,
              modalMessage: res.data.message
            }
          )
        }
      })
  }


  render() {
    return (


      <Container className= 'authentication' >
        <Modal show={this.state.showInvalidUserName} onHide={this.handleClose} animation={false}>
          <Modal.Header closeButton>
            <Modal.Title>error</Modal.Title>
          </Modal.Header>
          <Modal.Body>{this.state.modalMessage}</Modal.Body>
        </Modal>
        <Tabs>
          <TabList>
            <Tab>Log In</Tab>
            <Tab>Sign Up</Tab>
          </TabList>

          <TabPanel>
            <Form id="Login-form" onSubmit={this.handleLog}>
              <FormGroup>
                <Form.Control type="text" placeholder="Enter username" onChange={this.handleUsernameChange} />
              </FormGroup>
              <FormGroup>
                <Form.Control type="password" placeholder="Password" onChange={this.handlePasswordChange} />
              </FormGroup>
              <Button variant="primary" type="submit">
                Log In
              </Button>
            </Form>
          </TabPanel>

          <TabPanel>
            <Form id="Signup-form" onSubmit={this.handleSign}>
              <FormGroup>
                <Form.Control type="text" placeholder="Enter username" onChange={this.handleUsernameChange} />
              </FormGroup>
              <FormGroup>
                <Form.Control type="password" placeholder="Password" onChange={this.handlePasswordChange} />
              </FormGroup>

           
              <Form.Group>
              <Form.File
                        id="custom-file"
                        label = {this.state.fileLabel}
                        custom
                        
                        onChange={this.updateProfilePic}
                    />
              </Form.Group>

              <Button variant="primary" type="submit">
                Sign Up
              </Button>
            </Form>

          </TabPanel>
        </Tabs>
      


      </Container>







    )
  }
}