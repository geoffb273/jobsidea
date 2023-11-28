import {getChat, getChats, getMessages, getProfilePic, getResume, getUser, getUsers, putMessage} from "../models/database"
import crypto from "crypto"

const resolvers = {
    Query: {
        login: async(_parent: never, {username, password}: {username: string; password: string}) => {
            try {
                let user = await getUser(username)
                if (user && user.password == crypto.createHash('sha256').update(password).digest('hex')) {
                    return user
                }
            } catch(err) {

            }
        },
        users: async (_parent: never, {search}: {search: string}) => {
            try {
                return getUsers(search)
            } catch (err) {
                return []
            }
        },
        user : async (_parent: never, {username}: {username: string}) => {
            try {
                return getUser(username)
            } catch (err) {
                
            }
        },
        chat: async (_parent: never, {id}: {id: string}) => {
            try {
                return getChat(id)
            } catch (err) {

            }
        },
        messages: async (_parent: never, {chatId}: {chatId: string}) => {

            try {
                return getMessages(chatId)
            } catch (err) {
                return []
            }
        }
    },
    User : {
        chats: async ({username}: {username: string}) => {
            try {
                return getChats(username)
            } catch (err) {
                return []
            }
        },
        pic: async ({pic}: {pic?: string |  null}) => {
            if (pic != null) {
                try {
                    return getProfilePic(pic)
                } catch (err) {

                }
            }
            return ""
        },
        resume: async({resume}: {resume?: string |  null}) => {
            if (resume) {
                try {
                    return getResume(resume)
                } catch (err) {

                }
            }
            return ""
        }
    },
    Mutation: {
        message: async(_parent: never, { content, author, chatId }: {content: string; author: string; chatId: string}) => {
            return putMessage(chatId, author, content)
        }
    },
    Chat : {
        messages: async ({id}: {id: string}) => {
            try {
                return getMessages(id)
            } catch (err) {
                return []
            }
        },
        users: async ({users}: {users: string[]}) => {

            try {
                let u1 = await getUser(users[0])
                let u2 = await getUser(users[1])
                return [u1, u2]
            } catch (err) {
                return []
            }
        }
    },
    Message : {
        chat: async ({chatId}: {chatId: string}) => {
            try {
                return getChat(chatId)
            } catch(err) {

            }
        }
    }
}


export default resolvers