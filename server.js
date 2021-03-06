const express = require('express')
const app = express()
const cors = require('cors');
app.use(cors());
const bodyParser = require('body-parser');
const port = 3000
// const routes = require('./routes');
const songRoutes = require('./routes/song');
const listenRoutes = require('./routes/listen');
const playlistRoutes = require('./routes/playlist');

app.use(bodyParser.json());

//  Connect all our routes to our application
// app.use('/', routes);
app.use('/song', songRoutes);
app.use('/listen', listenRoutes);
app.use('/playlist', playlistRoutes);

app.listen(port, () => console.log(`Listen server ${port}!`));

// Resume Download queue

const DC = require('./controllers/downloadController');
DC.start_queue();