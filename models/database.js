var utils = require('./utils.js');
var { v4: uuidv4 } = require('uuid');

var db
var connect = async function() {
	db = await utils.connect("mongodb+srv://geoff:brandt@cluster0.znowy.mongodb.net/jobsidea?retryWrites=true&w=majority")
	console.log("Connected to database")
}


var addUser = async function(username, password, firstname, lastname, email) {//, phone, birthday, profilePic = undefined) {
	var p = []
	p.push(getUser(username));
	p.push(utils.getItem(db, "Emails", {username: username}));
	
	return Promise.all(p).then(snapshots => {
		if (!snapshots[0] && (!snapshots[1] || email != snapshots[1])) {
			var obj = {
				username: username,
				password: password,
				firstname: firstname,
				lastname: lastname,
				email: email,
				type: "User"
				/*phone: phone,
				birthday: birthday,
				profilePic: profilePic*/
			}
			
			var promises = []
			promises.push(utils.postItem(db, "Users", obj));
			promises.push(utils.postItem(db, "Emails", {username: email}));
			Promise.all(promises);
		} else {
			reject("Email or Username already in use");
		}
	})
	
}

var getUser = function(username) {
	return utils.getItem(db, "Users", {username: username})
}


var addRestaurant = async function(username, password, name, email, street, city, state, zipCode) {
	var p = []
	p.push(getUser(username));
	p.push(utils.getItem(db, "Emails", {username: username}));
	return Promise.all(p).then(snapshots => {
		if (!snapshots[0] && (!snapshots[1] || email != snapshots[1])) {
			var obj = {
				username: username,
				name: name,
				password: password,
				email: email,
				street: street,
				city: city,
				state: state,
				zipCode: zipCode,
				type: "Restaurant"
				/*phone: phone,
				profilePic: profilePic*/
			}
			
			var promises = []
			promises.push(utils.postItem(db, "Users", obj));
			promises.push(utils.postItem(db, "Emails", {username: email}));
			Promise.all(promises);
		} else {
			reject("Email or Username already in use");
		}
	})
}

var getChats = async function(username, callback) {
	
	var snapshot = await utils.getList(db, "Chats", {users: username}, {lastAccessed: -1})
	callback(snapshot)
}

var getChat = function(username, chatId) {
	return utils.getItem(db, "Chats", {id: chatId});
}

var getMessages = function(chatId) {
	return utils.getList(db, "Messages", {chatId: chatId}, {created: -1})
}

var putChat = function(username1, username2) {
	var chatId;
	if (username1 <= username2) {
		chatId = username1 + "@" + username2;
	} else {
		chatId = username2 + "@" + username1;
	}
	var promises = []
	var chatObj = {
		created: (new Date()).toISOString(),
		lastAccessed: (new Date()).toISOString(),
		id: chatId,
		unread: false
	}
	promises.push(utils.postItem(db, "Chats", chatObj));
	promises.push(putNotification(username2, username1 + " has created a chat with you", "New Chat"));
	return Promise.all(promises);
}

var putMessage = function(chatId, author, msg) {
	var msgId = uuidv4();
	var msgObj ={
		created: (new Date()).toISOString(),
		author: author,
		content: msg,
		id: msgId,
		chatId: chatId
	}
	var promises = [];
	promises.push(utils.postItem(db, "Messages", msgObj));
	return Promise.all(promises);
}

var updateTime = function(chatId) {
	return utils.updateItem(db, "Chats", {id: chatId}, { $set: { lastAccessed: (new Date()).toISOString()} } )
}

var getNotifications = async function(username, limit, callback) {
	
	var snapshot = await utils.getList(db, "Notifications", {username: username}, {created: -1})
	callback(snapshot);
}

var putNotification = function(username, msg, type) {
	var notificationId = uuidv4();
	var notificationObj = {
		content: msg,
		created: (new Date()).toISOString(),
		id: notificationId,
		type: type,
		username: username
	}
	return utils.postItem(db, "Notifications", notificationObj)
}

var getComments = function(postId) {
	return utils.getList(db, "Comments", {postId: postId}, {created: -1})
}

var getPostsByRestaurant = function(username) {
	return utils.getList(db, "Posts", {username: username}, {created: -1})
}

var putPost = function(username, message, time) {
	var date = new Date();
	var expireDate = new Date().setTime(date.now() + time);
	var postId = uuidv4();
	var postObj = {
		created: date.toISOString(),
		content: message,
		expireDate: expireDate.toISOString(),
		username: username,
		id: postId
	}
	var promises = []
	promises.push(utils.postItem(db, "Posts", postObj));
	return Promise.all(promises);
}

var getPosts = function(limit, search = undefined) {
	var find = {}
	if (search && search != undefined) {
		find["username"] = search
	}
	return utils.getList(db, "Posts", find, {created: -1})
}

var putComment = function(postId, username, message) {
	var time = (new Date()).toISOString();
	var commentObj = {
		author: username,
		content: message,
		created: time,
		postId: postId
	}
	return utils.postItem(db, "Comments", commentObj);
}

var getExperience = function(username) {
	return utils.getItem(db, "Experience", {username: username});
}

var putExperience = function(username, type, time, location) {
	var expId = uuiv4();
	var expObj = {
		time: time,
		location: location,
		id: expId,
		username: username,
		type: type
	}
	return utils.postItem(db, "Experience", expObj);
}

var getReviews = async function(username, callback) {
	var snapshot = await utils.getList(db, "Reviews", {username: username}, {created: -1})
	
	
	callback(snapshot);
	
}

var putReview = function(username, author, message) {
	var reviewId = uuiv4()
	var reviewObj = {
		author: author,
		content: message,
		id: reviewId,
		username: username
	}
	return utils.postItem(db, "Reviews", reviewObj);
}

var getStars = function(username) {
	return utils.getItem(db, "Stars", {username: username});
}

var putStar = function(username, reviewer, stars) {
	return utils.replaceItem("Stars", {username: username, reviewer: reviewer}, {username: username, reviewer: reviewer, stars: stars});
}


module.exports = {
	connect: connect,
	addUser: addUser,
	getUser: getUser,
	addRestaurant: addRestaurant,
	getChats: getChats,
	getChat: getChat,
	getMessages: getMessages,
	putChat: putChat,
	putMessage: putMessage,
	updateTime: updateTime,
	getComments: getComments,
	getPostsByRestaurant: getPostsByRestaurant,
	putPost: putPost,
	getPosts: getPosts,
	putComment: putComment,
	getNotifications: getNotifications,
	putNotification: putNotification,
	getExperience: getExperience,
	putExperience: putExperience,
	getReviews: getReviews,
	putReview: putReview,
	getStars: getStars,
	putStar: putStar
};