class Chat {
  private messages: string[] = [];

  addMessage = (message: string) => {
    this.messages.push(message);
  };

  get message() {
    return this.messages;
  }
}

export default Chat;
