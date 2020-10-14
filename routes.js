const routeHandler = require('./routeHandler');
const multer = require('multer');

class Routes{
    
    constructor(app){
        this.app = app;
    }

    initRoutes(){
        // SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
  })
  
  var upload = multer({ storage: storage })
        
        this.app.post('/handleSignup', upload.single('avatar'), routeHandler.handleSignUp)
       
        this.app.get('/handleLogin', routeHandler.handleLogIn)
       
        this.app.get("/", (req, res) => res.send('hello world'))

    }
}

module.exports = Routes;