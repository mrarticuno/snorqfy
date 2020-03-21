const util = require('util');
const fs = require('fs');
/**
 * Stream song from key provided
 */
exports.play_song = function(req, res) {
    let { key } = req.params;
    let file = 'musics/' + key + '.mp3';

    try {
        const stat = fs.statSync(file);
        const total = stat.size;
        fs.exists(file, (exists) => {
            if (exists) {
                let range = req.headers.range;
                if (!range) {
                    range = `bytes=0-`
                }
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
    } catch (error) {
        console.log(error);
        res.send('Song not found.');
    }
};

exports.play_playlist = function(req, res) {
    res.send('NOT IMPLEMENTED: PLAY SONG');
};

exports.skip_song = function(req, res) {
    res.send('NOT IMPLEMENTED: PLAY NEXT SONG');
};

exports.last_song = function(req, res) {
    res.send('NOT IMPLEMENTED: PLAY LAST SONG');
};

exports.downvote_song = function(req, res) {
    res.send('NOT IMPLEMENTED: DOWNVOTE SONG');
};

exports.upvote_song = function(req, res) {
    res.send('NOT IMPLEMENTED: UPVOTE SONG');
};
