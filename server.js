// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require('body-parser');

//for login/logout (authentication)
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


var PORT = 3001;
var app = express();

// set the app up with bodyparser
app.use(bodyParser());

// Database configuration
var databaseUrl = 'mongodb://localhost:27017/posts_db';
var collections = ["posts"];

// Hook mongojs config to db variable
var db = mongojs(databaseUrl, collections);

// Log any mongojs errors to console
db.on("error", function(error) {
    console.log("Database Error:", error);
});

//this loads the .env file in
//we need this for secret information that we don't want on our github
require('dotenv').config()

/*
  if we don't do this here then we'll get this error in apps that use this api

  Fetch API cannot load No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin is therefore not allowed access. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.

  read up on CORs here: https://www.maxcdn.com/one/visual-glossary/cors/
*/
//allow the api to be accessed by other apps
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
    next();
});

function verifyToken(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decod) => {
            if (err) {
                res.status(403).json({
                    message: "Wrong Token"
                });
            } else {
                req.decoded = decod;
                next();
            }
        });
    } else {
        res.status(403).json({
            message: "No Token"
        });
    }
}

app.get('/', function(req, res) {
    res.send('routes available: login : post -> /login, signup : post -> /signup, get all the posts: get -> /posts, get one post: get -> /posts/:id, update a post: post -> /posts/update/:id, deleting a post: post -> /posts/:id, creating a post: post -> /posts');
});

//curl -d "username=fred&password=unodostresgreenbaypackers" -X POST http://localhost:3001/login
/*
	this will return

	{"message":"successfuly authenticated","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmM1OTZjOGUxOTZmYmIwZTdkNWI0MGYiLCJ1c2VybmFtZSI6ImZyZWQiLCJpYXQiOjE1Mzk2NzU4OTIsImV4cCI6MTUzOTY5MDI5Mn0.xalv4I9rSmKf9LV6QaeJboV4NvY0F7wIltDMc-o_amQ"}
*/
app.post('/login', function(req, res) {
    console.log(process.env.JWT_SECRET);
    db.users.findOne({
        username: req.body.username
    }, function(error, result) {
        if (!result) return res.status(404).json({ error: 'user not found' });

        if (!bcrypt.compareSync(req.body.password, result.password)) return res.status(401).json({ error: 'incorrect password ' });

        var payload = {
            _id: result._id,
            username: result.username,
        };

        var token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '4h' });

        return res.json({
            message: 'successfuly authenticated',
            token: token
        });
    });
})

//curl -d "username=fred&password=unodostresgreenbaypackers" -X POST http://localhost:3001/signup
app.post('/signup', function(req, res) {
    db.users.findOne({
        username: req.body.username
    }, function(error, result) {
        if (result) return res.status(406).json({ error: 'user already exists' });

        if (!req.body.password) return res.status(401).json({ error: 'you need a password' });

        if (req.body.password.length <= 5) return res.status(401).json({ error: 'password length must be greater than 5' });

        console.log('got to line 92')

        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                db.users.insert({
                    username: req.body.username,
                    password: hash
                }, function(error, user) {

                	console.log('got to line 101');
                    
                    // Log any errors
                    if (error) {
                        res.send(error);
                    } else {
                        res.json({
                            message: 'successfully signed up'
                        });
                    }
                });
            });
        });
    });
})

app.get('/posts', function(req, res) {
    db.posts.find(function(error, data) {
        res.json(data);
    })

})


app.get('/posts/:id', function(req, res) {

    db.posts.findOne({
        "_id": mongojs.ObjectID(req.params.id)
    }, function(error, result) {
        res.json(result);
    });

})


app.post('/posts/update/:id', verifyToken, function(req, res) {

    db.posts.findAndModify({
        query: {
            "_id": mongojs.ObjectId(req.params.id)
        },
        update: {
            $set: {
                "name": req.body.name,
                "type": req.body.type
            }
        },
        new: true
    }, function(err, editedPost) {
        res.json(editedPost);
    });
});

app.post('/posts/:id', verifyToken, function(req, res) {

    db.posts.remove({
        "_id": mongojs.ObjectID(req.params.id)
    }, function(error, removed) {
        if (error) {
            res.send(error);
        } else {
            res.json(req.params.id);
        }
    });
});

app.post('/posts', verifyToken, function(req, res) {

    db.posts.insert({
    	"name": req.body.name,
    	"type": req.body.type
    }, function(error, savedPost) {
        // Log any errors
        if (error) {
            res.send(error);
        } else {
            res.json(savedPost);
        }
    });
});

app.listen(PORT, function() {
    console.log('🌎 ==> Now listening on PORT %s! Visit http://localhost:%s in your browser!', PORT, PORT);
});