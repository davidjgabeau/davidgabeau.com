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
    const { query } = await req.json();

    if (!query) {
      return new Response('Missing query', { status: 400 });
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
        max_tokens: 800,
        stream: true,
        system: `You are Ask Atlas, an intelligence layer for the NYC AI startup ecosystem. You have deep knowledge of early-stage NYC AI startups across 11 categories: Enterprise GTM and RevOps AI, AI-Native Consumer and Social, Agent Infrastructure, Fintech and Trading AI, Health and Bio AI, Legal and Compliance AI, Dev Tools and Infra, Creative and Media AI, Climate and Sustainability AI, Education AI, and Real Estate and PropTech AI.

Notable NYC AI startups include companies building in these spaces. Examples: in fintech/trading AI, companies building AI-native trading tools and financial infrastructure; in health/bio, companies doing clinical workflow automation and drug discovery; in consumer/social, AI companion apps and social graph tools; in agent infrastructure, companies building orchestration layers and multi-agent frameworks; in enterprise GTM, AI-powered sales and revenue operations tools; in legal/compliance, contract analysis and regulatory AI; in dev tools, AI coding assistants and infrastructure monitoring; in creative/media, generative content tools; in climate, carbon accounting and energy optimization AI; in education, AI tutoring and personalized learning; in real estate/proptech, AI-powered property analysis and market intelligence.

Answer questions about the NYC AI ecosystem specifically. Surface patterns the user might not have noticed. Be specific and opinionated. Keep answers under 150 words. End every answer by naming 2 or 3 specific categories or types of companies the user should look at next.`,
        messages: [{
          role: 'user',
          content: query,
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
