import React, { Component } from 'react';

import './Chat.css';
import ChatList from './ChatList';


import { Button, Container, Row, Col, Navbar, Form, Media, Image } from 'react-bootstrap';

import Conversation from './Conversation';
import serverRequests from '../utils/serverRequests';
import 'bootstrap/dist/css/bootstrap.min.css';
import bsCustomFileInput from 'bs-custom-file-input'
import defaultAvatar from '../lib/default-avatar.jpg'

export default class Chat extends Component {

    constructor(props) {
        super(props);
        this.state = {
            st: 0,
            username: sessionStorage.getItem('username'),
            selectedUser: '',
            messages: [],
            lastMessages: [],
            conversarions: [],
            profilePic: defaultAvatar,
            usersInfo: []
        };

        this.logout = this.logout.bind(this);

        this.updateLastMessages = this.updateLastMessages.bind(this)

    }


    componentDidMount() {
        console.log('did mount chat')
        bsCustomFileInput.init()

        serverRequests.getLastMessages(this.state.username, (lastMessages) => {
            this.setState(
                { lastMessages: lastMessages }

            )
        });


        serverRequests.getUsersInfo(usersInfo => {
            this.setState(
                { usersInfo: usersInfo }
            )
            const user = usersInfo.filter(user => {
                return user.name === this.state.username
            })
            if(user[0].avatar){
            const profilepic = user[0].avatar.image;
            var image = new Buffer(profilepic, 'base64')
            var base64Flag = 'data:image/jpeg;base64,';
            var imageStr = this.arrayBufferToBase64(image);
            this.setState(
                { profilePic: base64Flag + imageStr }
            )}
        }
        );

    }

    arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = [].slice.call(new Uint8Array(buffer));
        bytes.forEach((b) => binary += String.fromCharCode(b));
        return window.btoa(binary);
    };

    updatectt() {

        this.setState((prevstate) => {
            return { st: prevstate.st + 1 }
        })
    }


    logout() {
        serverRequests.logout();
        this.props.history.push('/');
        sessionStorage.removeItem('username', this.state.username);
    }

    handleClick = (username) => {
        if (username !== this.state.selectedUser) {
            this.setState(
                { selectedUser: username }
            )
        }
        this.setState(
            state => {
                const lastMessages = state.lastMessages.map(item => {
                    if (username === item.message.fromUser) {
                        item.numOfUnread = 0;
                        return item
                    }
                    else return item
                });
                return lastMessages
            }
        )
    }

    updateLastMessages(newMessage) {

        this.setState(
            state => {
                const lastMessages = state.lastMessages.map(item => {

                    if (((newMessage.fromUser === item.message.fromUser || newMessage.fromUser === item.message.toUser) && this.state.username !== newMessage.fromUser)
                        || ((newMessage.toUser === item.message.fromUser || newMessage.toUser === item.message.toUser) && this.state.username === newMessage.fromUser)) {
                        if (this.state.selectedUser !== newMessage.fromUser && this.state.username !== newMessage.fromUser) item.numOfUnread++;
                        item.message = newMessage;
                        return item
                    }
                    else return item
                });
                return lastMessages
            }
        )

    }

    updateProfilePic = (e) => {
        this.setState(
            { profilePic: URL.createObjectURL(e.target.files[0]) }
        )

    }


    render() {
        let cnt = 0;

        return (


            <Container className='chat' fluid='true'>
                <div className="header">
                    <Row>
                        <Col md={3}>
                            <Media className='user-info'>
                                <Image
                                    src={this.state.profilePic}
                                    className="profile-image " />
                                <Media.Body className='username'> <h1 className='headline'>{this.state.username}</h1></Media.Body>
                            </Media>
                        </Col>
                        <div className='chat-app'>Chat-App</div>
                        <Col md='auto' className='ml-auto'>
                            <i className="fa fa-sign-out logout-button" onClick={() => this.logout()}></i>
                        </Col></Row>
                </div>

                <Row className="justify-content-md-center">
                    <Col className='col-chat-list' md={3}>
                        <ChatList
                            username={this.state.username}
                            profilePic={this.state.profilePic}
                            lastMessages={this.state.lastMessages}
                            onClick={(username) => this.handleClick(username)}
                            usersInfo={this.state.usersInfo} />
                    </Col>
                    <Col className='col-conversation' md={5} >
                        <Conversation
                            updateLastMessages={this.updateLastMessages}
                            profilePic={this.state.profilePic}
                            username={this.state.username}
                            selectedUser={this.state.selectedUser} />
                    </Col>
                </Row>





            </Container>
        )
    }
};
