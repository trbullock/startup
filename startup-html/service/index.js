const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();

const authCookieName = 'token';
const userIdentityCollation = { locale: 'en', strength: 2 };
let userCollection;
let popularSpotsCollection;
let chatMessagesCollection;

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

  const existingUsername = await userCollection.findOne(
    { username },
    { collation: userIdentityCollation },
  );
  if (await findUser('email', email) || existingUsername) {
    res.status(409).send({ msg: 'Existing user' });
    return;
  }

  let user;
  try {
    user = await createUser(email, password, username, displayName);
  } catch (error) {
    if (error instanceof Error && error.code === 11000) {
      res.status(409).send({ msg: 'Existing user' });
      return;
    }
    throw error;
  }
  setAuthCookie(res, user.token);
  res.send(publicUser(user));
});

apiRouter.post('/auth/login', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body?.password;
  const user = await findUser('email', email);
  if (user && typeof password === 'string' && (await bcrypt.compare(password, user.password))) {
    user.token = uuid.v4();
    await userCollection.updateOne({ _id: user._id }, { $set: { token: user.token } });
    setAuthCookie(res, user.token);
    res.send(publicUser(user));
    return;
  }

  res.status(401).send({ msg: 'Unauthorized' });
});

apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    await userCollection.updateOne({ _id: user._id }, { $unset: { token: '' } });
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

apiRouter.get('/spots', verifyAuth, async (req, res) => {
  const searchTerm = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matchingSpots = await popularSpotsCollection.find(
    {
      $or: [
        { name: { $regex: escapedSearchTerm, $options: 'i' } },
        { details: { $regex: escapedSearchTerm, $options: 'i' } },
      ],
    },
    { projection: { _id: 0 } },
  ).toArray();
  res.send(matchingSpots);
});

apiRouter.post('/spots', verifyAuth, async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const details = typeof req.body?.details === 'string' ? req.body.details.trim() : '';

  if (!name || !details) {
    res.status(400).send({ msg: 'Spot name and details are required' });
    return;
  }

  const existingSpot = await popularSpotsCollection.findOne(
    { name },
    { collation: { locale: 'en', strength: 2 } },
  );
  if (existingSpot) {
    res.status(409).send({ msg: 'A spot with that name already exists' });
    return;
  }

  const spot = { id: uuid.v4(), name, details };
  await popularSpotsCollection.insertOne({ ...spot });
  res.status(201).send(spot);
});

apiRouter.get('/chat/messages', verifyAuth, async (_req, res) => {
  const messages = await chatMessagesCollection.find(
    {},
    { projection: { _id: 0 } },
  ).sort({ _id: 1 }).toArray();
  res.send(messages);
});

apiRouter.post('/chat/messages', verifyAuth, async (req, res) => {
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
  await chatMessagesCollection.insertOne({ ...message });
  res.status(201).send(message);
});

apiRouter.get('/weather', verifyAuth, async (req, res, next) => {
  const location = typeof req.query.location === 'string' ? req.query.location.trim() : '';
  if (!location) {
    res.status(400).send({ msg: 'Enter a city or ZIP code' });
    return;
  }

  try {
    const geocodingUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
    geocodingUrl.searchParams.set('name', location);
    geocodingUrl.searchParams.set('count', '1');
    geocodingUrl.searchParams.set('language', 'en');
    geocodingUrl.searchParams.set('format', 'json');

    const geocodingResponse = await fetch(geocodingUrl);
    if (!geocodingResponse.ok) {
      res.status(502).send({ msg: 'The location lookup service is unavailable.' });
      return;
    }

    const geocodingData = await geocodingResponse.json();
    const result = geocodingData.results?.[0];
    if (!result) {
      res.status(404).send({ msg: 'No matching location was found.' });
      return;
    }

    const pointsUrl = `https://api.weather.gov/points/${result.latitude},${result.longitude}`;
    const pointsResponse = await fetch(pointsUrl, {
      headers: { 'User-Agent': 'FishTracker/1.0 (weather forecast feature)' },
    });
    if (!pointsResponse.ok) {
      res.status(502).send({ msg: 'Weather.gov could not provide a forecast for that location.' });
      return;
    }

    const pointsData = await pointsResponse.json();
    const forecastUrl = pointsData.properties?.forecast;
    if (!forecastUrl) {
      res.status(502).send({ msg: 'Weather.gov did not return a forecast for that location.' });
      return;
    }
    if (new URL(forecastUrl).origin !== 'https://api.weather.gov') {
      res.status(502).send({ msg: 'Weather.gov returned an invalid forecast URL.' });
      return;
    }

    const forecastResponse = await fetch(forecastUrl, {
      headers: { 'User-Agent': 'FishTracker/1.0 (weather forecast feature)' },
    });
    if (!forecastResponse.ok) {
      res.status(502).send({ msg: 'The forecast service is unavailable.' });
      return;
    }

    const forecastData = await forecastResponse.json();
    res.send({
      location: [result.name, result.admin1, result.country].filter(Boolean).join(', '),
      periods: (forecastData.properties?.periods || []).slice(0, 4).map((period) => ({
        name: period.name,
        temperature: period.temperature,
        temperatureUnit: period.temperatureUnit,
        shortForecast: period.shortForecast,
        windSpeed: period.windSpeed,
        windDirection: period.windDirection,
      })),
    });
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/auth/me', verifyAuth, (req, res) => {
  res.send(publicUser(req.authUser));
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled service request error:', err);
  res.status(500).send({
    type: err instanceof Error ? err.name : 'Error',
    message: 'Internal server error',
  });
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

  await userCollection.insertOne({ ...user });
  return user;
}

async function findUser(field, value) {
  if (!value) return null;
  const options = field === 'email' ? { collation: userIdentityCollation } : {};
  return userCollection.findOne({ [field]: value }, options);
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

async function startServer() {
  const database = require('./database');
  await database.connectToDatabase();
  userCollection = database.userCollection;
  popularSpotsCollection = database.popularSpotsCollection;
  chatMessagesCollection = database.chatMessagesCollection;

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

startServer().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Unable to start service during MongoDB initialization: ${message}`);
  process.exitCode = 1;
});
