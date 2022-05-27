var db = require('../models/database.js');


var getHome = function(req, res) {
	var username = req.session.username;
	res.render("main.ejs", {username: username});
};

var getLogin = function(req, res) {
	var username = req.session.username
	if (username) {
		req.session.destroy();
	}
	
	res.render("login.ejs");
};

var logout = function(req, res) {
	req.session.destroy();
	res.redirect("/login");
}

var handleLogin = function(req, res) {
	var username = req.body.username.toLowerCase();
	var password = req.body.password;
	db.getUser(username).then(snapshot => {
		if (snapshot) {
			var user = snapshot;
			var userPassword = user.password;
			if (password == userPassword) {
				req.session.username = user.username;
				req.session.type = user.type;
				res.redirect("/profile?username=" + user.username);
			} else {
				res.redirect("/login");
			}
		} else {
			res.redirect("/login")
		}
	}, _ => {
		res.redirect("/login");
	})
};

var searchUsers = function(req, res) {
	var search = req.params.search
	db.getUsers(search).then(snapshot => {
		var usernames = []
		for(var i = 0; i < snapshot.length; i++) {
			usernames.push(snapshot[i].username)
		}
		res.send(JSON.stringify(usernames));
	})
}

var getSignUpUser = function(req, res) {
	res.render("signup.ejs")
};

var handleSignUpUser = function(req, res) {
	var username = req.body.username.toLowerCase();
	var password = req.body.password;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
	/*var phone = req.body.phone;
	var birthday = req.body.birthday;*/
	
	db.addUser(username, password, firstname, lastname, email /*phone, birthday*/).then(_ => {
		req.session.username = username;
		req.session.type = "User";
		res.redirect("/profile?username=" + username);
	}).catch(_ => {
		res.redirect("/signup-user");
	});
	
};

var getSignUpRestaurant = function(req, res) {
	res.render("signuprestaurant.ejs")
};

var handleSignUpRestaurant = function(req, res) {
	var username = req.body.username.toLowerCase();
	var password = req.body.password;
	var name = req.body.name;
	var email = req.body.email;
	var street = req.body.street;
	var city = req.body.city;
	var state = req.body.state;
	var zipCode = req.body.zipCode;
	db.addRestaurant(username, password, name, email, street, city, state, zipCode).then(_ => {
		req.session.username = username;
		req.session.type = "Restaurant";
		res.redirect("/profile?username=" + username);
	}).catch(_ => {
		res.redirect("/signup-restaurant");
	});
	
};

var getProfile = function(req, res) {
	var username = req.params.username;
	if (!username) {
		username = req.session.username;
	}
	db.getUser(username).then(snapshot => {
		if (snapshot) {
			var user = snapshot;
			var email = user.email;
			/*
			var phone = user.phone;
			var profilePic = user.profilePic;
			 */
			if (user.type == "User") {
				var firstname = user.firstname;
				var lastname = user.lastname;
				/**var birthday = user.birthday */
				res.render("profile.ejs", {username: username, email: email, 
					firstname: firstname, lastname: lastname, user: true})
			} else if (user.type == "Restaurant") {
				var name = user.name;
				var street = user.street;
				var city = user.city;
				var state = user.state;
				var zipCode = user.zipCode;
				res.render("profile.ejs", {username: username, email: email, name: name, street: street, 
					city: city, state: state, zipCode: zipCode, user: false});
			}
			
		} else {
			res.redirect("/login");
		}
	}).catch(_ => {
		res.redirect("/login");
	});
	
};

var getChats = function(req, res) {
	var username = req.session.username;
	
	if (req.session.chats == undefined) {
		req.session.chats = []
		var first = true
		db.getChats(username, snapshot => {
			snapshot.forEach(child => {
				var chat = child
				req.session.chats.push(chat);
			});
			if (first) {
				res.send(req.session.chats);
				first = false
			}
		});
	} else {
		res.send(req.session.chats);
	}
};

var getChatsPage = function(req, res) {
	var username = req.session.username
	res.render("chats.ejs", {username: username});
}

var getChat = function(req, res) {
	var chatId = req.query.chatId;
	var username = req.session.username;
	var promises = [];
	promises.push(db.getChat(username, chatId));
	promises.push(db.getMessages(chatId));
	Promise.all(promises).then(snapshots => {
		if (snapshots[0]) {
			var chat = snapshots[0];
			var messages = [];
			if (snapshots[1]) {
				snapshots[1].forEach(child => {
					messages.push(child)
				});
			} 
			res.render('chat.ejs', {username: username, chat: JSON.stringify(chat), messages: JSON.stringify(messages)})
		} else {
			console.log("chat not found")
			res.redirect('/chats');
		}
	}).catch(err => {
		console.log(err)
		res.redirect('/chats');
	});
}

var putMessage = function(req, res) {
	var chatId = req.body.chatId;
	var message = req.body.content;
	var username = req.session.username;
	
	var promises = []
	promises.push(db.updateTime(chatId));
	promises.push(db.putMessage(chatId, username, message));
	Promise.all(promises).then(_ => {
		res.send("Done");
	}).catch(err => {
		console.log(err)
	});
}

var getNotifications = function(req, res) {
	var username = req.session.username;
	var limit = parseInt(req.query.limit)
	db.getNotifications(username, limit, snapshot => {
		var nots = []
		if (snapshot) {
			var nots = snapshot;
		}
		res.send(nots);
	});
	
	
	
}

var getNotificationsPage = function(req, res) {
	var username = req.session.username
	res.render("notifications.ejs", {username: username});
}

var getExperience = function(req, res) {
	var username = req.query.username;
	db.getExperience(username).then(snapshot => {
		var experience = {}
		if (snapshot) {
			var unclean = snapshot;
			for(var k in unclean) {
				experience[k] = []
				for(var id in unclean[k]) {
					experience[k].push(unclean[k][id]);
				}
			}
		}
		res.send(experience);
	});
}

var getReviews = function(req, res) {
	var username = req.query.username;
	db.getReviews(username, snapshot => {
		res.send(snapshot)
	});
}

var getStars = function(req, res) {
	var username = req.query.username;
	db.getStars(username).then(snapshot => {
		var stars = undefined;
		if (snapshot) {
			var unclean = snapshot;
			var sum = 0
			var num = 0
			for(var k in unclean) {
				sum += Number(unclean[k]);
				num += 1;
			}
			if (num > 4) {
				stars = sum / num;
			}
		}
		res.send(String(stars));
	})
}

var getPosts = function(req, res) {
	var limit = req.query.limit ? req.query.limit : 10
	var search = req.query.search ? req.query.search : undefined
	var p = search ? db.getPosts(limit, search) : db.getPosts(limit);
	
	p.then(snapshot => {
		console.log(snapshot)
		if (snapshot) {
			res.send(JSON.stringify(snapshot))
		}
	})
}

var getPost = function(req, res) {
	var id = req.params.id
	
	db.getPost(id).then(snapshot => {
		res.send(JSON.stringify(snapshot))
	})
}

var newPost = function(req, res) {
	var post = req.body.post
	db.putPost(post.username, post.content, post.time).then(_ => {
		res.send("Done")
	})
}

var updatePost = function(req, res) {
	var post = req.body.post
	db.updatePost(post).then(_ => {
		res.send("Done")
	})
}

var deletePost = function(req, res) {
	var id = req.params.id
	db.deletePost(id).then(_ => {
		res.send("Done")
	})
}

var connect = function() {
	db.connect()
}


var routes = {
	connect: connect,
	home: getHome,
	login: getLogin,
	handle_login: handleLogin,
	signup_user: getSignUpUser,
	handle_signup_user: handleSignUpUser,
	search_users: searchUsers,
	signup_restaurant: getSignUpRestaurant,
	handle_signup_restaurant: handleSignUpRestaurant,
	profile: getProfile,
	chats_page: getChatsPage,
	chats: getChats,
	chat: getChat,
	handle_message: putMessage,
	notifications: getNotifications,
	notifications_page: getNotificationsPage,
	experience: getExperience,
	reviews: getReviews,
	stars: getStars,
	logout: logout,
	posts: getPosts,
	add_post: newPost,
	update_post: updatePost,
	delete_post: deletePost,
	post: getPost
};

module.exports = routes;