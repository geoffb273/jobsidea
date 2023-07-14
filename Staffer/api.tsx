

const root_url = "http://localhost:8000"

const handle_login = async function(username: string, password: string) {
    let body = {username: username, password: password}
    try {
        let response = await fetch(`${root_url}/handle-login`, {
            method: "POST",
            mode: "cors",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
            }
            //credentials: 'include'
        })
        return await response.json()
    } catch (err) {
        console.log(err)
        return ""
    }
    
}

type U = {
    username: string, 
    password: string, 
    firstname: string, 
    lastname: string, 
    phone: string, 
    email: string,
    zipCode: string
}

const post_user = async function(user: U) {
    try {
        let response = await fetch(`${root_url}/handle-signup-user`, {
            method: "POST",
            mode: "cors",
            body: JSON.stringify(user),
            headers: {
                "Content-Type": "application/json",
            }
            //credentials: 'include'
        })
        return await response.json()
    } catch (err) {
        console.log(err)
        return ""
    }
}

const get_user = async function(username: string) {
    try {
        let response = await fetch(`${root_url}/profile/${username}`, {
            method: "GET",
            mode: "cors",
            //credentials: 'include'
        })
        return response.json()
    } catch (err) {
        return err
    }
    
}

const get_users = async function(zipCode: string, offset: number, limit: number) {
    try {
        let response = await fetch(`${root_url}/users?zipCode=${zipCode}&offset=${offset}&limit=${limit}`, {
            method: "GET",
            mode: "cors",
            //credentials: 'include'
        })
        
        return response.json()
    } catch (err) {
        return err
    }
}

const search_users = async function(query: string) {
    try {
        let response = await fetch(`${root_url}/search-users/${query}`, {
            method: "GET",
            mode: "cors",
            //credentials: 'include'
        })
        return response.json()
    } catch (err) {
        return err
    }
}


const get_pic = async function(username: string) {
    try {
        let response = await fetch(`${root_url}/user-pic/${username}`, {
            method: "GET",
            mode: "cors",
        })
        return await response.text()
    } catch(err) {
        console.log(err)
        return ""
    }
}

const get_resume = async function(username: string) {
    try {
        let response = await fetch(`${root_url}/resume/${username}`, {
            method: "GET",
            mode: "cors",
        })
        return await response.text()
    } catch(err) {
        console.log(err)
        return ""
    }
}

const get_chats = async function(username: string) {
    try {
        let response = await fetch(`${root_url}/chats/${username}`, {
            method: "GET",
            mode: "cors",
        })
        return await response.json()
    } catch(err) {
        console.log(err)
        return ""
    }
}

const get_chat = async function(chatId: string) {
    try {
        let response = await fetch(`${root_url}/chat/${chatId}`, {
            method: "GET",
            mode: "cors",
        })
        return await response.json()
    } catch(err) {
        console.log(err)
        return ""
    }
}

const get_messages = async function(username: string, chatId: string) {
    try {
        let response = await fetch(`${root_url}/messages/${chatId}`, {
            method: "GET",
            mode: "cors",
        })
        return await response.json()
    } catch(err) {
        console.log(err)
        return ""
    }
}

const post_message = async function(message: {chatId:string, content: string, author: string}) {
    try {
        let response = await fetch(`${root_url}/handle-message`, {
            method: "POST",
            mode: "cors",
            body: JSON.stringify(message),
            headers: {
                "Content-Type": "application/json",
            }
            //credentials: 'include'
        })
        return await response.json()
    } catch(err) {
        console.log(err)
        return ""
    }
}

export default {
    handle_login,
    get_user,
    get_users,
    search_users,
    post_user,
    get_pic,
    get_resume,
    get_chats,
    get_chat,
    get_messages,
    post_message
}
