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

const sign_up = async function(rest: boolean) {
    const body = ""
    if (!rest) {
        try {
            let response = await fetch(`${root_url}/handle-signup-user`, {
                method: "POST",
                mode: "cors",
                body: JSON.stringify(body),
                //credentials: 'include'
            })
            return response.json()
        } catch (err) {
            return err
        }
    } else {
        try {
            let response = await fetch(`${root_url}/handle-signup-restaurant`, {
                method: "POST",
                mode: "cors",
                body: JSON.stringify(body),
                //credentials: 'include'
            })
            return response.json()
        } catch (err) {
            return err
        }
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

export default {
    handle_login,
    get_user,
    search_users,
    sign_up,
    get_pic,
    get_resume,
    get_chats,
    get_chat,
    get_messages
}
