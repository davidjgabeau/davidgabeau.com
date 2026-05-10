export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { startup, building, stack } = await req.json();

    if (!startup || !building || !stack) {
      return new Response('Missing required fields', { status: 400 });
    }

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        stream: true,
        system: `You are a Claude Evangelist at Anthropic helping a startup founder get started with the Claude API. Given their startup name, what they are building, and their current stack, generate a specific and practical getting-started guide. Include: which Claude model to use and why, how to structure their first API call with a short code example in their stack's language, one specific use case to build first, and three things to watch out for in production. Be direct, specific, and technical. No generic advice. No filler. Write like a senior engineer who has shipped this, not like a document.`,
        messages: [{
          role: 'user',
          content: `Startup: ${startup}\nBuilding: ${building}\nStack: ${stack}`,
        }],
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      return new Response(`API error: ${err}`, { status: upstream.status });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const readable = new ReadableStream({
      async start(controller) {
        const reader = upstream.body.getReader();
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const json = JSON.parse(data);
                if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
                  controller.enqueue(encoder.encode(json.delta.text));
                }
              } catch {}
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
