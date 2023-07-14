
import { initializeApp } from 'firebase/app';
import { MongoClient } from "mongodb"
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, getBytes } from 'firebase/storage'
const firebaseConfig = {
  apiKey: "AIzaSyDAYfUUgg1MN4sTHLxD1mm2QBJvnK-QIXg",
  authDomain: "jobsidea.firebaseapp.com",
  projectId: "jobsidea",
  storageBucket: "jobsidea.appspot.com",
  messagingSenderId: "814951253681",
  appId: "1:814951253681:web:c29469ca39cb68389f4490",
};

const app = initializeApp(firebaseConfig);

// Get a reference to the database service
const storage = getStorage(app);
const connect = async (url) => {
    //console.log(url)
    try {
        const conn = (await(MongoClient.connect(url, 
            {useNewUrlParser: true, useUnifiedTopology: true}))).db()
        //console.log("Connected to the database " + conn.databaseName)
        return conn;
    } catch(err) {
        console.error(err)
        throw new Error("Could not connect")
    }
}

const postItem = async function(db, collection, obj) {
	try {
		return await db.collection(collection).insertOne(obj)
	} catch(err) {
		console.error(err)
        throw new Error("Could not add obj")
	}
}

const getItem = async function(db, collection, find) {
	try {
		return await db.collection(collection).findOne(find)
	} catch(err) {
		console.error(err)
        throw new Error("Could not get item from collection " + collection)
	}
	
}

const getList = async function(db, collection, find, sort, limit = 0, offset = 0) {
	try {
		return (await db.collection(collection).find(find).sort(sort).limit(limit).skip(offset)).toArray()
	} catch(err) {
		console.error(err)
        throw new Error("Could not get list from collection " + collection)
	}
}

const replaceItem = async function(db, collection, find, obj) {
	try {
		return await db.collection(collection).replaceOne(find, obj, {upsert: true})
	} catch(err) {
		console.error(err)
        throw new Error("Could not get replace item from collection " + collection)
	}
}

const updateItem = async function(db, collection, find, obj) {
	try {
		return await db.collection(collection).updateOne(find, obj)
	} catch(err) {
		console.error(err)
        throw new Error("Could not get replace item from collection " + collection)
	}
}

const deleteItem = async function(db, collection, find) {
	try {
		return await db.collection(collection).deleteOne(find)
	} catch(err) {
		console.error(err)
        throw new Error("Could not get delete item from collection " + collection)
	}
}

const getImage = function(path, id) {
	var r = ref(storage, path + "/" + id);
	return getDownloadURL(r)
}

const uploadImage = function(path, id, file, metadata = {}) {
	var r = ref(storage, path + "/" + id);
	return uploadBytes(r, file, metadata)
}

const deleteImage = function(path, id) {
	var r = ref(storage, path + "/" + id);
	return deleteObject(r)
}

const getPDF = function(path, id) {
	var r = ref(storage, path + "/" + id);
	return getDownloadURL(r)
}



//const {getDatabase, ref, set, get, query, orderByChild, limitToLast, limitToFirst, startAfter, onValue} = require('firebase/database');

/*
var putItem = function(tableName, path, obj) {
	return set(ref(db, tableName + "/" + path), obj);
}

var getItem = function(tableName, path) {
	return get(ref(db, tableName + "/" + path))
}

var onValueReference = function(reference, callback) {
	return onValue(reference, callback);
}

var getItemReference = function(reference) {
	return get(reference);
}

var queryItems = function(tableName, path) {
	var reference = query(ref(db, tableName + "/" + path));
	return reference;
}

var queryItemsOrder = function(tableName, path, orderKey) {
	var reference = query(ref(db, tableName + "/" + path), orderByChild(orderKey));
	return reference;
}

var queryLimit = function(tableName, path, orderKey, limit, ascending = true, start = false) {
	var reference;
	if (ascending) {
		reference = query(ref(db, tableName + "/" + path), orderByChild(orderKey), startAfter(start), limitToFirst(limit));
	} else {
		reference = query(ref(db, tableName + "/" + path), orderByChild(orderKey), startAfter(start), limitToLast(limit));
	}
	
	return reference;
}*/



export default {
	connect: connect,
	getItem: getItem,
	postItem: postItem,
	getList: getList,
	replaceItem: replaceItem,
	deleteItem: deleteItem,
	updateItem: updateItem,
	getImage: getImage,
	uploadImage: uploadImage,
	deleteImage: deleteImage,
	getPDF: getPDF
};