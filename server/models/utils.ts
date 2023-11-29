import { initializeApp } from 'firebase/app';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  type Db,
  type Filter,
  MongoClient,
  type Sort,
  type Document,
} from 'mongodb';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

const connect = async (url: string) => {
  try {
    const conn = (await MongoClient.connect(url)).db();
    return conn;
  } catch (err) {
    console.error(err);
    throw new Error('Could not connect');
  }
};

const postItem = function (db: Db, collection: string, obj: Document) {
  try {
    return db.collection(collection).insertOne(obj);
  } catch (err) {
    console.error(err);
    throw new Error('Could not add obj');
  }
};

const getItem = function (db: Db, collection: string, find: Filter<Document>) {
  try {
    return db.collection(collection).findOne(find);
  } catch (err) {
    console.error(err);
    throw new Error('Could not get item from collection ' + collection);
  }
};

const getList = function (
  db: Db,
  collection: string,
  find: Filter<Document>,
  sort: Sort,
  limit = 0,
  offset = 0,
) {
  try {
    return db
      .collection(collection)
      .find(find)
      .sort(sort)
      .limit(limit)
      .skip(offset)
      .toArray();
  } catch (err) {
    console.error(err);
    throw new Error('Could not get list from collection ' + collection);
  }
};

const replaceItem = function (
  db: Db,
  collection: string,
  find: Filter<Document>,
  obj: Document,
) {
  try {
    return db.collection(collection).replaceOne(find, obj, { upsert: true });
  } catch (err) {
    console.error(err);
    throw new Error('Could not get replace item from collection ' + collection);
  }
};

const updateItem = function (
  db: Db,
  collection: string,
  find: Filter<Document>,
  obj: Document,
) {
  try {
    return db.collection(collection).updateOne(find, obj);
  } catch (err) {
    console.error(err);
    throw new Error('Could not get replace item from collection ' + collection);
  }
};

const deleteItem = function (
  db: Db,
  collection: string,
  find: Filter<Document>,
) {
  try {
    return db.collection(collection).deleteOne(find);
  } catch (err) {
    console.error(err);
    throw new Error('Could not get delete item from collection ' + collection);
  }
};

const getImage = function (path: string, id: string) {
  const r = ref(storage, path + '/' + id);
  return getDownloadURL(r);
};

const uploadImage = function (
  path: string,
  id: string,
  file: Uint8Array | Blob | ArrayBuffer,
  metadata = {},
) {
  const r = ref(storage, path + '/' + id);
  return uploadBytes(r, file, metadata);
};

const deleteImage = function (path: string, id: string) {
  const r = ref(storage, path + '/' + id);
  return deleteObject(r);
};

const getPDF = function (path: string, id: string) {
  const r = ref(storage, path + '/' + id);
  return getDownloadURL(r);
};

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

export {
  connect,
  getItem,
  postItem,
  getList,
  replaceItem,
  deleteItem,
  updateItem,
  getImage,
  uploadImage,
  deleteImage,
  getPDF,
};
