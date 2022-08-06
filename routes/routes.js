var db = require('../models/database.js');
const axios = require('axios')
const fs = require('fs')
var crypto = require('crypto'); 

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
	db.getUser(username).then(async(snapshot) => {
		if (snapshot) {
			var user = snapshot;
			var userPassword = user.password;
			if (userPassword == crypto.createHash('sha256').update(password).digest('hex')) {
				req.session.username = user.username;
				req.session.user = user
				req.session.type = user.type;
				if (user.type == "User") {
					req.session.name = user.firstname + " " + user.lastname
				} else {
					req.session.name = user.name
					req.session.zipCode = user.zipCode
				}
				var settings = await db.getSettings(username)
				req.session.settings = settings ? settings : {
					username: username, 
					emailNotification: true, 
					textNotification: true,
					zipCode: "08043",
					radius: user.type == "User" ? undefined: 10
				}
				res.redirect("/profile");
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
	db.getUsers(search).then(async function(snapshot) {
		var users = []
		for(var i = 0; i < snapshot.length; i++) {
			var user = snapshot[i]
			var userObj = {}
			userObj.username = user.username
			if (user.type == "User") {
				userObj.name = user.firstname + " " + user.lastname
			} else {
				userObj.name = user.name
			}
			if (user.pic) {
				try {
					var url = await db.getProfilePic(user.pic)
					userObj.pic = url
				} catch (err) {
					userObj.pic = ""
				}
				users.push(userObj)
			} else {
				userObj.pic = ""
				users.push(userObj)
			}
		}
		res.send(users);
	})
}

var getSignUpUser = function(req, res) {
	res.render("signup.ejs")
};

var handleSignUpUser = function(req, res) {
	var username = req.body.username.toLowerCase();
	var password = crypto.createHash('sha256').update(req.body.password).digest('hex');
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
	var phone = req.body.phone;
	var zipCode = req.body.zipCode;
	console.log(phone)
	/*var birthday = req.body.birthday;*/
	var p = []
	p.push(db.changeSettings(username, {
			zipCode: zipCode,
			username: username,
			emailNotification: true,
			textNotification: true,
			radius: 10
		})
	)
	p.push(db.addUser(username, password, firstname, lastname, email, phone/*, birthday*/))
	Promise.all(p).then(_ => {
		req.session.username = username;
		req.session.user = {
			username: username,
			firstname: firstname,
			lastname: lastname,
			email: email,
			phone: phone
		}
		req.session.name = firstname + " " + lastname
		req.session.type = "User";
		
		res.redirect("/profile");
	}).catch(err => {
		console.log(err)
		res.redirect("/signup-user");
	});
	
};

var getSignUpRestaurant = function(req, res) {
	res.render("signuprestaurant.ejs")
};

var handleSignUpRestaurant = function(req, res) {
	var username = req.body.username.toLowerCase();
	var password = crypto.createHash('sha256').update(req.body.password).digest('hex');
	var name = req.body.name;
	var email = req.body.email;
	var street = req.body.street;
	var city = req.body.city;
	var state = req.body.state;
	var zipCode = req.body.zipCode;
	var phone = req.body.phone;
	var p = []
	p.push(db.changeSettings(username, {
			zipCode: zipCode,
			username: username,
			emailNotification: true,
			textNotification: true,
			radius: 10
		})
	)
	p.push(db.addRestaurant(username, password, name, email, street, city, state, zipCode, phone))
	Promise.all(p).then(_ => {
		req.session.username = username;
		req.session.user = {
			username: username,
			name: name,
			email: email,
			phone: phone,
			street: street,
			city: city,
			state: state,
			zipCode: zipCode
		}
		req.session.name = name
		req.session.type = "Restaurant";
		res.redirect("/profile?username=" + username);
	}).catch(_ => {
		res.redirect("/signup-restaurant");
	});
	
};

var getProfile = function(req, res) {
	var username = req.params.username;
	var ownProfile = false
	if (!username || (username && username == req.session.username)) {
		username = req.session.username;
		ownProfile = true
	}
	if (req.session.users) {
		if (req.session.users[username]) {
			var user = req.session.users[username]
			var email = user.email;
			if (user.type == "User") {
				var firstname = user.firstname;
				var lastname = user.lastname;
				res.render("profile.ejs", {username: username, email: email,
					name: firstname + " " + lastname, user: true, own: ownProfile})
			} else if (user.type == "Restaurant") {
				var name = user.name;
				var street = user.street;
				var city = user.city;
				var state = user.state;
				var zipCode = user.zipCode;
				res.render("profile.ejs", {username: username, email: email, name: name, street: street,
					city: city, state: state, zipCode: zipCode, user: false, own: ownProfile});
			}
			return
		}
	}
	
	db.getUser(username).then(snapshot => {
		if (snapshot) {
			if (req.session.users) {
				req.session.users[username] = snapshot
			} else {
				req.session.users = {}
				req.session.users[username] = snapshot
			}
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
					name: firstname + " " + lastname, user: true, own: ownProfile})
			} else if (user.type == "Restaurant") {
				var name = user.name;
				var street = user.street;
				var city = user.city;
				var state = user.state;
				var zipCode = user.zipCode;
				res.render("profile.ejs", {username: username, email: email, name: name, street: street,
					city: city, state: state, zipCode: zipCode, user: false, own: ownProfile});
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
	var limit = parseInt(req.query.limit);
	db.getChats(username, limit, snapshot => {
		res.send(snapshot);
	});
	
};

var getChatsPage = function(req, res) {
	var username = req.session.username
	res.render("chats.ejs", {username: username});
}

var getChat = async function(req, res) {
	var chatId = req.params.chatId;
	var username = req.session.username;
	var users = chatId.split("@")
	if (username != users[0] && username != users[1]) {
		res.send({})
		return
	}
	
	var chat = await db.getChat(chatId)
	res.send(chat)
}

var handleChats = function(req, res) {
	var username = req.session.username;
	var username2 = req.params.username;
	var chatId = username + "@" + username2
	if (username > username2) {
		chatId = username2 + "@" + username
	}
	db.getChat(chatId).then(chat => {
		if (chat) {
			res.redirect("/chats")
		} else {
			db.putChat(username, username2).then(_ => {
				res.redirect("/chats")
			}).catch(_ => {
				res.redirect("/chats")
			})
		}
	}).catch(_ => {
		res.redirect("/chats")
	})
}

var getMessages = function(req, res) {
	var chatId = req.query.chatId;
	var limit = req.query.limit ? parseInt(req.query.limit) : 20;
	db.getMessages(chatId, limit).then(snapshot => {
		res.send(JSON.stringify(snapshot))
	})
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
	var username = req.params.username;
	if (req.session.experience) {
		if (req.session.experience[username]) {
			res.send(req.session.experience[username])
			return
		}
	}
	db.getExperience(username).then(snapshot => {
		var experience = {}
		if (snapshot) {
			for (var i = 0; i < snapshot.length; i++) {
				var exp = snapshot[i]
				
				if (experience[exp.restaurant]) {
					experience[exp.restaurant].push(exp)
				} else {
					experience[exp.restaurant] = []
					experience[exp.restaurant].push(exp)
				}
			}
		}
		if (req.session.experience) {
			req.session.experience[username] = experience
		} else {
			req.session.experience = {}
			req.session.experience[username] = experience
		}
		res.send(experience);
	});
}

var getExperiencePage = function(req, res) {
	var username = req.session.username
	if (req.session.experience) {
		if (req.session.experience[username]) {
			var experience = req.session.experience[username]
			res.render('experiencepage.ejs', {experience: JSON.stringify(experience)})
			return
		}
	}
	db.getExperience(username).then(snapshot => {
		var experience = {}
		if (snapshot) {
			for (var i = 0; i < snapshot.length; i++) {
				var exp = snapshot[i]
				
				if (experience[exp.restaurant]) {
					experience[exp.restaurant].push(exp)
				} else {
					experience[exp.restaurant] = []
					experience[exp.restaurant].push(exp)
				}
			}
		}
		if (req.session.experience) {
			req.session.experience[username] = experience
		} else {
			req.session.experience = {}
			req.session.experience[username] = experience
		}
		res.render('experiencepage.ejs', {experience: JSON.stringify(experience), username: username})
	});
}

var putExperience = function(req, res) {
	var job = req.body.job
	var username = req.session.username
	job.username = username
	if (req.session.experience) {
		if (req.session.experience[username]) {
			if(req.session.experience[username][job.restaurant]) {
				req.session.experience[username][job.restaurant].push(job)
			} else {
				req.session.experience[username][job.restaurant] = []
				req.session.experience[username][job.restaurant].push(job)
			}
		}
	}
	db.putExperience(job).then(_ => {
		res.send('Done')
	})
}

var deleteExperience = function(req, res) {
	var username = req.session.username
	var restaurant = req.params.restaurant
	var role = req.params.role
	if (req.session.experience) {
		if (req.session.experience[username]) {
			if (req.session.experience[username][restaurant]) {
				var exp = req.session.experience[username][restaurant]
				var newExp = exp.filter(item => {return item.role != role})
				if (newExp.length > 0) {
					req.session.experience[username][restaurant] = newExp
				} else {
					delete req.session.experience[username][restaurant]
					
				}
			}
		}
	}
	db.deleteExperience(username, restaurant, role).then(_ => {
		res.send('Done')
	})
}

var getReviews = function(req, res) {
	var username = req.query.username;
	db.getReviews(username, snapshot => {
		res.send(snapshot)
	});
}

var addReview = function(req, res) {
	var user = req.session.user
	var username = req.body.username
	var review = {
		content: req.body.review,
		username: username,
		created: new Date().toISOString(),
		author: req.session.username,
		name: user.name ? user.name : user.firstname + " " + user.lastname
	}
	
	db.putReview(review).then(async (_) => {
		var settings = await db.getSettings(username)
		db.putNotification(username, review.author, review.author + " has posted a review", "Review", settings)
		res.redirect("/profile/" + username)
	})
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

var getPosts = async function(req, res) {
	var limit = req.query.limit ? req.query.limit : 10
	var search = req.query.search ? req.query.search : undefined
	var zipCode = req.query.zipCode ? req.query.zipCode : undefined
	var radius = req.query.radius ? req.query.radius : 10
	var filter = req.query.filter ? req.query.filter : undefined
	
	var zipCodes = []
	
	/*if (zipCode && req.session.zips && req.session.zips[zipCode] && req.session.zips[zipCode][radius]) {
		zipCodes = req.session.zips[zipCode][radius]
	} else if(zipCode) {
		zipCodes = await getZipCodes(zipCode, radius)
		if (req.session.zips) {
			if (req.session.zips[zipCode]) {
				req.session.zips[zipCode][radius] = zipCodes
			} else {
				req.session.zips[zipCode] = {}
				req.session.zips[zipCode][radius] = zipCodes
			}
		} else {
			req.session.zips = {}
			req.session.zips[zipCode] = {}
			req.session.zips[zipCode][radius] = zipCodes
		}
	}*/
	if (zipCode) {
		zipCodes = [zipCode]
	}
	
	
	var p = zipCodes ? db.getPosts(limit, search, filter, zipCodes): db.getPosts(limit, search, filter)
		
	
	p.then(snapshot => {
		if (snapshot) {
			res.send(snapshot)
		}
	})
}

var getPost = function(req, res) {
	var id = req.params.id
	if (req.session.posts) {
		if (req.session.posts[id]) {
			res.send(req.session.posts[id])
			return
		}
	}
	db.getPost(id).then(snapshot => {
		if (req.session.posts) {
			req.session.posts[id] = snapshot
		} else {
			req.session.posts = {}
			req.session.posts[id] = snapshot
		}
		res.send(snapshot)
	})
}

var getPostPage = function(req, res) {
	var id = req.params.id
	db.getPost(id).then(post => {
		res.render('postpage.ejs', {post: JSON.stringify(post)})
	})
}

var createPost = function(req, res) {
	var content = req.body.content
	var username = req.session.username
	var name = req.session.name
	var type = req.body.type
	var zipCode = req.session.zipCode
	var expiration = req.body.expiration
	var post = {
		content: content,
		username: username,
		name: name,
		created: new Date().toISOString(),
		type: type,
		zipCode: zipCode,
		expiration: expiration
	}
	
	db.putPost(post).then(async (_) => {
		res.redirect('/profile')
		var zipCodes = [zipCode]
		var found = false
		/*if (req.session.zips) {
			if (req.session.zips[zipCode]) {
				if (req.session.zips[zipCode][10]) {
					zipCodes = req.session.zips[zipCode][10];
					found = true
				}
			}
		}
		if (!found) {
			zipCodes = await getZipCodes(zipCode)
			if (req.session.zips) {
				if (req.session.zips[zipCode]) {
					req.session.zips[zipCode][10] = zipCodes
				} else {
					req.session.zips[zipCode] = {}
					req.session.zips[zipCode][10] = zipCodes
				}
			} else {
				req.session.zips = {}
				req.session.zips[zipCode] = {}
				req.session.zips[zipCode][10] = zipCodes
			}
		}*/
		var users = await db.getUsersByLocation(zipCodes)
		for (var user in users) {
			db.putNotification(users[user].username, username, username + " in your area has a new post.", "New Post", users[user].settings)
		}
	})
	
}

var getZipCodes = async function(zipCode, radius = "10") {
	var key = "IHIYP8RAX9QB541A2VBS"
	var url = "https://api.zip-codes.com/ZipCodesAPI.svc/1.0/FindZipCodesInRadius?zipcode=" + zipCode + "&maximumradius=" + radius + "&country=US&key=" + key
	zipCodes = [zipCode]
	var data = await axios.get(url)
	var list = data.data.DataList
	for (var i = 0; i < list.length; i++) {
		zipCodes.push(list[i].Code)
	}
	return zipCodes
}



var getRestaurantPosts = function(req, res) {
	var username = req.params.username
	db.getPostsByRestaurant(username).then(posts => {
		res.send(posts)
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

var uploadProfilePic = function(req, res) {
	var username = req.session.username
	if (req.file) {
		var path = req.file.path
		fs.readFile(path, (err, data) => {
			if (err) {
				res.redirect('/profile')
				return
			}
			var file = data
			db.getUser(username).then(user => {
				if (user.pic) {
					db.deleteProfilePic(user.pic, username).then(_ => {
						db.uploadProfilePic(username, file).then(_ => {
							req.session.users[username].pic = req.file.filename
							if (req.session.pics) {
								if (req.session.pics[username]) {
									delete req.session.pics[username]
								}
							}
							res.redirect('/profile')
							fs.unlink(path, _ => {})
						})
					})
				} else {
					db.uploadProfilePic(username, file).then(_ => {
						req.session.users[username].pic = req.file.filename
						if (req.session.pics) {
							if (req.session.pics[username]) {
								delete req.session.pics[username]
							}
						}
						res.redirect('/profile')
						fs.unlink(path, _ => {})
					})
				}
			})
		})
	} else {
		res.redirect('/profile')
	}
	
}

var getProfilePic = function(req, res) {
	var id = req.params.id
	db.getProfilePic(id).then(url => {
		res.send(url)
	}).catch(_ => {
		res.send("")
	})
}

var deleteProfilePic = function(req, res) {
	var id = req.params.id
	var username = req.params.username
	db.deleteProfilePic(id, username).then(_ => {
		res.send("Done")
	}).catch(_ => {
		res.send("DNE")
	})
}

var getUserProfilePic = function(req, res) {
	var username = req.params.username
	if (req.session.pics) {
		if (req.session.pics[username]) {
			res.send(req.session.pics[username])
			return
		}
	}
	db.getUser(username).then(user => {
		if (user.pic) {
			db.getProfilePic(user.pic).then(url => {
				if (req.session.pics) {
					req.session.pics[username] = url
				} else {
					req.session.pics = {}
					req.session.pics[username] = url
				}
				res.send(url)
			})
		} else {
			if (req.session.pics) {
				req.session.pics[username] = ""
			} else {
				req.session.pics = {}
				req.session.pics[username] = ""
			}
			res.send("")
		}
	})
}

var addComment = function(req, res) {
	var comment = req.body.comment
	comment.author = req.session.username
	comment.name = req.session.name
	var post = req.body.post
	db.addComment(comment).then(async(_) => {
		var reciever = post.username
		var sender = comment.author
		if (reciever != sender) {
			var settings = await db.getSettings(reciever)
			db.putNotification(reciever, sender, sender + " commented on your post.", "Comment", settings)
		}
		res.send("Done")
	})
}

var getComments = function(req, res) {
	var postId = req.params.postId
	db.getComments(postId).then(comments => {
		res.send(comments)
	})
}


var getSettingsPage = function(req, res) {
	var username = req.session.username
	var settings = req.session.settings
	var isUser = req.session.type == "User"
	res.render('settingspage.ejs', {username: username, settings: JSON.stringify(settings), isUser: isUser})
	
}

var changeSettings = function(req, res) {
	var settings = req.body
	delete settings._id 
	var username = req.session.username
	req.session.settings = settings
	db.changeSettings(username, settings).then(_ => {
		res.send("Done")
	})
}

var connect = function() {
	db.connect()
}


var routes = {
	connect: connect,
	//User
	login: getLogin,
	logout: logout,
	handle_login: handleLogin,
	signup_user: getSignUpUser,
	handle_signup_user: handleSignUpUser,
	search_users: searchUsers,
	signup_restaurant: getSignUpRestaurant,
	handle_signup_restaurant: handleSignUpRestaurant,
	profile: getProfile,
	//Chat + Message
	chats_page: getChatsPage,
	chats: getChats,
	chat: getChat,
	handle_chats: handleChats,
	messages: getMessages,
	handle_message: putMessage,
	//Notification
	notifications: getNotifications,
	notifications_page: getNotificationsPage,
	//Experience
	experience: getExperience,
	experience_page: getExperiencePage,
	put_experience: putExperience,
	delete_experience: deleteExperience,
	//Review
	reviews: getReviews,
	add_review: addReview,
	//Star
	stars: getStars,
	//Posts
	home: getHome,
	posts: getPosts,
	add_post: createPost,
	update_post: updatePost,
	delete_post: deletePost,
	post: getPost,
	post_page: getPostPage,
	restaurant_posts: getRestaurantPosts,
	//Pic
	pic: getProfilePic,
	handle_pic: uploadProfilePic,
	delete_pic: deleteProfilePic,
	user_pic: getUserProfilePic,
	//Comment
	add_comment: addComment,
	comments: getComments,
	//Settings
	settings: getSettingsPage,
	change_settings: changeSettings
};

module.exports = routes;