import { Db, Filter, Document } from 'mongodb';
import {connect as dbConnect, deleteImage, deleteItem, getImage, getItem, getList, getPDF, postItem, replaceItem, updateItem, uploadImage} from './utils';
import { randomUUID } from 'crypto'
import type { Settings } from '../types/settingsTypes'



let db: Db

const connect = async function() {
	var url = process.env.MONGODB_URL
	try {
		if (url != null) {
			db = await dbConnect(url)
			console.log("Connected to database")
		}
	} catch (e) {

	}
	
	
}

/*const sendText = async function(rec: string, msg) {
	var reciever = await getUser(rec)
	if (reciever && reciever.phone) {
		client.messages.create({ 
			body: msg,  
			messagingServiceSid: 'MG633bfe4facc0db49a4d4543b93def291',
			to: reciever.phone 
		})
	}
	
}*/

const addUser = async function({username, password, firstname, lastname, email, phone}: {username: string, password: string, firstname: string, lastname: string, email: string, phone: string}) {//, phone, birthday, profilePic = undefined) {
	var p = []
	p.push(getUser(username));
	p.push(getItem(db, "Users", {email: email}));
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
			postItem(db, "Users", obj);
		} else {
			throw new Error("Email or Username already in use");
		}
	})
	
}

const getUser = function(username: string) {
	return getItem(db, "Users", {username: username})
}

const getUsers = function(search: string) {
	let find: Filter<Document> = {}
	let arr = []
	arr.push({username: new RegExp("^" + search, "i")})
	arr.push({name: new RegExp("^" + search, "i")})
	arr.push({firstname: new RegExp("^" + search, "i")})
	arr.push({lastname: new RegExp("^" + search, "i")})
	find["$or"] = arr
	return getList(db, "Users", find, {username: 1}, 10)
}

const getUsersByLocation = function(zipCodes: string[], limit?: number, offset?: number) {
	return getList(db, "Settings", {zipCode: {$in: zipCodes}}, {_id: 1}, limit, offset)
} 


const addRestaurant = async function({username, password, name, email, street, city, state, zipCode, phone}: {username: string; password: string; name: string; email: string; street: string; city: string; state: string; zipCode: string; phone: string;}) {
	var p = []
	p.push(getUser(username));
	p.push(getItem(db, "Users", {email: email}));
	return Promise.all(p).then(snapshots => {
		if (!snapshots[0] && !snapshots[1]) {
			const obj = {
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
			
			let promises = []
			promises.push(postItem(db, "Users", obj));
			Promise.all(promises);
		} else {
			throw new Error("Email or Username already in use");
		}
	})
}

const getChats = function(username: string, limit = 10) {
	return getList(db, "Chats", {users: username}, {lastAccessed: -1}, limit)
}

const getChat = function(chatId: string) {
	return getItem(db, "Chats", {id: chatId});
}

const getMessages = function(chatId: string, limit?: number) {
	return getList(db, "Messages", {chatId}, {created: -1}, limit)
}

const putChat = function(username1: string, username2: string) {
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
	promises.push(postItem(db, "Chats", chatObj));
	//promises.push(putNotification(username2, username1, username1 + " has created a chat with you", "New Chat"));
	return Promise.all(promises);
}

const changeUnread = function(chatId: string, reciever: string) {
	return updateItem(db, "Chats", {id : chatId}, {$set: {unread: reciever}})
}

const putMessage = function(chatId: string, author: string, msg: string) {
	let msgId = randomUUID();
	let msgObj ={
		created: (new Date()).toISOString(),
		author,
		content: msg,
		id: msgId,
		chatId
	}
	return postItem(db, "Messages", msgObj).then(_ => {return msgObj});
}

const updateTime = function(chatId: string) {
	return updateItem(db, "Chats", {id: chatId}, { $set: { lastAccessed: (new Date()).toISOString()} } )
}

const getNotifications = async function(username: string, callback: (snapshot: Document) => void, limit?: number,) {
	var snapshot = await getList(db, "Notifications", {username: username}, {created: -1}, limit)
	callback(snapshot);
}

const putNotification = function(username: string, sender: string, msg: string, type: string, settings: Settings, id?: string) {
	var url = "https://stafferjobs.herokuapp.com/"
	if ((!settings) || (settings && settings.textNotification)) {
		//sendText(username, msg + " " + url)
	}
	var notificationId = randomUUID();
	var notificationObj = {
		content: msg,
		created: (new Date()).toISOString(),
		id: notificationId,
		type: type,
		username: username,
		sender: sender
	}
	return postItem(db, "Notifications", notificationObj)
}

const getProfilePic = function(id: string) {
	return getImage("profiles", id)
}

const uploadProfilePic = function(username: string, id: string, file: Uint8Array | Blob | ArrayBuffer) {
	var promises = []
	promises.push(updateItem(db, "Users", {username: username}, {$set: {pic: id}}))
	promises.push(uploadImage("profiles", id, file))
	return Promise.all(promises)
}

const deleteProfilePic = function(id: string, username: string) {
	var promises = []
	promises.push(updateItem(db, "Users", {username: username}, {$set: {pic: undefined}}))
	promises.push(deleteImage("profiles", id))
	return Promise.all(promises)
}

const getResume = function(id: string) {
	return getPDF("resumes", id)
}

const uploadResume = function(username: string, id: string, file: Uint8Array | Blob | ArrayBuffer) {
	var promises = []
	promises.push(updateItem(db, "Users", {username: username}, {$set: {resume: id}}))
	promises.push(uploadImage("resumes", id, file, {contentType: 'application/pdf'}))
	return Promise.all(promises)
}

const deleteResume = function(id: string, username: string) {
	var promises = []
	promises.push(updateItem(db, "Users", {username: username}, {$set: {resume: undefined}}))
	promises.push(deleteImage("resumes", id))
	return Promise.all(promises)
}


const getSettings = function(username: string) {
	return getItem(db, "Settings", {username})
}

const changeSettings = function(username: string, settings: Settings) {
	return replaceItem(db, "Settings", {username}, settings)
}

const getSaved = function(username: string) {
	return getList(db, "Saved", {username}, {id: 1})
}

const addSaved = function(username: string, id: string) {
	return postItem(db, "Saved", {username, id})
}

const deleteSaved = function(username: string, id: string) {
	return deleteItem(db, "Saved", {username, id})
}

const getApplied = function(username: string, id: string) {
	return getItem(db, "Applied", {username: username, id: id})
}

const addApplied = function(username: string, id: string) {
	return postItem(db, "Applied", {username, id})
}



export {
	connect,
	//User + Restaurant
	addUser,
	getUser,
	getUsers,
	addRestaurant,
	getUsersByLocation,
	//Chat + Messages
	getChats,
	getChat,
	getMessages,
	putChat,
	changeUnread,
	putMessage,
	updateTime,
	//Notification
	getNotifications,
	putNotification,
	//Pics
	getProfilePic,
	uploadProfilePic,
	deleteProfilePic,
	//Settings
	getSettings,
	changeSettings,
	//Saved
	getSaved,
	addSaved,
	deleteSaved,
	//Resume
	getResume,
	uploadResume,
	deleteResume,
	//Applied
	getApplied,
	addApplied
	
};