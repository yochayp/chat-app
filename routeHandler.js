const database = require('./database')

class RouteHandler{
    
    handleSignUp(req,res){

        database.checkUserNameAvailability(req.body.username, (available) => {
            if (available) {
              database.insert(req)
      
              res.json({ 
                registered: true,
                message: 'user registered'
              }) 
      
            }
                else {
              res.json({
                registered: false,
                message: 'unavailable username'
              })
            
            }
          })
    }

    handleLogIn(req,res){
        database.checkUserNameAvailability(req.headers.username, (available) => {
          if (available) {
            res.json({
              login: false,
              message: 'invalid username'
            })
          }
          else
            database.logIn(req.headers, (validPassword) => {
              if (validPassword)
                res.json({
                  login: false,
                  message: 'invalid password'
                })
              else {
                database.changeToOnline(req.headers.username)
                res.json({ login: true })
              }
            })
        })
    }
}

module.exports = new RouteHandler();