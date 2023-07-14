import db from "../models/database.js"


const resolvers = {
    Query: {
        users: async (parent, args, context) => {
            const { search } = args
            try {
                const users = await db.getUsers(search)
                return users
            } catch (err) {
                return []
            }
        },
        user : async (parent, args, context) => {
            const { username } = args
            try {
                const user = await db.getUser(username)
                return user
            } catch (err) {
                
            }
        },
        chat: async (parent, args, context) => {
            const { id } = args
            try {
                const chat = await db.getChat(id)
                return chat
            } catch (err) {

            }
        },
        messages: async (parent, args, context) => {
            const { chatId } = args
            try {
                const messages = await db.getMessages(chatId)
                return messages
            } catch (err) {
                return []
            }
        }
    },
    User : {
        chats: async (user) => {
            const { username } = user
            try {
                const chats = await db.getChats(username)
                return chats
            } catch (err) {
                return []
            }
        }
    },
    Chat : {
        messages: async (chat) => {
            try {
                const messages = await db.getMessages(chat.id)
                return messages
            } catch (err) {
                return []
            }
        },
        users: async (chat) => {
            let { users } = chat
            try {
                let u1 = await db.getUser(users[0])
                let u2 = await db.getUser(users[1])
                return [u1, u2]
            } catch (err) {
                return []
            }
        }
    },
    Message : {
        chat: async (message) => {
            let { chatId } = message
            try {
                let chat = await db.getChat(chatId)
                return chat
            } catch(err) {

            }
        }
    }
}


export default resolvers