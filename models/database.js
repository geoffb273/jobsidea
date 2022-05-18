var utils = require('./utils.js');
var { v4: uuidv4 } = require('uuid');


var addUser = async function(username, password, firstname, lastname, email) {//, phone, birthday, profilePic = undefined) {
	var p = []
	p.push(getUser(username));
	p.push(utils.getItem("emails", username));
	
	return Promise.all(p).then(snapshots => {
		if (!snapshots[0].exists() && (!snapshots[1].exists() || email != snapshots[1].val())) {
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
			promises.push(utils.putItem("users", username, obj));
			promises.push(utils.putItem("emails", username, email));
			Promise.all(promises);
		} else {
			reject("Email or Username already in use");
		}
	})
	
}

var getUser = function(username) {
	return utils.getItem("users", username)
}


var addRestaurant = async function(username, password, name, email, street, city, state, zipCode) {
	var p = []
	p.push(getUser(username));
	p.push(utils.getItem("emails", username));
	return Promise.all(p).then(snapshots => {
		if (!snapshots[0].exists() && (!snapshots[1].exists() || email != snapshots[1].val())) {
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
			promises.push(utils.putItem("users", username, obj));
			promises.push(utils.putItem("emails", username, email));
			Promise.all(promises);
		} else {
			reject("Email or Username already in use");
		}
	})
}

var getChats = function(username, callback) {
	var reference = utils.orderedQuery("chats", username, "lastAccessed")
	utils.onValueReference(reference, snapshot => {
		if (snapshot.exists()) {
			callback(snapshot)
		}
	});
}

var getChat = function(username, chatId) {
	return utils.getItem("chats", username + "/" + chatId);
}

var getMessages = function(chatId) {
	var reference = utils.orderedQuery("messages", chatId, "created");
	return utils.getItemReference(reference);
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
	promises.push(utils.putItem("chats", username1 + "/" + chatId, chatObj));
	promises.push(utils.putItem("chats", username2+ "/" + chatId, chatObj));
	promises.push(putNotification(username2, username1 + " has created a chat with you", "New Chat"));
	return Promise.all(promises);
}

var changeUnread = function(username, chatId, val) {
	return utils.putItem("chats", username + "/" + chatId + "/unread", val);
}

var putMessage = function(chatId, author, msg) {
	var msgId = uuidv4();
	var msgObj ={
		created: (new Date()).toISOString(),
		author: author,
		content: msg
	}
	var promises = [];
	promises.push(utils.putItem("messages", chatId + "/" + msgId, msgObj));
	return Promise.all(promises);
}

var updateTime = function(chatId) {
	var arr = chatId.split("@");
	var username1 = arr[0];
	var username2 = arr[1];
	var promises = [];
	promises.push(utils.putItem("chats", username1 + "/" + chatId +"/lastAccessed", (new Date()).toISOString()))
	promises.push(utils.putItem("chats", username2 + "/" + chatId +"/lastAccessed", (new Date()).toISOString()))
	return Promise.all(promises);
}

var getNotifications = function(username, callback) {
	var reference = utils.query("notifications", username);
	utils.onValueReference(reference, snapshot => {
		if (snapshot.exists()) {
			callback(snapshot)
		}
	})
}

var putNotification = function(username, msg, type) {
	var notificationId = uuidv4();
	var notificationObj = {
		content: msg,
		created: (new Date()).toISOString(),
		id: notificationId,
		type: type
	}
	return utils.putItem("notifications", username + "/" + notificationId, notificationObj)
}

var getComments = function(postId) {
	return utils.query("comments", postId);
}

var getPostsByRestaurant = function(username) {
	return utils.query("postsByRestaurant", username);
}

var putPost = function(username, message, time) {
	var date = new Date();
	var expireDate = new Date().setTime(date.now() + time);
	var postId = uuidv4();
	var postObj = {
		created: date.toISOString(),
		content: message,
		expireDate: expireDate.toISOString(),
		author: username
	}
	var promises = []
	promises.push(utils.putItem("posts", postId, postObj));
	promises.push(utils.putItem("postsByRestaurant", username + "/" + postId, true));
	return Promise.all(promises);
}

var getPosts = function() {
	return utils.query("posts", "");
}

var putComment = function(postId, username, message) {
	var time = (new Date()).toISOString();
	var commentObj = {
		author: username,
		content: message,
		created: time
	}
	return utils.putItem("comments", postId + "/" + time, commentObj);
}

var getExperience = function(username) {
	return utils.getItem("experience", username);
}

var putExperience = function(username, type, time, location) {
	var expId = uuiv4();
	var expObj = {
		time: time,
		location: location,
		id: expId
	}
	return utils.putItem("experience", username + "/" + type + "/" + expId, expObj);
}

var getReviews = function(username, callback) {
	var reference = utils.query("reviews", username);
	
	utils.onValueReference(reference, snapshot => {
		if (snapshot.exists()) {
			callback(snapshot);
		}
	});
}

var putReview = function(username, author, message) {
	var reviewId = uuiv4()
	var reviewObj = {
		author: author,
		content: message,
		id: reviewId
	}
	return utils.putItem("reviews", username + "/" + reviewId, reviewObj);
}

var getStars = function(username) {
	return utils.getItem("stars", username);
}

var putStar = function(username, reviewer, stars) {
	return utils.putItem("stars", username + "/" + reviewer, stars);
}


module.exports = {
	addUser: addUser,
	getUser: getUser,
	addRestaurant: addRestaurant,
	getChats: getChats,
	getChat: getChat,
	getMessages: getMessages,
	putChat: putChat,
	changeUnread: changeUnread,
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