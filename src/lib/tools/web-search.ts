import { Tool, ToolResult } from './registry';
import { tavily } from '@tavily/core';

export const webSearchTool: Tool = {
  id: 'web_search',
  name: 'Web Search',
  description: 'Search the web for evidence using Tavily',
  async execute(query: string): Promise<ToolResult[]> {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      console.warn('TAVILY_API_KEY not set, returning empty results');
      return [];
    }
    
    const tvly = tavily({ apiKey });
    const response = await tvly.search(query, {
      searchDepth: 'basic',
      maxResults: 5,
    });
    
    return response.results.map(r => ({
      title: r.title,
      content: r.content,
      url: r.url,
      publishedDate: r.publishedDate,
      sourceType: classifySource(r.url)
    }));
  }
};

function classifySource(url: string): 'primary' | 'aggregator' | 'opinion' | 'calculation' | 'user_input' | 'academic' {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('.gov') || urlLower.includes('.edu')) {
    return 'primary';
  }
  if (urlLower.includes('arxiv.org') || urlLower.includes('scholar.google')) {
    return 'academic';
  }
  if (urlLower.includes('medium.com') || urlLower.includes('substack.com') || urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return 'opinion';
  }
  if (urlLower.includes('techcrunch.com') || urlLower.includes('reuters.com') || urlLower.includes('bloomberg.com')) {
    return 'aggregator';
  }
  
  return 'aggregator';
}
