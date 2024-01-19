export type ChatRoomIdType = {
    id: string
}

export type ReceiveMessageType = {
    roomId: string
    senderName: string
    message: string
}

export type MessageType = {
    senderId: string
    message : string
}