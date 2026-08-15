export interface ToolResult {
  title: string;
  content: string;
  url: string;
  publishedDate?: string;
  sourceType: 'primary' | 'aggregator' | 'opinion' | 'calculation' | 'user_input' | 'academic';
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  execute: (query: string) => Promise<ToolResult[]>;
}

export class ToolRegistry {
  private tools = new Map<string, Tool>();
  
  register(tool: Tool): void {
    this.tools.set(tool.id, tool);
  }
  
  get(id: string): Tool | undefined {
    return this.tools.get(id);
  }
  
  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }
  
  getForAgent(toolIds: string[]): Tool[] {
    return toolIds.map(id => this.tools.get(id)).filter((t): t is Tool => t !== undefined);
  }
}

export const toolRegistry = new ToolRegistry();
