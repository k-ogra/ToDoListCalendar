const express = require('express');
const createError = require('http-errors');
const morgan = require('morgan');
const { google } = require('googleapis');
require('dotenv').config();
const {
  OAuth2Client,
} = require('google-auth-library');

const app = express();
const cors = require("cors")
app.use(
  cors({
    origin: "http://localhost:5173",
}))
app.use(express.json());

const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'postmessage'
);


app.post('/auth/google', async (req, res) => {
  const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens
  res.json(tokens);
  oAuth2Client.setCredentials({refresh_token: tokens.refresh_token})
});

app.post('/auth/google/refresh-token', async (req, res) => {
  const user = new UserRefreshClient(
    clientId,
    clientSecret,
    req.body.refreshToken,
  );
  const { credentials } = await user.refreshAccessToken(); // obtain new tokens
  res.json(credentials);
})



app.use('/create-event', async (req, res) => {
    const { currentTitle, startTime, endTime } = await req.body
    const calendar = google.calendar('v3')
    await calendar.events.insert({
    auth: oAuth2Client,
    calendarId: 'primary',
    requestBody: {
      summary: currentTitle,
      colorId: "3",
      start: {
        dateTime: new Date(startTime),
      },
      end: {
        dateTime: new Date(endTime),
      }
          }
            }).catch((error) => {
              console.error(error);
            });
})







app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));



app.get('/', async (req, res, next) => {
  res.send({ message: 'Backend is live' });
});

app.use('/api', require('./routes/api.route'));

app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));
