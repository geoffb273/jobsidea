

var postItem = async function(database, collection, obj) {
	console.log(database)
	if (database[collection]) {
		database[collection].push(obj)
	} else {
		database[collection] = [obj]
	}
	console.log("Post")
	console.log(database)
	return ""
}

var getItem = async function(database, collection, find) {
	console.log(database)
	if (database[collection]) {
		let items = database[collection]
		for (let i = 0; i < items.length; i++) {
			let tracker = 0
			let item = items[i]
			for (let key in find) {
				if (item[key] && item[key] == find[key]) {
					tracker += 1
				}
			}
			if (tracker == find.length - 1) {
				return item
			}
		}
	}
	console.log(collection)
	console.log("Attempt")
	return
}

var getList = async function(database, collection, find, sort, limit = 0) {
	if (database[collection]) {
		let items = database[collection]
		let possibles = []
		for (let i = 0; i < items.length; i++) {
			let tracker = 0
			let item = items[i]
			for (let key in find) {
				if (item[key] && item[key] == find[key]) {
					tracker += 1
				} else {
					break
				}
			}
			if (tracker == find.length - 1) {
				possibles.push(item)
			}
		}
		possibles.sort((a, b) => {
			for (let key in sort) {
				if (a[key] && b[key]) {
					if (a[key] > b[key]) {
						return sort[key] == -1
					} else if(a[key] < b[key]) {
						return sort[key] == 1
					}
				} else if (a[key]) {
					return true
				} else {
					return false
				}
			}
			return true
		})
		if (limit <= 0) {
			return possibles
		} 
		limited = []
		for (let i = 0; i < limit && i < possibles.length; i++) {
			limited[i] = possibles[i]
		}
		return limited
	}
}

var replaceItem = async function(database, collection, find, obj) {
	
	if (database[collection]) {
		let items = database[collection]
		for (let i = 0; i < items.length; i++) {
			let tracker = 0
			let item = items[i]
			for (let key in find) {
				if (item[key] && item[key] == find[key]) {
					tracker += 1
				}
			}
			if (tracker == find.length - 1) {
				items[i] = obj
				return ""
			}
		}
		items.push(obj)
	} else {
		database[collection] = [obj]
	}
	return ""
}

var updateItem = async function(database, collection, find, obj) {
	if (database[collection]) {
		let items = database[collection]
		for (let i = 0; i < items.length; i++) {
			let tracker = 0
			let item = items[i]
			for (let key in find) {
				if (item[key] && item[key] == find[key]) {
					tracker += 1
				}
			}
			if (tracker == find.length - 1) {
				items[i] = obj
				return ""
			}
		}
	}
}

var deleteItem = async function(database, collection, find) {
	if (database[collection]) {
		let items = database[collection]
		for (let i = 0; i < items.length; i++) {
			let tracker = 0
			let item = items[i]
			for (let key in find) {
				if (item[key] && item[key] == find[key]) {
					tracker += 1
				}
			}
			if (tracker == find.length - 1) {
				items.remove(i)
				return ""
			}
		}
	}
}

var getImage = function(path, id) {
	return ""
}

var uploadImage = function(path, id, file, metadata = {}) {
	return ""
}

var deleteImage = function(path, id) {
	return ""
}

var getPDF = function(path, id) {
	return ""
}

module.exports = {
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