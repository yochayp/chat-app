const Mongo = require('mongodb');
const url = "mongodb+srv://yochaypahima:yochaypahima@cluster0-pkfel.mongodb.net/<dbname>?retryWrites=true&w=majority";
const DATABASE = "mydb"
const fs = require('fs');

class Database {

    constructor() {

        this.MongoClient = Mongo.MongoClient;
        this.db;
        this.MongoClient.connect(url, { useUnifiedTopology: true }, (err, database) => {
            if (err) throw err;
            this.db = database.db(DATABASE);
        })
        
    }
    onConnect() {

        this.MongoClient.connect(url, { useUnifiedTopology: true }, (err, database) => {
            if (err) throw err;
            return database.db(DATABASE);
        })
    }

    checkUserNameAvailability(username, callback) {

        const myobj = { name: username };
        this.db.collection("users").findOne(myobj, (err, result) => {
            if (err) throw err;
            if (result) callback(false)
            else callback(true)
        })
    }

    insert(data) {

        if (data.file) {
            var img = fs.readFileSync(data.file.path);
            var encode_image = img.toString('base64');
            var finalImg = {
                contentType: data.file.mimetype,
                image: Buffer.from(encode_image, 'base64')
            };
        }


        const myobj = {
            name: data.body.username,
            password: data.body.password,
            avatar: finalImg,
            isonline: 'yes'
        };
        this.db.collection("users").insertOne(myobj, function (err, res) {
            if (err) throw err;
        })

    }

    logIn(data, callback) {
       
            const myobj = { name: data.username };
            this.db.collection("users").findOne(myobj, (err, result) => {
                if (err) throw err;
                const notmatch = data.password.localeCompare(result.password);
                callback(notmatch);
            })   
    }

    changeToOnline(username) {
            
            var myquery = { name: username };
            var newvalues = { $set: { isonline: 'yes' } };
            this.db.collection("users").updateOne(myquery, newvalues,  (err, res) => {
                if (err) throw err;
            });
    }
    
    changeToOffline(user,callback) {
      console.log(user.name)
            var myquery = { name: user.name };
            var newvalues = { $set: { isonline: 'no' } };
            this.db.collection("users").updateOne(myquery, newvalues, (err, res) => {
                if (err) throw err;
                callback()
            });
        
    }   
    
    getUsersInfo(callback){
        this.db.collection("users").find({}).toArray((err, result) => {
                if (err) throw err;
                callback(result);
            })
    }

    getAllUsers(username,callback) {
            this.db.collection("users").find(
                {}, { projection: { _id: 0, name: 1, isonline: 1, password: 1 } }).toArray((err, result) => {
                if (err) throw err;
                callback(result);
            })
    }

    sendingMessage(message) {
            const myobj = {
                fromUser: message.fromUser,
                toUser: message.toUser,
                content: message.content,
                date: message.date,
                unRead: message.unRead
            };
            this.db.collection("messages").insertOne(myobj, (err, res) => {
                if (err) throw err;
            });
    }

    getMessages(data,callback){

            let myquery = {
                '$and': [
                    {
                        'toUser': data.username
                    }, {
                        'fromUser': data.selectedUser
                    }
                ]
            };
            let newvalues = { $set: { unRead: false } };
            this.db.collection("messages").updateMany(myquery, newvalues, function (err, res) {
                if (err) throw err;
            });
            
            myquery = { 
                '$or' : [
					{ '$and': [
						{
							'toUser': data.username
						},{
							'fromUser': data.selectedUser
						}
					]
				},{
					'$and': [ 
						{
							'toUser': data.selectedUser
						}, {
							'fromUser': data.username
						}
					]
				},
			]
             };
            this.db.collection("messages").find(myquery).toArray( (err, result) => {
                if (err) throw err;
                callback(result);
            });
    }

    getLastMessages(username, callback) {
      
            this.db.collection('messages').aggregate(
                [

                    //match all those records which involve Wood.
                    { $match: { $or: [{ toUser: username }, { fromUser: username }] } },
                    // sort all the messages by descending order
                    { $sort: { date: -1 } },
                    {
                        $group: {
                            "_id": {
                                "last_message_between": {
                                    $cond: [
                                        {
                                            $gt: [
                                                { $substr: ["$toUser", 0, 1] },
                                                { $substr: ["$fromUser", 0, 1] }]
                                        },
                                        { $concat: ["$toUser", " and ", "$fromUser"] },
                                        { $concat: ["$fromUser", " and ", "$toUser"] }
                                    ]
                                }
                            }, "message": { $first: "$$ROOT" }

                            ,"numOfUnread": {$sum: { $cond: [ 
                                { 
                                    "$and": [
                                   { $eq: [ "$unRead", true ] },
                                   { $eq: [ "$toUser", username ] }
                                    ]
                                }
                                   , 1, 0 ] }}

                        }
                        
                    }
                
                   
                ]).toArray((err, result) => {
                    if (err) throw err;                    
                    callback(result);
                })
            
    }

}

module.exports = new Database();