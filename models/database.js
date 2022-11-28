var utils = require('./utils.js');
let mockeddb = require('./mockeddb.js')
var { v4: uuidv4 } = require('uuid');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
var db



var connect = async function() {
	var url = process.env.MONGODB_URL
	try {
		db = await utils.connect(url)
	} catch (e) {
		utils = mockeddb
		db = {
			Users:[
				{
					"username":"geoff",
					"password":"6c0c9335d5aa8d6156bfc296e86e1011ecd5cdeb7a090168486e4c055ccb95e9",
					"firstname":"Geoffrey",
					"lastname":"Brandt",
					"email":"g@m.com",
					"type":"User",
					"phone":"8569041158"
				},
				{
					"username":"jordan",
					"password":"6c0c9335d5aa8d6156bfc296e86e1011ecd5cdeb7a090168486e4c055ccb95e9",
					"firstname":"Jordan",
					"lastname":"Brandt",
					"email":"j@m.com",
					"type":"User",
					"phone":"8569041158"
				}
			]
		}
		console.log("Switched")
	}
	
	console.log("Connected to database")
}

var sendText = async function(rec, msg) {
	var reciever = await getUser(rec)
	if (reciever && reciever.phone) {
		client.messages.create({ 
			body: msg,  
			messagingServiceSid: 'MG633bfe4facc0db49a4d4543b93def291',
			to: reciever.phone 
		})
	}
	
}

var addUser = async function(username, password, firstname, lastname, email, phone) {//, phone, birthday, profilePic = undefined) {
	var p = []
	p.push(getUser(username));
	p.push(utils.getItem(db, "Users", {email: email}));
	return Promise.all(p).then((snapshots) => {
		if (!snapshots[0] && !snapshots[1]) {
			var obj = {
				username: username,
				password: password,
				firstname: firstname,
				lastname: lastname,
				email: email,
				type: "User",
				phone: phone
				/*birthday: birthday,
				profilePic: profilePic*/
			}
			utils.postItem(db, "Users", obj);
		} else {
			reject("Email or Username already in use");
		}
	})
	
}

var getUser = function(username) {
	return utils.getItem(db, "Users", {username: username})
}

var getUsers = function(search) {
	var find = {}
	var arr = []
	arr.push({username: new RegExp("^" + search, "i")})
	arr.push({name: new RegExp("^" + search, "i")})
	arr.push({firstname: new RegExp("^" + search, "i")})
	arr.push({lastname: new RegExp("^" + search, "i")})
	find["$or"] = arr
	return utils.getList(db, "Users", find, {username: 1}, 10)
}

var getUsersByLocation = function(zipCodes) {
	return utils.getList(db, "Settings", {zipCode: {$in: zipCodes}}, {_id: 1})
} 


var addRestaurant = async function(username, password, name, email, street, city, state, zipCode, phone) {
	var p = []
	p.push(getUser(username));
	p.push(utils.getItem(db, "Users", {email: email}));
	return Promise.all(p).then(snapshots => {
		if (!snapshots[0] && !snapshots[1]) {
			var obj = {
				username: username,
				name: name,
				password: password,
				email: email,
				street: street,
				city: city,
				state: state,
				zipCode: zipCode,
				type: "Restaurant",
				phone: phone
				/*profilePic: profilePic*/
			}
			
			var promises = []
			promises.push(utils.postItem(db, "Users", obj));
			Promise.all(promises);
		} else {
			reject("Email or Username already in use");
		}
	})
}

var getChats = async function(username, limit, callback) {
	
	var snapshot = await utils.getList(db, "Chats", {users: username}, {lastAccessed: -1}, limit)
	callback(snapshot)
}

var getChat = function(chatId) {
	return utils.getItem(db, "Chats", {id: chatId});
}

var getMessages = function(chatId, limit) {
	return utils.getList(db, "Messages", {chatId: chatId}, {created: -1}, limit)
}

var putChat = function(username1, username2) {
	var chatId;
	if (username1 < username2) {
		chatId = username1 + "@" + username2;
	} else {
		chatId = username2 + "@" + username1;
	}
	var promises = []
	var chatObj = {
		created: (new Date()).toISOString(),
		lastAccessed: (new Date()).toISOString(),
		id: chatId,
		unread: username2,
		users: [username1, username2]
	}
	promises.push(utils.postItem(db, "Chats", chatObj));
	promises.push(putNotification(username2, username1, username1 + " has created a chat with you", "New Chat"));
	return Promise.all(promises);
}

var changeUnread = function(chatId, reciever) {
	return utils.updateItem(db, "Chats", {id : chatId}, {$set: {unread: reciever}})
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
	var snapshot = await utils.getList(db, "Notifications", {username: username}, {created: -1}, limit)
	callback(snapshot);
}

var putNotification = function(username, sender, msg, type, settings, id = undefined) {
	var url = "https://stafferjobs.herokuapp.com/"
	if ((!settings) || (settings && settings.textNotification)) {
		sendText(username, msg + " " + url)
	}
	var notificationId = uuidv4();
	var notificationObj = {
		content: msg,
		created: (new Date()).toISOString(),
		id: notificationId,
		type: type,
		username: username,
		sender: sender
	}
	if (type == "New Post" && id) {
		notificationObj.postId = id
	}
	return utils.postItem(db, "Notifications", notificationObj)
}



var getPostsByRestaurant = function(username) {
	return utils.getList(db, "Posts", {username: username}, {created: -1})
}

var putPost = function(p) {
	var date = new Date();
	var expireDate = new Date(p.expiration)
	var postObj = {
		created: date.toISOString(),
		content: p.content,
		expireDate: expireDate.toISOString(),
		username: p.username,
		id: p.id,
		name: p.name,
		zipCode: p.zipCode,
		title: p.title,
		qualification: p.qualification,
		type: p.type,
		location: p.location
	}
	var promises = []
	promises.push(utils.postItem(db, "Posts", postObj));
	return Promise.all(promises);
}

var updatePost = function(post) {
	return utils.replaceItem(db, "Posts", {id: post.id}, post)
}

var getPosts = function(limit, search = undefined, filter = undefined, zipCodes = undefined) {
	var find = {}
	if (search && search.length > 0) {
		var arr = []
		arr.push({name: new RegExp(search, "gi")})
		arr.push({username: new RegExp(search, "gi")})
		arr.push({content: new RegExp(search, "gi")})
		find["$or"] = arr
	}
	if (filter && filter.length > 0) {
		find["type"] = filter
	}
	if (zipCodes && zipCodes.length > 0) {
		find["zipCode"] = {$in: zipCodes}
	}
	
	return utils.getList(db, "Posts", find, {created: -1}, parseInt(limit))
}

var deletePost = function(id) {
	return utils.deleteItem(db, "Posts", {id: id})
}

var getPost = function(id) {
	return utils.getItem(db, "Posts", {id: id})
}

var getExperience = function(username) {
	return utils.getList(db, "Experience", {username: username}, {restaurant: 1});
}

var putExperience = function(job) {
	return utils.postItem(db, "Experience", job);
}

var deleteExperience = function(username, restaurant, role) {
	return utils.deleteItem(db, "Experience", {username: username, restaurant: restaurant, role: role})
}

var getReviews = async function(username, callback) {
	var snapshot = await utils.getList(db, "Reviews", {username: username}, {created: -1})
	callback(snapshot);
	
}

var putReview = function(review) {
	return utils.postItem(db, "Reviews", review);
}

var getStars = function(username) {
	return utils.getItem(db, "Stars", {username: username});
}

var putStar = function(username, reviewer, stars) {
	return utils.replaceItem("Stars", {username: username, reviewer: reviewer}, {username: username, reviewer: reviewer, stars: stars});
}

var getProfilePic = function(id) {
	return utils.getImage("profiles", id)
}

var uploadProfilePic = function(username, id, file) {
	var promises = []
	promises.push(utils.updateItem(db, "Users", {username: username}, {$set: {pic: id}}))
	promises.push(utils.uploadImage("profiles", id, file))
	return Promise.all(promises)
}

var deleteProfilePic = function(id, username) {
	var promises = []
	promises.push(utils.updateItem(db, "Users", {username: username}, {$set: {pic: undefined}}))
	promises.push(utils.deleteImage("profiles", id))
	return Promise.all(promises)
}

var getResume = function(id) {
	return utils.getPDF("resumes", id)
}

var uploadResume = function(username, id, file) {
	var promises = []
	promises.push(utils.updateItem(db, "Users", {username: username}, {$set: {resume: id}}))
	promises.push(utils.uploadImage("resumes", id, file, {contentType: 'application/pdf'}))
	return Promise.all(promises)
}

var deleteResume = function(id, username) {
	var promises = []
	promises.push(utils.updateItem(db, "Users", {username: username}, {$set: {resume: undefined}}))
	promises.push(utils.deleteImage("resumes", id))
	return Promise.all(promises)
}

var getComments = function(postId, limit) {
	return utils.getList(db, "Comments", {postId: postId}, {created: -1}, limit)
}

var addComment = function(comment) {
	var c = {
		content: comment.content,
		author: comment.author,
		postId: comment.postId,
		created: comment.created,
		name: comment.name
	}
	return utils.postItem(db, "Comments", c)
}

var getSettings = function(username) {
	return utils.getItem(db, "Settings", {username: username})
}

var changeSettings = function(username, settings) {
	return utils.replaceItem(db, "Settings", {username: username}, settings)
}

var getSaved = function(username) {
	return utils.getList(db, "Saved", {username: username}, {id: 1})
}

var addSaved = function(username, id) {
	return utils.postItem(db, "Saved", {username: username, id: id})
}

var deleteSaved = function(username, id) {
	return utils.deleteItem(db, "Saved", {username: username, id: id})
}

module.exports = {
	connect: connect,
	//User + Restaurant
	addUser: addUser,
	getUser: getUser,
	getUsers: getUsers,
	addRestaurant: addRestaurant,
	getUsersByLocation: getUsersByLocation,
	//Chat + Messages
	getChats: getChats,
	getChat: getChat,
	getMessages: getMessages,
	putChat: putChat,
	changeUnread: changeUnread,
	putMessage: putMessage,
	updateTime: updateTime,
	//Posts
	getPostsByRestaurant: getPostsByRestaurant,
	putPost: putPost,
	getPosts: getPosts,
	getPost: getPost,
	deletePost: deletePost,
	updatePost: updatePost,
	//Notification
	getNotifications: getNotifications,
	putNotification: putNotification,
	//Experience
	getExperience: getExperience,
	putExperience: putExperience,
	deleteExperience: deleteExperience,
	//Review
	getReviews: getReviews,
	putReview: putReview,
	//Star
	getStars: getStars,
	putStar: putStar,
	//Pics
	getProfilePic: getProfilePic,
	uploadProfilePic: uploadProfilePic,
	deleteProfilePic: deleteProfilePic,
	//Comments
	getComments: getComments,
	addComment: addComment,
	//Settings
	getSettings: getSettings,
	changeSettings: changeSettings,
	//Saved
	getSaved: getSaved,
	addSaved: addSaved,
	deleteSaved: deleteSaved,
	//Resume
	getResume: getResume,
	uploadResume: uploadResume,
	deleteResume: deleteResume
	
};