import express from 'express';

const app = express();

app.get('/', (_req, res) => {
  console.info('Hello world received a request.');

  const target = process.env.TARGET || 'World';
  res.send(`Hello ${target}!\n`);
});

const port = process.env.PORT || 8079;
app.listen(port, () => {
  console.info('Hello world listening on port', port);
});
