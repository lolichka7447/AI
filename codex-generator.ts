import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ComponentRequest {
  component: 'config' | 'page' | 'fixture' | 'test' | 'util';
  name: string;
  requirements: string;
}

async function generateTypeScriptComponent(request: ComponentRequest): Promise<string> {
  const prompt = `
Generate COMPLETE TypeScript code for Playwright automation framework.
Component type: ${request.component}
Component name: ${request.name}
Requirements: ${request.requirements}

IMPORTANT RULES:
1. Use TypeScript with strict typing
2. Export classes/interfaces/functions
3. Include proper imports
4. Add JSDoc comments
5. Follow Playwright best practices
6. Include error handling
7. Make it production-ready

Return ONLY the TypeScript code, no explanations.
`;

  const response = await openai.createChatCompletion({
    model: 'gpt-4', // Используйте актуальную модель
    messages: [
      {
        role: 'system',
        content: 'You are a TypeScript and Playwright expert. Generate clean, type-safe code.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.1,
    max_tokens: 2000,
  });

  return response.data.choices[0].message?.content || '';
}

// Пример генерации конфигурации
const configPrompt: ComponentRequest = {
  component: 'config',
  name: 'EnvironmentConfig',
  requirements: `Manage multiple environments (dev, staging, prod).
  - Load from .env files
  - Type-safe environment variables
  - Browser configurations per env
  - Timeout settings
  - Base URLs
  - Reporting options`,
};

generateTypeScriptComponent(configPrompt).then((code) => {
  fs.writeFileSync('src/config/environment.config.ts', code);
  console.log('Config generated!');
});
