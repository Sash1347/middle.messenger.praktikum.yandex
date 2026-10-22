export interface ChatMessage {
  text: string;
  direction: 'outgoing' | 'incoming';
}

class ChatModel {
  private messages: ChatMessage[] = Array.from({ length: 25 }, (_, index) => ({
    text: `Message ${index + 1}`,
    direction: index % 2 === 0 ? 'outgoing' : 'incoming',
  }));

  getMessages(): ChatMessage[] {
    return this.messages.map((message) => ({ ...message }));
  }

  addMessage(text: string): void {
    if (!/\S/.test(text)) throw new Error('Message must not be empty');
    this.messages = [...this.messages, { text, direction: 'outgoing' }];
  }
}

export const chatModel = new ChatModel();
