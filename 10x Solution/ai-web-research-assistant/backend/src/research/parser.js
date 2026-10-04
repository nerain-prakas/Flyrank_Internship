const cheerio = require('cheerio');

function parseHtml(html, url) {
  const $ = cheerio.load(html);
  $('script, style, nav, footer, header, aside, form, noscript').remove();
  const title = $('title').first().text().trim() || url;
  const content = $('main, article, body').first().text().replace(/\s+/g, ' ').trim();
  return { title: title.slice(0, 500), content: content.slice(0, 12000) };
}

module.exports = { parseHtml };
