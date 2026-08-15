import { toolRegistry } from './registry';
import { webSearchTool } from './web-search';
import { mockSearchTool } from './mock-search';

export function initializeTools(): void {
  if (process.env.MOCK_MODE === 'true' || !process.env.TAVILY_API_KEY) {
    toolRegistry.register(mockSearchTool);
  } else {
    toolRegistry.register(webSearchTool);
  }
}
