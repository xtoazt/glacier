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
