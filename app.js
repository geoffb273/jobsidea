const express = require('express');
const app = express();
const cors = require('cors');
let http = require('http').Server(app);
let io = require('socket.io')(http, {
	cors: {
        origin: "http://localhost:19006"
    }
});
require('dotenv').config();
let routes = require('./routes/routes.js');
let db = require('./models/database.js');
let session = require('express-session');
let MemoryStore = require('memorystore')(session)
let multer = require('multer');

let upload = multer({ dest: 'uploads/' })
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + "/views/"));
app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000
    }),
    resave: false,
    secret: 'GRBRANDT'
}))


app.use(cors({
    origin: 'http://localhost:19006',
	allowedHeaders: ["content-type"]
}));

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    next();
});

/*app.all('*', function(req, res, next) {
  if (req.path !== '/handle-login' && req.path !== '/signup-user' && req.path !== '/login' && req.path !== '/signup-restaurant'
      && req.path !== '/handle-signup-user' && req.path !== '/handle-signup-restaurant'
		 && !req.session.username) {
    res.redirect('/login');
  } else {
    next();
  }
});*/



//Users
//app.get('/login', routes.login);
app.post('/handle-login', routes.handle_login);
app.get('/logout', routes.logout) //Change for REACT purposes - prob based on req.session
app.get('/search-users/:search', routes.search_users);
app.get('/users', routes.get_users)
//app.get('/signup-user', routes.signup_user);
app.post('/handle-signup-user', routes.handle_signup_user); //Change for REACT purposes - return user info not render
//app.get('/signup-restaurant', routes.signup_restaurant);
app.post('/handle-signup-restaurant', routes.handle_signup_restaurant); //Change for REACT purposes - return user info not render

//Profile
//app.get('/', routes.home);
app.get('/profile', routes.profile); //Change for REACT purposes - prob based on req.session && return user info not render
app.get('/profile/:username', routes.profile); //Change for REACT purposes - return user info not render

//Chats
//app.get('/chats', routes.chats_page);
app.get('/chats/:username', routes.chats); //Change for REACT purposes - prob based on req.session
app.post('/chats/:username', routes.handle_chats) //Change for REACT purposes - prob based on req.session
app.get('/chat/:chatId', routes.chat);
app.post('/handle-message', routes.handle_message); //Change for REACT purposes - prob based on req.session
app.get('/messages/:chatId', routes.messages)

//Notifications
//app.get('/notifications', routes.notifications_page); 
app.get('/my-notifications', routes.notifications) //Change for REACT purposes - prob based on req.session

//Reviews
app.get('/reviews/:username', routes.reviews);
app.post('/review', routes.add_review); //Change for REACT purposes - prob based on req.session

//Experience
/*app.get('/experience/:username', routes.experience);
app.get('/edit-experience/:username', routes.experience_page); //Change for REACT purposes - prob based on req.session
app.post('/experience', routes.put_experience) //Change for REACT purposes - prob based on req.session
app.delete('/experience/:restaurant/:role', routes.delete_experience) //Change for REACT purposes - prob based on req.session
*/

//Stars
app.get('/stars', routes.stars);

//Posts
/*app.get('/posts', routes.posts)
app.get('/post/:id', routes.post)
app.get('/post-page/:id', routes.post_page)
app.get('/create-post', routes.create_post_page)
app.post('/posts', routes.add_post)
app.delete('/posts/:id', routes.delete_post)
app.get('/posts/:username', routes.restaurant_posts)
*/
//Pics
app.get('/user-pic/:username', routes.user_pic)
app.get('/pics/:id', routes.pic)
app.post('/pics/:username', upload.single('photo'), routes.handle_pic)
app.delete('/pics/:username/:id', routes.delete_pic)

//Comments
/*app.get('/comments/:postId', routes.comments)
app.post('/comments', routes.add_comment)
*/
//Settings
app.get('/settings', routes.settings) //Change for REACT purposes - prob based on req.session
app.post('/settings', routes.change_settings) //Change for REACT purposes - prob based on req.session

//Saved
/*app.get('/saved', routes.saved)
app.post('/saved/:id', routes.handle_save)*/

//Apply
/*app.post('/apply/:username/:title/:id', routes.apply)
app.get('/apply/:id', routes.get_apply)*/

//Resume
app.get('/resume/:username', routes.resume)
app.post('/resume', upload.single('resume'), routes.upload_resume) //Change for REACT purposes - prob based on req.session
app.delete('/resume', routes.delete_resume) //Change for REACT purposes - prob based on req.session
/*var sendMail = async function(send, rec, type) {
	var sender = await db.getUser(send)
	var reciever = await db.getUser(rec)
	let transporter = nodeMailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: false,
		auth: {
			user: 'geoffbrandtappdevelopment@gmail.com',
			pass: 'Legend273!'
		}
	});
	var html = "Hello"
	var url = "localhost:8000"
	if (type == "New Message") {
		html = '<p>You have recieved a new message from <b><i>@' + send + '</i></b>. Go to <a href='
			+ url + '>Staffer</a> to see what it is.</p>'
	}
	console.log(sender.email)
	console.log(reciever.email)
	let mailOptions = {
		from: '"'+ send + '"' + sender.email + ' ',
		to: reciever.email,
		subject: "Staffer: " + type, // Subject line
		text: html
		//html: html// html body
	};
	
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log("Error")
			console.log(error);
			return
		}
		console.log("Message sent");
		console.log("info")
	});
}*/

io.on('connection', (socket) => {
	
	socket.on('chat message', (msg) => {
		socket.to(msg.chatId).emit('chat message', msg);
		let set = io.sockets.adapter.rooms.get(msg.chatId)
		if (set && set.size == 1) {
			const missingUser = msg.chatId.split("@").filter(function(name) {
				return name != msg.username
			})[0]
			let promises = []
			
			promises.push(db.putNotification(missingUser, msg.username, msg.username + " sent you a message", "New Message"))
			//sendMail(msg.username, missingUser, "New Message")
			promises.push(db.changeUnread(msg.chatId, missingUser))
			Promise.all(promises);
		}
	});
	
	socket.on('joined', (msg) => { 
		 Array.from(socket.rooms).filter(room => room !== socket.id && room !== msg.username).forEach(id => { 
			socket.leave(id);
			socket.removeAllListeners('chat message');
		});
		socket.join(msg.chatId);
		socket.to(msg.chatId).emit('joined', {username: msg.username})
		if (msg.unread == msg.username) {
			db.changeUnread(msg.chatId, "read");
		}
	});
	
	socket.on('user left', (msg) => {
		socket.to(msg.chatId).emit('user left', {username: msg.username})
		socket.leave(msg.chatId);
	});
	
});


/* Run the server */
http.listen(process.env.PORT || 8000, function(){  
	routes.connect();
    console.log('listening on :8000');
});