const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = 3000
const routes = require('./routes');
const songRoutes = require('./routes/song');
const playlistRoutes = require('./routes/playlist');

app.use(bodyParser.json());

//  Connect all our routes to our application
app.use('/', routes);
app.use('/song', songRoutes);
app.use('/playlist', playlistRoutes);

app.listen(port, () => console.log(`Listen server ${port}!`))