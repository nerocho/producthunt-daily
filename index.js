import dayjs from 'dayjs';
import fs from 'node:fs';

const developer_token = process.env.PRODUCTHUNT_DEVELOPER_TOKEN;

let hotDate = dayjs().subtract(1, 'days').format('YYYY-MM-DD');
let posts = await GetProductHuntDailyHot(hotDate);

fs.writeFileSync(`hot/${hotDate}.json`, JSON.stringify(posts));

async function GetProductHuntDailyHot(d) {
  let url = 'https://api.producthunt.com/v2/api/graphql';

  let headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${developer_token}`,
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
  };

  let cursor = '';
  let query = `
  {
      posts(order: VOTES, postedAfter: "${d}T00:00:00Z", postedBefore: "${d}T23:59:59Z", after: "${cursor}") {
        nodes {
          id
          name
          tagline
          description
          votesCount
          createdAt
          featuredAt
          website
          url
          media {
            url
            type
            videoUrl
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }`;

  let hasNextPage = true;
  let posts = [];
  while (hasNextPage && posts.length < 30) {
    let response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ query: query }),
    });
    let data = await response.json();
    console.log(JSON.stringify(data) + developer_token);
    posts = posts.concat(data.data.posts);

    hasNextPage = data.pageInfo.hasNextPage;
    cursor = data.pageInfo.cursor;
  }

  return posts;
}
