import React, { Component } from 'react'

import './Conversation.css';
import serverRequests from '../utils/serverRequests';
import { Col, ListGroup, Card, Form, Button, InputGroup, FormControl, Media, Modal } from 'react-bootstrap'

import { Ring } from 'react-spinners-css';

import Picker from 'emoji-picker-react';

export default class Conversation extends Component {

    constructor(props) {
        super(props);
        this.state = {
            message: '',
            messages: [],
            selectedUser: '',
            showModalMessage: false,
            modalMessage: '',
            showLoadingSpiner: '',
            showEmojis: false
        }
    }

    showEmojis = e => {
        this.setState(
            { showEmojis: true }, () => document.addEventListener("click", this.closeMenu)
        )
    }
    onEmojiClick = (event, emojiObject) => {
        this.setState(
            { message: emojiObject }
        )

    }

    addEmoji = (event,emojiObject) => {
        let emoji = emojiObject;
        this.setState({
          message: this.state.message + emojiObject.emoji
        },()=>        console.log(this.state.message)
        );
      };

    closeMenu = e => {
        if (this.emojiPicker !== null && !this.emojiPicker.contains(e.target)) {
            this.setState(
                {
                    showEmojis: false
                },
                () => document.removeEventListener("click", this.closeMenu)
            );
        }
    };

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
                { messages: [...this.state.messages, { fromUser: this.props.username, toUser: this.state.selectedUser, content: this.state.message, date: new Date().toLocaleString() }] }
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
            this.setState(
                { message: '' }
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
                <Card.Body className='conversation-header'>
                    <h3><i className='far fa-comment'></i> </h3>
                </Card.Body>
                <Card.Body className='overflow-auto conversation-body'>
                    {showLoadingSpiner
                        ? <Ring className='spiner' />
                        : <ListGroup >
                            {this.state.messages.map((message, index) =>
                                <Media className='message' key={index} >
                                    <Col md="auto" className={message.fromUser === this.props.username ? ' ml-auto rounded-lg  right ' : '  rounded-lg  left '}>{message.content}</Col>
                                </Media>
                            )}
                        </ListGroup>
                    }

                </Card.Body>
                <Card.Body classNmae='type-line'>
                    <Form id='sending-message' onSubmit={this.sendMessage}>
                        <InputGroup >
                            <InputGroup.Prepend>
                                <InputGroup.Text id="basic-addon1">   {this.state.showEmojis ? (
                                    <span style={styles.emojiPicker} ref={el => (this.emojiPicker = el)}>
                                        <Picker
                                            onEmojiClick={this.addEmoji}
                                            emojiTooltip={true}
                                            title="weChat"
                                        />
                                    </span>
                                ) : (
                                        <p style={styles.getEmojiButton} onClick={this.showEmojis}>
                                            {String.fromCodePoint(0x1f60a)}
                                        </p>
                                    )}</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl value={this.state.message} placeholder="type a message..." onChange={this.handeMessageTyping} />
                            <InputGroup.Append>
                            <button className='send-button'>
                            <i className="fa fa-paper-plane" aria-hidden="true" type="submit"></i> 
                             </button>
                            </InputGroup.Append>

                        </InputGroup>
                    </Form>

                </Card.Body>

            </Card>


        )
    }
}

const styles = {
    container: {
        padding: 20,
        borderTop: "1px #4C758F solid",
        marginBottom: 20
    },
    form: {
        display: "flex"
    },
    input: {
        color: "inherit",
        background: "none",
        outline: "none",
        border: "none",
        flex: 1,
        fontSize: 16
    },
    getEmojiButton: {
        cssFloat: "right",
        border: "none",
        margin: 0,
        cursor: "pointer"
    },
    emojiPicker: {
        position: "absolute",
        bottom: 40,
        cssFloat: "right",

    }

};