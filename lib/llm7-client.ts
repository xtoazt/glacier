import OpenAI from 'openai';

export class LLM7Client {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: "https://api.llm7.io/v1",
      apiKey: "unused" // Or get it for free at https://token.llm7.io/ for higher rate limits
    });
  }

  async chat(messages: Array<{role: string, content: string}>, model: string = "gpt-4.1-nano-2025-04-14") {
    try {
      // For development, return a mock response if no API key is set
      if (!process.env.LLM7_API_KEY) {
        const lastMessage = messages[messages.length - 1]?.content || '';
        
        let mockResponse = `Hello! I'm Glacier, your AI coding assistant. I can help you with:

• Writing and debugging code
• Explaining programming concepts  
• Creating components and applications
• GitHub repository management

What would you like to work on today?`;

        if (lastMessage.toLowerCase().includes('hello') || lastMessage.toLowerCase().includes('hi')) {
          mockResponse = `Hello! Welcome to Glacier. I'm here to help you with coding tasks. What can I assist you with today?`;
        } else if (lastMessage.toLowerCase().includes('code') || lastMessage.toLowerCase().includes('function')) {
          mockResponse = `I'd be happy to help you with coding! Could you provide more details about what you'd like to build or what specific problem you're trying to solve?`;
        } else if (lastMessage.toLowerCase().includes('github') || lastMessage.toLowerCase().includes('repo')) {
          mockResponse = `I can help you with GitHub operations! You can connect your GitHub account using the GitHub button in the interface. Once connected, I can help you create repositories, manage files, and more.`;
        }

        return {
          success: true,
          content: mockResponse,
          model: model,
          provider: 'llm7'
        };
      }

      const response = await this.client.chat.completions.create({
        model,
        messages: messages as any,
        stream: false
      });

      return {
        success: true,
        content: response.choices[0].message.content,
        model: model,
        provider: 'llm7'
      };
    } catch (error) {
      console.error('LLM7 API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'llm7'
      };
    }
  }

  async getModels() {
    try {
      const response = await this.client.models.list();
      return {
        success: true,
        models: response.data.map(model => ({
          id: model.id,
          name: model.id
        }))
      };
    } catch (error) {
      console.error('LLM7 Models Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
