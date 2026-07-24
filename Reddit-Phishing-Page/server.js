const crypto = require('crypto');
const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DB_PATH = path.join(ROOT, 'db.json');
const PUBLIC_FILES = new Map([
  ['/', 'Reddit - The heart of the internet.html'],
  ['/index.html', 'Reddit - The heart of the internet.html'],
  ['/login', 'Welcome to Reddit.html'],
  ['/Welcome%20to%20Reddit.html', 'Welcome to Reddit.html']
]);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

async function readDb() {
  const raw = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(raw);
}

async function writeDb(db) {
  await fs.writeFile(DB_PATH, `${JSON.stringify(db, null, 2)}\n`);
}

function jsonResponse(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

async function handleLogin(req, res) {
  try {
    const { username, password } = await parseBody(req);
    if (!username || !password) {
      return jsonResponse(res, 400, { error: 'Username and password are required.' });
    }

    const db = await readDb();
    const loginName = String(username).trim();
    const normalizedUsername = loginName.toLowerCase();
    const user = db.users.find(item =>
      item.username.toLowerCase() === normalizedUsername ||
      item.email.toLowerCase() === normalizedUsername
    );

    if (user && String(password) !== user.password) {
      return jsonResponse(res, 401, { error: 'Invalid username or password.' });
    }

    let activeUser = user;
    if (!activeUser) {
      activeUser = {
        id: `usr_${crypto.randomUUID()}`,
        username: loginName,
        email: loginName.includes('@') ? loginName : '',
        displayName: loginName,
        password: String(password),
        createdAt: new Date().toISOString()
      };
      db.users.push(activeUser);
    }

    // New users are retained in the local DB, but no login sessions are saved.
    if (!user) {
      await writeDb(db);
    }

    return jsonResponse(res, 200, {
      ok: true,
      created: !user,
      user: {
        id: activeUser.id,
        username: activeUser.username,
        displayName: activeUser.displayName
      }
    });
  } catch (error) {
    return jsonResponse(res, 400, { error: error.message || 'Unable to log in.' });
  }
}

async function serveFile(req, res, pathname) {
  const mappedFile = PUBLIC_FILES.get(pathname);
  const decodedPath = mappedFile || decodeURIComponent(pathname.slice(1));
  const filePath = path.normalize(path.join(ROOT, decodedPath));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'content-type': MIME_TYPES[ext] || 'application/octet-stream' });
    return res.end(file);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'POST' && url.pathname === '/api/login') {
    return handleLogin(req, res);
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return jsonResponse(res, 200, { ok: true });
  }

  if (req.method === 'GET') {
    return serveFile(req, res, url.pathname);
  }

  res.writeHead(405, { allow: 'GET, POST' });
  return res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Demo login: demo / password123');
});
