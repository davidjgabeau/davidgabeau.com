export const config = { runtime: 'edge' };

const QUERY = `
  query($from: DateTime!, $to: DateTime!) {
    viewer {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              weekday
            }
          }
        }
      }
    }
  }
`;

export default async function handler(req) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: 'GITHUB_TOKEN not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'davidgabeau.com',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: {
          from: oneYearAgo.toISOString(),
          to: now.toISOString(),
        },
      }),
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `GitHub API error: ${res.status}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();

    if (data.errors) {
      return new Response(JSON.stringify({ error: data.errors[0]?.message ?? 'GraphQL error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const calendar = data.data?.viewer?.contributionsCollection?.contributionCalendar;
    if (!calendar) {
      return new Response(JSON.stringify({ error: 'No calendar data' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(calendar), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
