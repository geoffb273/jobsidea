
const {initializeApp} = require('firebase/app');
const {getDatabase, ref, set, get, query, orderByChild, limitToLast, limitToFirst, startAfter, onValue} = require('firebase/database');
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
const db = getDatabase(app);

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
}



module.exports = {
	putItem: putItem,
	getItem: getItem,
	query: queryItems,
	orderedQuery: queryItemsOrder,
	limitedQuery: queryLimit,
	onValueReference: onValueReference,
	getItemReference: getItemReference
};