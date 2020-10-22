import io from 'socket.io-client';

const events = require('events');

class ServerRequests {

    socket = null;
    eventEmitter = new events.EventEmitter();


    establishConnection(username) {
        try {
            this.socket = io('http://localhost:3000/', {
                _query: { username: username }
            })
        } catch (error) {
            alert('Error trying to connect to server'
            )
        }
        this.socket.on('connect', () => {
            this.socket.emit('userInfo', { username: username })
        })

    }

    getChatList(username) {

        this.socket.emit('getChatList', username);
        this.socket.on('chatListResponse', (chatList) => {
            this.eventEmitter.emit('chatListResponse', chatList)
        });
    }

    sendMessage(data) {
        this.socket.emit('sendingMessage', data)
    }

    getMessages(data, callback) {
        this.socket.emit('getMessages', data ,(messages) => {
callback(messages)

        })
    }

    getLastMessages(username,callback) {
               this.socket.emit('getLastMessages', username, (messages) => {
            callback(messages)
        })
    }
    

    getUsersInfo(callback){
        this.socket.emit('getUsersInfo',(usersInfo) => {
            callback(usersInfo)
    })}
    logout() {
        this.socket.close()
    }
}

export default new ServerRequests();
