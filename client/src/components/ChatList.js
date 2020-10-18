import React, { Component } from 'react'
import serverRequests from '../utils/serverRequests'
import { ListGroup, Card, Media, Image, Row, Col } from 'react-bootstrap'

import './ChatList.css'

import defaultAvatar from '../lib/default-avatar.jpg'

export default class ChatList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            users: []
        }
    }

    componentDidMount() {
        serverRequests.establishConnection(sessionStorage.getItem('username'));
        serverRequests.getChatList(sessionStorage.getItem('username'));
        serverRequests.eventEmitter.on('chatListResponse', (chatList) => {


            this.setState({
                users: chatList.filter((user) => {

                    return user.name !== this.props.username
                })
            })


        })

        serverRequests.socket.on('update users list', (chatList) => {
            this.setState({
                users: chatList.filter((user) => {

                    return user.name !== this.props.username
                })
            })
        })
    }
    handleClick(username) {
        this.props.onClick(username)
    }

    getLastMesaages(username) {
        let lastMessage = this.props.lastMessages.find(message => message.message.fromUser === username || message.message.toUser === username)
        if (lastMessage)
            return (lastMessage.message.content)
        else
            return ''
    }
    getLastDate(username) {
        let lastMessage = this.props.lastMessages.find(message => message.message.fromUser === username || message.message.toUser === username)
        if (lastMessage)
            return (lastMessage.message.date)
        else
            return ''
    }

    getUnreadMessages(username) {
        let unreadMessages = this.props.lastMessages.find(message => message.message.fromUser === username || message.message.toUser === username)
        if (unreadMessages) {
            if (unreadMessages.numOfUnread)
                return (unreadMessages.numOfUnread)
            else
                return ''
        }
    }
    printsomething() {
        console.log('printing something')
    }

    arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = [].slice.call(new Uint8Array(buffer));
        bytes.forEach((b) => binary += String.fromCharCode(b));
        return window.btoa(binary);
    };

    getProfilePic(username) {
      
        let user = this.props.usersInfo.find(user => user.name === username)
        

        if(user){
        if(user.avatar){
        var image = new Buffer(user.avatar.image, 'base64')
        var base64Flag = 'data:image/jpeg;base64,';
        var imageStr = this.arrayBufferToBase64(image);

        return  base64Flag+imageStr}
        else return defaultAvatar}
        else return defaultAvatar 
    }

    render() {
        console.log('chatlist rendered')
        return (
            <Card>
                <Card.Header><h3>Users list</h3></Card.Header>

                <Card.Body className='overflow-auto'>
                    <ListGroup variant='flush'>
                        {this.state.users.map((user, index) =>
                            <Media as='li' className='list-group-item-chat-list'
                                key={index} onClick={() => this.handleClick(user.name)}>
                                <Image
                                    className={user.isonline === 'yes' ? 'online' : 'offline'}
                                    src={this.getProfilePic(user.name)} />

                                <Media.Body className='username'>
                                    <Row>
                                        <Col>
                                            <h3 className='name'> {user.name}  </h3>
                                        </Col>
                                        <Col md='auto' className='ml-auto last-message-date'>
                                            <p className='date'>{this.getLastDate(user.name)}</p>
                                        </Col>

                                    </Row>
                                    <Row>
                                        <Col>
                                            <p className='lastMessage'>{this.getLastMesaages(user.name)}</p>
                                        </Col>
                                        <Col md='auto' className='ml-auto last-message-date'>
                                            <p>{this.getUnreadMessages(user.name)}</p>
                                        </Col>

                                    </Row>
                                </Media.Body>
                            </Media>)

                        }
                    </ListGroup>
                </Card.Body>
            </Card>

        )


    }
}