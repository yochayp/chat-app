const database = require('./database')



class SocketIO {

    constructor(socket) {
        this.socket = socket
        this.users = []
    }

    socketEvents() {

        this.socket.on('connect', (socket) => {

            socket.on('userInfo', (data) => {
                this.users.push({ socketid: socket.id, name: data.username })
            })

            socket.on('getChatList', (username) => {

                database.getAllUsers(username, (chatList) => {
                    socket.emit('chatListResponse', chatList);
                    socket.broadcast.emit('update users list', chatList)
                })
            })

            socket.on('sendingMessage', (data) => {
                const sendTo = this.users.find(({ name }) => name === data.toUser);
                if (sendTo) {
                    console.log('ok')

                    socket.to(sendTo.socketid).emit('message', data)
                    database.sendingMessage(data);
                }
                else {
                    database.sendingMessage(data);
                }
            })

            socket.on('getMessages', (data, callback) => {
                database.getMessages(data, (messages) => {
                    callback(messages)
                })
            })

            socket.on('getUsersInfo', (callback) => {
                database.getUsersInfo((data) => {
                    socket.emit('infoResponse', data);
                    callback(data)
                })
            })

            socket.on('getLastMessages', (data, callback) => {
                database.getLastMessages(data, (messages) => {
                    callback(messages)
                })
            })

            socket.on('disconnect', () => {
console.log('disconnect')
                const userconnected = this.users.find(({ socketid }) => socketid === socket.id)

                this.users = this.users.filter((user) => {

                    return user.socketid !== socket.id
                })
                if (userconnected) {
                    database.changeToOffline(userconnected, () =>
                        database.getAllUsers(userconnected, (chatList) => {
                            socket.broadcast.emit('update users list', chatList)
                        }))
                }

            })

        })
    }
}

module.exports = SocketIO