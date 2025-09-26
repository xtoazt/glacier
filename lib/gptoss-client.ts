import OpenAI from 'openai';

export class GPTOSSClient {
  private client: OpenAI;
  private baseURL: string;

  constructor() {
    this.baseURL = "https://geepeetee.mynameisrohanandthisismyemail.workers.dev/v1";
    this.client = new OpenAI({
      baseURL: this.baseURL,
      apiKey: "dummy" // GPT-OSS doesn't require real API key
    });
  }

  async chat(messages: Array<{role: string, content: string}>, model: string = "gpt-oss-20b", reasoningEffort: string = "medium") {
    try {
      // Use fetch directly for GPT-OSS to handle metadata properly
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Reasoning-Effort': reasoningEffort
        },
        body: JSON.stringify({
          model,
          messages: messages as any,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        content: data.choices[0].message.content,
        model: model,
        provider: 'gpt-oss'
      };
    } catch (error) {
      console.error('GPT-OSS API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'gpt-oss'
      };
    }
  }

  async getModels() {
    try {
      const response = await fetch(`${this.baseURL}/models`);
      const data = await response.json();
      
      return {
        success: true,
        models: data.data.map((model: any) => ({
          id: model.id,
          name: model.id
        }))
      };
    } catch (error) {
      console.error('GPT-OSS Models Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
