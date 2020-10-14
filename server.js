var express = require('express');
var cors = require('cors')
var http = require('http');
const socket = require('socket.io')

var routes = require('./routes')
var socketio = require('./socketio')

var PORT = process.env.PORT || 3000;

class Server {

  constructor() {

    this.app = express();
    
    this.server = http.createServer(this.app);
    this.socketio = socket(this.server)
    this.app.use(cors({}))

    if (process.env.NODE_ENV === 'production') {
      this.app.use(express.static('client/build'));
  }
  this.app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});
  }

  initServer() {
    this.includeRoutes();
    this.server.listen(PORT, () => console.log('Server has started on port ' + PORT));
  }

  includeRoutes() {

    new routes(this.app).initRoutes()
    new socketio(this.socketio).socketEvents()

  }

}

const app = new Server();
app.initServer();









