

var createPost = function(document, post, func) {
	
	var div = document.createElement("div")
	div.style.display = "flex"
	div.style.paddingTop = '10px'
	div.onclick = () => func(post.id)
	div.style.background = "radial-gradient(#cedde9, #81A8C6)"
	div.style.marginLeft = "5vw"
	div.style.width = "max(400px, 60vw)"
	div.style.border = "1px #38698E solid"
	var left = document.createElement("div")
	//left.style.width = "max(8vw, 40px)"
	var img = document.createElement("div")
	img.style.width = "max(8vmin, 40px)"
	img.style.height = "max(8vmin, 40px)"
	img.style.borderRadius = "max(8vmin, 40px)"
	img.style.margin = "20 20 20 20"
	img.className = "profilePic"
	img.innerHTML = "<a href='/profile/" + post.username 
		+ "' style='color:black'><i class='fa-solid fa-user fa-2xl' style='margin-top: 10px'></i></a>"
	left.appendChild(img)
	$.get("/user-pic/" + post.username, function(data) {
		if (data) {
			img.innerHTML = "<a href='/profile/" + post.username 
				+ "'><img class='postProfPic' style='width:max(8vmin, 40px);height:max(8vmin, 40px);border-radius:max(8vmin, 40px)' src='" + data + "''></img></a>"
			
		}
	})
	div.appendChild(left)
	
	var center = document.createElement("div")
	center.style.width = "30vw"
	div.appendChild(center)
	center.style.textAlign = "left"
	var title = document.createElement("a")
	title.innerHTML = "<b>" + post.name + "</b> <i style='color:gray;'>@" + post.username + "</i>"
	title.style.textDecoration = "none"
	title.style.color = "black";
	title.href = "/profile/" + post.username
	var content = document.createElement("p")
	content.innerHTML = post.content
	center.appendChild(title)
	center.appendChild(content)
	
	var right = document.createElement("div")
	right.style.width = "22vw"
	right.style.fontSize = "12px"
	right.style.marginRight = "1vw"
	var date = (Date.now() - new Date(post.created)) / 1000
	var dateString = Math.round(date + 1) + " seconds ago"
	if (date >= 59 && date < 60 * 60) {
		dateString = Math.round(date / 60) + " minutes ago"
	} else if (date >= 60 * 60 && date < 60 * 60 * 24) {
		dateString = Math.round(date / (60 * 60)) + " hours ago"
	} else if (date >= 60 * 60 * 24 && date < 60 * 60 * 24 * (365 + 0.25)) {
		dateString = Math.round(date / (60 * 60 * 24)) + " days ago"
	} else if (date >= 60 * 60 * 24 * (365 + 0.25)) {
		dateString = Math.round(date / (60 * 60 * 24 * (365 + 0.25))) + " years ago"
	}
	var d = document.createElement("p")
	d.innerHTML = dateString
	right.style.textAlign = "right"
	var maxWidth = function(x) {
		if (x.matches) {
			div.style.width = "98vw"
			div.style.marginLeft = "1vw"
			center.style.width = "47vw"
			right.style.width = "34vw"
		} else {
			div.style.width = "max(400px, 60vw)"
			div.style.marginLeft = "5vw"
			center.style.width = "30vw"
			right.style.width = "22vw"
		}
	}
	var x = window.matchMedia("only screen and (max-width: 700px)")
	maxWidth(x)
	x.addListener(maxWidth)
	right.appendChild(d)
	div.appendChild(right)
	
	return div
}