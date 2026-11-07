// Startup file for cPanel → "Setup Node.js App" (Phusion Passenger).
// Passenger hands this process its own port/socket, so we just start Next.js in production mode.
const http = require('http');
const next = require('next');

process.env.NODE_ENV = 'production';

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => handle(req, res))
      .listen(process.env.PORT || 3000, () => console.log('Next.js is ready'));
  })
  .catch((err) => {
    console.error('Failed to start Next.js. Did you run the "build" script first?', err);
    process.exit(1);
  });
