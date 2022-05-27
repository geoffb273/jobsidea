

var createPost = function(document, post) {
	var postEl = document.createElement("li")
	var title = document.createElement("p")
	title.innerHTML = post.username
	var content = document.createElement("p")
	content.innerHTML = post.content
	postEl.appendChild(title)
	postEl.appendChild(content)
	
	return postEl
}