

var createPost = function(document, post, func) {
	
	var div = document.createElement("div")
	div.style.display = "flex"
	div.onclick = func
	div.style.background = "white"
	div.style.marginLeft = "10vw"
	div.style.width = "max(250px, 50vw)"
	div.style.border = "1px lightgray solid"
	var left = document.createElement("div")
	var img = document.createElement("img")
	img.style.width = "max(8vmin, 40px)"
	img.style.height = "max(8vmin, 40px)"
	img.style.borderRadius = "max(8vmin, 40px)"
	img.style.background = "lightgray"
	img.style.margin = "20 20 20 20"
	img.className = "profilePic"
	left.appendChild(img)
	var right = document.createElement("div")
	div.appendChild(left)
	div.appendChild(right)
	right.style.textAlign = "left"
	var title = document.createElement("a")
	title.innerHTML = "@" + post.username
	title.style.textDecoration = "none"
	title.style.color = "black";
	title.href = "/profile/" + post.username
	var content = document.createElement("p")
	content.innerHTML = post.content
	right.appendChild(title)
	right.appendChild(content)
	
	return div
}