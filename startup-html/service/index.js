const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();

const authCookieName = 'token';
let users = [];
let spots = [];
let chatMessages = [];

const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

const apiRouter = express.Router();
app.use('/api', apiRouter);

apiRouter.post('/auth/create', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const displayName = typeof req.body?.displayName === 'string' ? req.body.displayName.trim() : '';
  const password = req.body?.password;

  if (!email || !username || !displayName || typeof password !== 'string' || !password) {
    res.status(400).send({ msg: 'Email, username, display name, and password are required' });
    return;
  }

  if (await findUser('email', email) || users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    res.status(409).send({ msg: 'Existing user' });
    return;
  }

  const user = await createUser(email, password, username, displayName);
  setAuthCookie(res, user.token);
  res.send(publicUser(user));
});

apiRouter.post('/auth/login', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body?.password;
  const user = await findUser('email', email);
  if (user && typeof password === 'string' && (await bcrypt.compare(password, user.password))) {
    user.token = uuid.v4();
    setAuthCookie(res, user.token);
    res.send(publicUser(user));
    return;
  }

  res.status(401).send({ msg: 'Unauthorized' });
});

apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }

  res.clearCookie(authCookieName);
  res.status(204).end();
});

const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    req.authUser = user;
    next();
    return;
  }

  res.status(401).send({ msg: 'Unauthorized' });
};

apiRouter.get('/spots', verifyAuth, (req, res) => {
  const searchTerm = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const matchingSpots = spots.filter((spot) => (
    `${spot.name} ${spot.details}`.toLowerCase().includes(searchTerm)
  ));
  res.send(matchingSpots);
});

apiRouter.post('/spots', verifyAuth, (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const details = typeof req.body?.details === 'string' ? req.body.details.trim() : '';

  if (!name || !details) {
    res.status(400).send({ msg: 'Spot name and details are required' });
    return;
  }

  if (spots.some((spot) => spot.name.toLowerCase() === name.toLowerCase())) {
    res.status(409).send({ msg: 'A spot with that name already exists' });
    return;
  }

  const spot = { id: uuid.v4(), name, details };
  spots.push(spot);
  res.status(201).send(spot);
});

apiRouter.get('/chat/messages', verifyAuth, (_req, res) => {
  res.send(chatMessages);
});

apiRouter.post('/chat/messages', verifyAuth, (req, res) => {
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';

  if (!text) {
    res.status(400).send({ msg: 'Message text is required' });
    return;
  }

  const message = {
    id: uuid.v4(),
    author: req.authUser.displayName,
    text,
    sentAt: new Date().toISOString(),
  };
  chatMessages.push(message);
  res.status(201).send(message);
});

apiRouter.get('/auth/me', verifyAuth, (req, res) => {
  res.send(publicUser(req.authUser));
});

app.use((err, req, res, next) => {
  res.status(500).send({ type: err.name, message: err.message });
});

app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

async function createUser(email, password, username, displayName) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    email,
    username,
    displayName,
    password: passwordHash,
    token: uuid.v4(),
  };

  users.push(user);
  return user;
}

async function findUser(field, value) {
  if (!value) return null;
  return users.find((u) => u[field] === value);
}

function publicUser(user) {
  return {
    email: user.email,
    username: user.username,
    displayName: user.displayName,
  };
}

function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  });
}

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
