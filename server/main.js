import http from 'http';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('OK');
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end("🚀 YODHEHFOX server running on Render");
});

server.listen(PORT, () => {
  console.log(`🚀 YODHEHFOX started at port ${PORT}`);
});
