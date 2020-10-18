import React, { Component } from 'react'

import './Conversation.css';
import serverRequests from '../utils/serverRequests';
import { Col, ListGroup, Card, Form, Button, InputGroup, FormControl, Media, Modal } from 'react-bootstrap'

import { Ring } from 'react-spinners-css';

export default class Conversation extends Component {

    constructor(props) {
        super(props);
        this.state = {
            message: '',
            messages: [],
            selectedUser: '',
            showModalMessage: false,
            modalMessage: '',
            showLoadingSpiner:''
        }
    }

    handleClose = () => {
        this.setState(
          { showModalMessage: false }
        )
      }
    componentDidMount() {
        serverRequests.socket.on('message', (message) => {
            this.props.updateLastMessages(message);
            if (message.fromUser === this.state.selectedUser) {
                this.setState(
                    { messages: [...this.state.messages, message] }
                )
            }
        })
    }


    static getDerivedStateFromProps(props, state) {
        if (state.selectedUser === null || state.selectedUser !== props.selectedUser) {
            return {
                selectedUser: props.selectedUser,
                showLoadingSpiner: true
            };


        }
        return null;
    }
    componentDidUpdate(prevProps) {
        console.log('componentdidupdate - conversation')
        if (this.props.selectedUser !== prevProps.selectedUser) {
            serverRequests.getMessages(this.props, (messages) => {
                this.setState(
                    { 
                        messages: messages,
                        showLoadingSpiner: false 
                    }
                )
            })
        }
    }

    handeMessageTyping = (e) => {

        this.setState(
            { message: e.target.value }
        )

    }
    sendMessage = (e) => {
        e.preventDefault();
        if (this.state.message) {
            this.setState(
                { messages: [...this.state.messages, { fromUser: this.props.username, toUser: this.state.selectedUser, content: this.state.message, date: new Date().toLocaleString()}] }
            )
            serverRequests.sendMessage(
                {
                    fromUser: this.props.username,
                    toUser: this.state.selectedUser,
                    content: this.state.message,
                    date: new Date().toLocaleString(),
                    unRead: true
                }
            )
            this.props.updateLastMessages(
                {
                    fromUser: this.props.username,
                    toUser: this.state.selectedUser,
                    content: this.state.message,
                    date: new Date().toLocaleString()
                }
                );
            document.getElementById("sending-message").reset();
            console.log('sending message ' + this.state.message)
            this.setState(
                {message:''}
            )
        }
        else {
            this.setState(
                {
                    showModalMessage: true,
                    modalMessage: 'cant send empty message'
                }
            )
        }

    }

    render() {
        console.log("conversation rendered")
        const showLoadingSpiner = this.state.showLoadingSpiner;
        return (


            <Card >
                <Modal show={this.state.showModalMessage} onHide={this.handleClose} animation={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>error</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{this.state.modalMessage}</Modal.Body>
                </Modal>
                <Card.Header>
                    <Media>
                        <Media.Body> <h3>Chat With - {this.state.selectedUser} </h3></Media.Body>
                    </Media>
                </Card.Header>
                <Card.Body className='overflow-auto'>
                    {showLoadingSpiner
                    ?<Ring className='spiner'/>
                    :<ListGroup >
                        {this.state.messages.map((message, index) =>
                            <Media key={index} >
                                <Col md="auto" className={message.fromUser === this.props.username ? ' ml-auto rounded-lg  right ' : '  rounded-lg  left '}>{message.content}</Col>
                            </Media>
                        )}
                    </ListGroup>
                    }

                </Card.Body>
                <Card.Footer>
                    <Form id='sending-message' onSubmit={this.sendMessage}>
                        <InputGroup >
                            <FormControl placeholder="type a message..." onChange={this.handeMessageTyping} />
                            <InputGroup.Append>
                                <Button type="submit">
                                    <i className="fa fa-paper-plane" aria-hidden="true"></i>
                                </Button>
                            </InputGroup.Append>
                        </InputGroup>
                    </Form>

                </Card.Footer>

            </Card>


        )
    }
}