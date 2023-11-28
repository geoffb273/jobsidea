
export interface Chat {
    created: string,
    lastAccessed: string,
    id: string,
    unread: string,
    users: [{username: string}, {username: string}]
}