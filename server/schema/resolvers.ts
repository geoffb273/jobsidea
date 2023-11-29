import crypto from 'crypto';

import {
  getChat,
  getChats,
  getMessages,
  getProfilePic,
  getResume,
  getUser,
  getUsers,
  putMessage,
} from '../models/database';

const resolvers = {
  Query: {
    login: async (
      _parent: never,
      { username, password }: { username: string; password: string },
    ) => {
      const user = await getUser(username);
      if (
        user &&
        user.password ===
          crypto.createHash('sha256').update(password).digest('hex')
      ) {
        return user;
      }
    },
    users: (_parent: never, { search }: { search: string }) => {
      return getUsers(search);
    },
    user: (_parent: never, { username }: { username: string }) => {
      return getUser(username);
    },
    chat: (_parent: never, { id }: { id: string }) => {
      return getChat(id);
    },
    messages: (_parent: never, { chatId }: { chatId: string }) => {
      return getMessages(chatId);
    },
  },
  User: {
    chats: ({ username }: { username: string }) => {
      return getChats(username);
    },
    pic: ({ pic }: { pic?: string | null }) => {
      if (pic != null) {
        return getProfilePic(pic);
      }
      return null;
    },
    resume: ({ resume }: { resume?: string | null }) => {
      if (resume != null) {
        return getResume(resume);
      }
      return '';
    },
  },
  Mutation: {
    message: async (
      _parent: never,
      {
        content,
        author,
        chatId,
      }: { content: string; author: string; chatId: string },
    ) => {
      return putMessage(chatId, author, content);
    },
  },
  Chat: {
    messages: ({ id }: { id: string }) => {
      return getMessages(id);
    },
    users: async ({ users }: { users: string[] }) => {
      const u1 = await getUser(users[0]);
      const u2 = await getUser(users[1]);
      return [u1, u2];
    },
  },
  Message: {
    chat: ({ chatId }: { chatId: string }) => {
      return getChat(chatId);
    },
  },
};

export default resolvers;
