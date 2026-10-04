const { parseHtml } = require('./parser');

test('extracts readable text and removes navigation and scripts', () => {
  const result = parseHtml('<html><head><title>Example</title></head><body><nav>Menu</nav><article>Hello   research</article><script>bad()</script></body></html>', 'https://example.test');
  expect(result.title).toBe('Example');
  expect(result.content).toBe('Hello research');
});
