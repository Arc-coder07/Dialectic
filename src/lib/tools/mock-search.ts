import { Tool, ToolResult } from './registry';

export const mockSearchTool: Tool = {
  id: 'web_search',
  name: 'Web Search (Mock)',
  description: 'Mock web search returning deterministic results',
  async execute(query: string): Promise<ToolResult[]> {
    await new Promise(r => setTimeout(r, 500)); // Simulate latency
    
    return [
      {
        title: `Market Analysis: ${query.slice(0, 50)}`,
        content: `According to industry reports, the market for solutions addressing "${query.slice(0, 30)}" is projected to grow at 15-20% CAGR through 2028. However, customer acquisition costs in this segment remain elevated at 2-3x the industry average.`,
        url: 'https://example.com/market-report',
        publishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        sourceType: 'aggregator',
      },
      {
        title: `Academic Review: ${query.slice(0, 40)}`,
        content: `A comprehensive meta-analysis suggests that approaches similar to "${query.slice(0, 30)}" yield statistically significant improvements in operational efficiency, though long-term sustainability requires further study.`,
        url: 'https://scholar.example.edu/paper/123',
        publishedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        sourceType: 'academic',
      },
      {
        title: `Industry Opinion: The reality of ${query.slice(0, 30)}`,
        content: `While many tout the benefits of this approach, practical implementation often falls short. The hidden technical debt and integration challenges make it less viable for mid-sized organizations.`,
        url: 'https://blog.example.com/opinion-piece',
        publishedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        sourceType: 'opinion',
      }
    ];
  }
};
