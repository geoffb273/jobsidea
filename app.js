const express = require('express');
const app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
require('dotenv').config();
var routes = require('./routes/routes.js');
var db = require('./models/database.js');
var nodeMailer = require('nodemailer')
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MemoryStore = require('memorystore')(session)
var multer = require('multer');

var upload = multer({ dest: 'uploads/' })
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

app.all('*', function(req, res, next) {
  if (req.path !== '/handle-login' && req.path !== '/signup-user' && req.path !== '/login' && req.path !== '/signup-restaurant'
      && req.path !== '/handle-signup-user' && req.path !== '/handle-signup-restaurant'
		 && !req.session.username) {
    res.redirect('/login');
  } else {
    next();
  }
});



//Users
app.get('/login', routes.login);
app.post('/handle-login', routes.handle_login);
app.get('/logout', routes.logout)
app.get('/search-users/:search', routes.search_users);
app.get('/signup-user', routes.signup_user);
app.post('/handle-signup-user', routes.handle_signup_user);
app.get('/signup-restaurant', routes.signup_restaurant);
app.post('/handle-signup-restaurant', routes.handle_signup_restaurant);

//Profile
app.get('/', routes.home);
app.get('/profile', routes.profile);
app.get('/profile/:username', routes.profile);

//Chats
app.get('/chats', routes.chats_page);
app.get('/my-chats', routes.chats);
app.post('/chats/:username', routes.handle_chats)
app.get('/chat/:chatId', routes.chat);
app.post('/handle-message', routes.handle_message);
app.get('/messages', routes.messages)

//Notifications
app.get('/notifications', routes.notifications_page);
app.get('/my-notifications', routes.notifications)

//Reviews
app.get('/reviews', routes.reviews);
app.post('/review', routes.add_review);

//Experience
app.get('/experience/:username', routes.experience);
app.get('/edit-experience/:username', routes.experience_page);
app.post('/experience', routes.put_experience)
app.delete('/experience/:restaurant/:role', routes.delete_experience)

//Stars
app.get('/stars', routes.stars);

//Posts
app.get('/posts', routes.posts)
app.get('/post/:id', routes.post)
app.get('/post-page/:id', routes.post_page)
app.post('/posts', routes.add_post)
app.delete('/posts/:id', routes.delete_post)
app.get('/posts/:username', routes.restaurant_posts)

//Pics
app.get('/user-pic/:username', routes.user_pic)
app.get('/pics/:id', routes.pic)
app.post('/pics/:username', upload.single('photo'), routes.handle_pic)
app.delete('/pics/:username/:id', routes.delete_pic)

//Comments
app.get('/comments/:postId', routes.comments)
app.post('/comments', routes.add_comment)

//Settings
app.get('/settings', routes.settings)
app.post('/settings', routes.change_settings)

//Saved
app.get('/saved', routes.saved)
app.post('/saved/:id', routes.handle_save)

//Apply
app.post('/apply/:username/:title', routes.apply)
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
		socket.to(msg.chatId).emit('chat message', {message: msg.message, username: msg.username});
		var set = io.sockets.adapter.rooms.get(msg.chatId)
		
		if (set && set.size == 1) {
			var missingUser = msg.chatId.split("@").filter(function(name) {
				return name != msg.username
			})[0]
			var promises = []
			
			socket.to(missingUser).emit('notification', {})
			socket.to(missingUser).emit('update chats', {chatId: msg.chatId})
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
	socket.on('self room', (msg) => {
		 Array.from(socket.rooms).filter(room => room !== socket.id).forEach(id => { 
			socket.leave(id);
		});
		socket.join(msg.username);
	});
	
	socket.on('logged out', () => {
		 Array.from(socket.rooms).filter(room => room !== socket.id).forEach(id => { 
			socket.leave(id);
			socket.removeAllListeners('self room');
		});
	});
});


/* Run the server */
http.listen(process.env.PORT || 8000, function(){  
	routes.connect();
    console.log('listening on :8000');
});