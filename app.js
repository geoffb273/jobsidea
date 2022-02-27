const express = require('express');
const app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var routes = require('./routes/routes.js');
var db = require('./models/database.js');

var session = require('express-session');
var cookieParser = require('cookie-parser');
var MemoryStore = require('memorystore')(session)

app.use(express.urlencoded());
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

app.get('/', routes.home)

app.get('/login', routes.login);
app.post('/handle-login', routes.handle_login);


app.get('/signup-user', routes.signup_user);
app.post('/handle-signup-user', routes.handle_signup_user);

app.get('/signup-restaurant', routes.signup_restaurant);
app.post('/handle-signup-restaurant', routes.handle_signup_restaurant);

app.get('/profile', routes.profile);

app.get('/chats', routes.chats_page);
app.get('/my-chats', routes.chats);

app.get('/chat', routes.chat);
app.post('/handle-message', routes.handle_message);

app.get('/notifications', routes.notifications_page);
app.get('/my-notifications', routes.notifications)


app.get('/reviews', routes.reviews);
app.get('/experience', routes.experience);
app.get('/stars', routes.stars);

io.on('connection', (socket) => {
	
	socket.on('chat message', (msg) => {
		socket.to(msg.chatId).emit('chat message', {message: msg.message, username: msg.username});
		var set = io.sockets.adapter.rooms.get(msg.chatId)
		if (set.size == 1) {
			var missingUser = msg.chatId.split("@").filter(function(name) {
				return name != msg.username
			})[0]
			var promises = []
			promises.push(db.putNotification(missingUser, msg.username + " has sent you a message", "New Message"))
			promises.push(db.changeUnread(missingUser, msg.chatId, true));
			Promise.all(promises);
		}
	});
	
	socket.on('joined', (msg) => { 
		 Array.from(socket.rooms).filter(room => room !== socket.id).forEach(id => { 
			socket.leave(id);
			socket.removeAllListeners('chat message');
		});
		socket.join(msg.chatId);
	});
	
	socket.on('user left', (msg) => {
		socket.leave(msg.chatId);
	});
});


/* Run the server */
http.listen(8000, function(){  
    console.log('listening on :8000');
});