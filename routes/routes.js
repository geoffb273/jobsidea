let db = require('../models/database.js');
const axios = require('axios')
const fs = require('fs');
let { v4: uuidv4 } = require('uuid');
let crypto = require('crypto'); 


const getHome = function(req, res) {
	let username = req.session.username;
	let postId = req.query.id || ""
	res.render("main.ejs", {username: username, id: postId, type: req.session.type});
};

const getLogin = function(req, res) {
	var username = req.session.username
	if (username) {
		req.session.destroy();
	}
	
	res.render("login.ejs");
};

const logout = function(req, res) {
	req.session.destroy();
	res.redirect("/login");
}

const handleLogin = function(req, res) {
	let username = req.body.username.toLowerCase();
	let password = req.body.password;
	db.getUser(username).then((snapshot) => {
		if (snapshot) {
			var user = snapshot;
			var userPassword = user.password;
			if (userPassword == crypto.createHash('sha256').update(password).digest('hex')) {
				user.password = undefined
				user._id = undefined
				res.status(200)
				res.send(user)
				/*req.session.username = user.username;
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
			*/
			} else {
				res.status(401)
				res.send("Incorrect Username or Password")
			}
		} else {
			res.status(401)
			res.send("Username not found")
		}
	}).catch(err => {
		res.status(500)
		res.send(err)
	})

};

const searchUsers = function(req, res) {
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

const getUsers = async function(req, res) {
	const { zipCode, limit, offset } = req.query
	try {
		let users = await db.getUsersByLocation([zipCode], parseInt(limit) || 10, parseInt(offset) || 0)
		let us = []
		for (let user of users) {
			us.push(user.username)
		}
		res.status(200)
		res.send(us)
	} catch (err) {
		res.status(500)
		res.send(err)
	}
	
}

const getSignUpUser = async function(req, res) {
	res.render("signup.ejs")
};

const handleSignUpUser = async function(req, res) {
	let username = req.body.username.toLowerCase();
	let password = crypto.createHash('sha256').update(req.body.password).digest('hex');
	let firstname = req.body.firstname;
	let lastname = req.body.lastname;
	let email = req.body.email;
	let phone = req.body.phone;
	let zipCode = req.body.zipCode;
	/*var birthday = req.body.birthday;*/
	var p = []
	try {
		await db.changeSettings(username, {
			zipCode: zipCode,
			username: username,
			emailNotification: true,
			textNotification: true,
			radius: 10
		})
		await db.addUser(username, password, firstname, lastname, email, phone)
		res.status(200)
		res.send({username: username, password: req.body.password})
	} catch(err) {
		res.status(500)
		res.send(err)
	}
	
	
	
};

const getSignUpRestaurant = function(req, res) {
	res.render("signuprestaurant.ejs")
};

const handleSignUpRestaurant = function(req, res) {
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
		res.redirect("/profile");
	}).catch(_ => {
		res.redirect("/login");
	});
	
};

const getProfile = function(req, res) {
	var username = req.params.username;
	
	if (req.session.users) {
		if (req.session.users[username]) {
			var user = req.session.users[username]
			res.status(200)
			res.send(user)
			/*var email = user.email;
			if (user.type == "User") {
				var firstname = user.firstname;
				var lastname = user.lastname;
				
				
			} else if (user.type == "Restaurant") {
				var name = user.name;
				var street = user.street;
				var city = user.city;
				var state = user.state;
				var zipCode = user.zipCode;
				res.render("profile.ejs", {username: username, email: email, name: name, street: street,
					city: city, state: state, zipCode: zipCode, user: false, own: ownProfile});
			}*/
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
			res.status(200)
			res.send(user)
			/*var email = user.email;
			
			var phone = user.phone;
			var profilePic = user.profilePic;
			 */
			/*if (user.type == "User") {
				var firstname = user.firstname;
				var lastname = user.lastname;
				
				
				
			} else if (user.type == "Restaurant") {
				var name = user.name;
				var street = user.street;
				var city = user.city;
				var state = user.state;
				var zipCode = user.zipCode;
				res.render("profile.ejs", {username: username, email: email, name: name, street: street,
					city: city, state: state, zipCode: zipCode, user: false, own: ownProfile});
			}*/
			
		} else {
			res.status(404)
			res.send("")
		}
	}).catch(_ => {
		res.status(500)
		res.send("")
	});
	
};

const getChats = function(req, res) {
	const username = req.params.username;
	const limit = req.query.limit ? parseInt(req.query.limit): 10;
	db.getChats(username, limit, snapshot => {
		res.status(200)
		res.send(snapshot);
	}).catch(err => {
		res.send(500)
		res.send(err)
	});
	
};

const getChatsPage = function(req, res) {
	let username = req.session.username
	let chatId = req.query.chatId
	res.render("chats.ejs", {username: username, chatId: chatId});
}

const getChat = async function(req, res) {
	let {chatId} = req.params;
	try {
		let chat = await db.getChat(chatId)
		if (chat) {
			res.status(200)
			res.send(chat)
		} else {
			res.status(404)
			res.send("Chat not found")
		}
		
	} catch (err) {
		res.status(500)
		res.send(err)
	}
	
}

const handleChats = function(req, res) {
	let {username} = req.session;
	let {username2} = req.params;
	let chatId = username + "@" + username2
	if (username > username2) {
		chatId = username2 + "@" + username
	}
	db.getChat(chatId).then(chat => {
		if (chat) {
			res.send(chatId)
		} else {
			db.putChat(username, username2).then(_ => {
				res.send(chatId)
			}).catch(_ => {
				res.send("")
			})
		}
	}).catch(_ => {
		res.send("")
	})
}

const getMessages = function(req, res) {
	let { chatId } = req.params;
	let limit = req.query.limit ? parseInt(req.query.limit) : 20;
	db.getMessages(chatId, limit).then(snapshot => {
		res.status(200)
		res.send(snapshot)
	}).catch(err => {
		res.status(500)
		res.send(err)
	})
}

const putMessage = function(req, res) {
	let {chatId, content, author} = req.body;
	let promises = []
	promises.push(db.putMessage(chatId, author, content));
	promises.push(db.updateTime(chatId));
	
	Promise.all(promises).then(rets => {
		if (rets && rets[0]) {
			res.status(200)
			res.send(rets[0]);
		} else {
			res.status(404)
			res.send("Could not put message")
		}
		
	}).catch(err => {
		res.status(500)
		res.send(err)
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
	var username = req.params.username;
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
	var username = req.session.username
	
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
		
	
	p.then(async (snapshot) => {
		var saved = await db.getSaved(username)
		var posts = snapshot
		if (saved) {
			for (var i = 0; i < snapshot.length; i++) {
				var post = posts[i]
				post.saved = false
				for (j = 0; j < saved.length; j++) {
					var id = saved[j].id
					if (post.id == id) {
						post.saved = true
						break;
					}
				}
			}
		}
		
		res.send(posts)
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

var getCreatePostPage = function(req, res) {
	if (req.session.type == "User") {
		res.redirect('/profile')
		return
	}
	var user = req.session.user
	user.password = undefined
	res.render("createpostpage.ejs")
}

const getPostPage = function(req, res) {
	var id = req.params.id
	db.getPost(id).then(post => {
		res.render('postpage.ejs', {post: JSON.stringify(post)})
	})
}

const createPost = function(req, res) {
	var user = req.session.user
	var location = user.street + " "
	var content = req.body.content
	var username = req.session.username
	var name = req.session.name
	var type = []
	if (req.body.waiter) {
		type.push("Waiter")
	}
	if (req.body.busser) {
		type.push("Busser")
	}
	if (req.body.washer) {
		type.push("Washer")
	}
	if (req.body.other) {
		type.push("Other")
	}
	var zipCode = req.session.zipCode
	var expiration = req.body.expiration
	var qualification = req.body.qualification
	var title = req.body.title
	var postId = uuidv4();
	var post = {
		content: content,
		username: username,
		name: name,
		created: new Date().toISOString(),
		type: type,
		location: location,
		zipCode: zipCode,
		expiration: expiration,
		qualification: qualification,
		title: title,
		id: postId
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
			db.putNotification(users[user].username, username, username + " in your area has a new post.", "New Post", users[user].settings, postId)
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
						var id = uuidv4();
						db.uploadProfilePic(username, id, file).then (_ => {
							req.session.users[username].pic = id
							if (req.session.pics) {
								req.session.pics[username] = id
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
			res.status(200)
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
				res.status(200)
				res.send(url)
			})
		} else {
			res.status(404)
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

var getSaved = function(req, res) {
	var username = req.session.username
	db.getSaved(username).then(saved => {
		res.send(saved)
	})
}

var postSaved = function(req, res) {
	var username = req.session.username
	var id = req.params.id
	db.getSaved(username).then(saved => {
		if (saved) {
			for (var i = 0; i < saved.length; i++) {
				var savedPost = saved[i]
				if (savedPost.id == id) {
					db.deleteSaved(username, id).then(_ => {
						res.send("Delete")
					})
					return
				}
			}
		}
		db.addSaved(username, id).then(_ => {
			res.send("Added")
		})
	})
}

var postApply = async function(req, res) {
	var sender = req.session.username
	var title = req.params.title
	var username = req.params.username
	var id = req.params.id
	var settings = await db.getSettings(username)
	db.addApplied(sender, id).then(_ => {
		db.putNotification(username, sender, sender + " has applied to your " + title + " post", "Application", settings).then(_ => {
			res.send("Done")
		})
	})
	
}

var getApply = async function(req, res) {
	
	var username = req.session.username
	var id = req.params.id
	if (req.session.applied) {
		if (req.session.applied[id]) {
			res.send(req.session.applied[id])
		}
	}
	db.getApplied(username, id).then(applied => {
		if (!req.session.applied) {
			req.session.applied = {}
		}
		req.session.applied = applied
		
		res.send(applied)
	})
	
}

const getResume = async function(req, res) {
	const {username} = req.params
	let user = await db.getUser(username)
	if (req.session.resumes && req.session.resumes[username]) {
		res.send(req.session.resumes[username])
		return
	}
	if (user.resume) {
		let url = await db.getResume(user.resume)
		res.status(200)
		res.send(url)
	} else {
		res.status(404)
		res.send("")
	}
}

var uploadResume = function(req, res) {
	var username = req.session.username
	if (req.file) {
		var path = req.file.path
		fs.readFile(path, async (err, data) => {
			var file = data
			var user = await db.getUser(username)
			if (user.resume) {
				await db.deleteResume(user.resume, username)
			}
			var id = uuidv4();
			user.resume = id
			await db.uploadResume(username, id, file)
			res.redirect('/profile')
			fs.unlink(path, _ => {})
		})
	}
}

var deleteResume = function(req, res) {
	var user = req.session.user
	db.deleteResume(user.resume, username).then(_ => {
		res.send("Done")
	})
}


const connect = function() {
	db.connect()
}


const routes = {
	connect: connect,
	//User
	login: getLogin,
	logout: logout,
	handle_login: handleLogin,
	signup_user: getSignUpUser,
	handle_signup_user: handleSignUpUser,
	search_users: searchUsers,
	get_users: getUsers,
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
	create_post_page: getCreatePostPage,
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
	change_settings: changeSettings,
	//Saved
	saved: getSaved,
	handle_save: postSaved,
	//Apply
	apply: postApply,
	get_apply: getApply,
	//Resume
	resume: getResume,
	upload_resume: uploadResume,
	delete_resume: deleteResume
};

module.exports = routes;