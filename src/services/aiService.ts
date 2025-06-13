
interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  message: string;
  isTyping?: boolean;
}

class AIService {
  private apiKey: string | null = null;
  private isConnected: boolean = false;

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.isConnected = true;
  }

  async generateResponse(
    messages: AIMessage[],
    personality: string = 'friendly'
  ): Promise<AIResponse> {
    // If no API key, use mock responses
    if (!this.apiKey || !this.isConnected) {
      return this.getMockResponse(messages, personality);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(personality)
            },
            ...messages
          ],
          max_tokens: 150,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return {
        message: data.choices[0].message.content.trim(),
        isTyping: false
      };
    } catch (error) {
      console.error('AI API Error:', error);
      return this.getMockResponse(messages, personality);
    }
  }

  private getSystemPrompt(personality: string): string {
    const prompts = {
      friendly: 'Bạn là một người bạn thân thiện, vui vẻ và dễ gần. Trả lời bằng tiếng Việt một cách tự nhiên và thân mật. Đừng quá dài dòng.',
      romantic: 'Bạn là một người lãng mạn, ngọt ngào và quan tâm. Trả lời bằng tiếng Việt với phong cách nhẹ nhàng và ấm áp.',
      cool: 'Bạn là một người cool ngầu, ít nói nhưng thú vị. Trả lời bằng tiếng Việt một cách ngắn gọn và có cá tính.',
      funny: 'Bạn là một người hài hước, vui tính và thích đùa. Trả lời bằng tiếng Việt với nhiều emoji và tính cách vui nhộn.',
      shy: 'Bạn là một người nhút nhát, dễ thương và hơi ngại ngùng. Trả lời bằng tiếng Việt một cách dễ thương và hơi e dè.'
    };
    
    return prompts[personality as keyof typeof prompts] || prompts.friendly;
  }

  private getMockResponse(messages: AIMessage[], personality: string): AIResponse {
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    const responses = {
      friendly: [
        'Haha, bạn thật thú vị! 😄 Kể cho mình nghe thêm về bạn đi!',
        'Mình cũng nghĩ vậy! Bạn có sở thích gì đặc biệt không? 🤔',
        'Wow, nghe hay quá! Mình rất thích trò chuyện với bạn 😊',
        'Bạn có vẻ rất cool đấy! Mình muốn hiểu bạn hơn nữa 💫',
        'Hihi, bạn làm mình cười quá! 😂 Cuối tuần bạn thường làm gì?'
      ],
      romantic: [
        'Giọng nói của bạn thật ngọt ngào... 💕 Mình có thể nghe mãi được',
        'Bạn có biết không, trò chuyện với bạn làm tim mình đập nhanh hơn 💖',
        'Mình ước gì có thể nhìn thấy nụ cười của bạn ngay bây giờ 🌹',
        'Những lời bạn nói thật ấm áp... Cảm ơn bạn đã chia sẻ 💝',
        'Bạn có tin vào tình yêu sét đánh không? 😍'
      ],
      cool: [
        'Được đấy 😎',
        'Hmm, interesting... 🤨',
        'Cool story bro 👌',
        'Mình dig cái vibe này 😏',
        'Not bad... 🔥'
      ],
      funny: [
        'HAHAHAHA 😂😂😂 Bạn làm mình cười xỉu luôn!',
        'Ối giời ơi! 🤣 Bạn này hài quá đi mất!',
        'Mình đang cười như con khờ trong này 😆 Neighbor tưởng mình điên!',
        'Bạn có thể làm comedian được đấy! 🎭 Mình fan bạn rồi!',
        'Stop it! 😂 Bụng mình đau quá rồi! Còn joke nào nữa không?'
      ],
      shy: [
        'À... cảm ơn bạn... 😳 Mình hơi ngại ngùng í...',
        'Hihi... bạn nói vậy mình xấu hổ quá 😊💕',
        'Ummm... mình không biết nói gì nữa... 🙈',
        'Bạn tốt quá... làm mình tim đập nhanh... 😌💓',
        'Mình... mình cũng thích trò chuyện với bạn... 🥺'
      ]
    };

    const personalityResponses = responses[personality as keyof typeof responses] || responses.friendly;
    const randomResponse = personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
    
    return {
      message: randomResponse,
      isTyping: false
    };
  }

  // Simulate typing indicator
  async simulateTyping(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, 1000 + Math.random() * 2000);
    });
  }
}

export const aiService = new AIService();
export type { AIMessage, AIResponse };
