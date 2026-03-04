import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

interface ComponentRequest {
  component: 'config' | 'page' | 'fixture' | 'test' | 'util';
  name: string;
  requirements: string;
}

async function generateTypeScriptComponent(request: ComponentRequest): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not set. Create a .env file based on .env.example and add your key.'
    );
  }

  const openai = new OpenAI({ apiKey });

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

  let response;
  try {
    response = await openai.chat.completions.create({
      model: 'gpt-4',
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
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API error (${error.status}): ${error.message}`);
    }
    throw new Error(`Network error while calling OpenAI: ${(error as Error).message}`);
  }

  const content = response.choices[0].message?.content;
  if (!content) {
    throw new Error('OpenAI returned an empty response.');
  }

  return content;
}

const componentDirs: Record<ComponentRequest['component'], string> = {
  config: 'src/config',
  page: 'src/pages',
  fixture: 'src/fixtures',
  test: 'src/tests',
  util: 'src/utils',
};

async function main() {
  const request: ComponentRequest = {
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

  try {
    const code = await generateTypeScriptComponent(request);
    const dir = componentDirs[request.component];
    const filePath = path.join(dir, `${request.name.toLowerCase()}.ts`);

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, code);
    console.log(`Component generated: ${filePath}`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();
