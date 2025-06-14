
export interface FakeUser {
  id: string;
  name: string;
  avatar: string;
  gender: 'male' | 'female';
  age: number;
  bio: string;
  aiPrompt: string;
  isActive: boolean;
}

export interface AIPrompt {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
}
