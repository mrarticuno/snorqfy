const routes = require('express').Router();
const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);
let crawler = require('youtube-crawler');
const youLister = require('you-lister');
const queue = [];

routes.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected!' });
});

routes.post('/music', async function (req, res) {
    let { name, suffix } = req.body
    const craw = util.promisify(crawler);
    let result = await craw(name);
    await downloadMp3(result[0].link, `musics/${name}`);
    res.send(`A musica escolhida foi: ${name} - ${result[0].link}`)
})

routes.post('/playlist', async function (req, res) {
    let { link } = req.body
    const playlist = await youLister.scrap(link);
    const result = playlist.filter(x => {
        return !x.name.includes('Deleted video') || !x.name.includes('Private video') || !x.name.includes('undefined - undefined');
    })
    if (result.length > 0) {
        result.forEach(item => {
            queue.push({url: item.url, id: `musics/${item.id}`})
        })
    }
    fs.writeFileSync(`playlists/${base64url_encode(link)}.json`, JSON.stringify(result));
    processQueue(base64url_encode(link));
    res.send(`Playlist added to the queue to download.`);
})

routes.get('/listen/music/:key', function(req, res) {
    let key = req.params.key;

    let file = 'musics/' + key + '.mp3';

    const stat = fs.statSync(file);
    const total = stat.size;
    if (req.headers.range) {

    }
    fs.exists(file, (exists) => {
        if (exists) {
            const range = req.headers.range;
            const parts = range.replace(/bytes=/, '').split('-');
            const partialStart = parts[0];
            const partialEnd = parts[1];

            const start = parseInt(partialStart, 10);
            const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
            const chunksize = (end - start) + 1;
            const rstream = fs.createReadStream(file, {start: start, end: end});

            res.writeHead(206, {
                'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
                'Accept-Ranges': 'bytes', 'Content-Length': chunksize,
                'Content-Type': 'audio/mpeg'
            });
            rstream.pipe(res);

        } else {
            res.send('Error - 404');
            res.end();
            // res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'audio/mpeg' });
            // fs.createReadStream(path).pipe(res);
        }
    });
});

routes.post('/listen/playlist', function(req, res) {
    let { playlist } = req.body
    playlist = base64url_encode(playlist)
    let rawdata = fs.readFileSync(`playlists/${playlist}.json`);
    res.send(JSON.parse(rawdata))
});

async function downloadMp3(link, output) {
    const command = util.promisify(exec);
    try {
        if (fs.existsSync(output)) {
          return true;
        }
      } catch(err) {
      }
    try {
        await command(`ytdl ${link} | ffmpeg -i pipe:0 -b:a 192K -vn "${output}.mp3"`);
    } catch (e) {
        console.log(`Error during download of ${output}`)
        console.log(e)
        return false;
    }
    return true
}

function base64url_encode(string) {
    return string.replace(/\//g, '');
}

async function processQueue(playlistLink) {
    if (queue.length > 0) {
        let element = queue.pop();
        console.log(`Proccessing element #${queue.length} - ${element.id}`)
        let result = await downloadMp3(element.url, element.id);
        if (!result) {
            await removeMusicFromPlaylist(playlistLink, element.url);
        }
        processQueue(playlistLink);
    }
}

async function removeMusicFromPlaylist(playlist, link) {
    let rawdata = fs.readFileSync(`playlists/${playlist}.json`);
    let data = JSON.parse(rawdata);

    console.log(`Removing ${link} from playlist ${playlist}`)

    data = data.filter(x => {
        return x.url !== link
    })
    fs.writeFileSync(`playlists/${playlist}.json`, JSON.stringify(data));
}

module.exports = routes;