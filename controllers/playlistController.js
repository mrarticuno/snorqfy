const { Youtube, Spotify } = require('you-lister');
const songController = require('../controllers/songController');
const downloadController = require('../controllers/downloadController');
const Playlist = require('../models/playlist');
const Song = require('../models/song');

/**
 * request
 * put playlist in the song queue
 */
exports.index = async function(req, res) {
    let playlist = await new Playlist().all();
    let song = await new Song().all();
    res.status(202).json({
        playlist, song
    });
};

/**
 * request
 * put playlist in the song queue
 */
exports.request = async function(req, res) {
    let { link, spotify } = req.body;
    let scrappedPlaylist = [];
    if (!spotify) {
        let youtube = new Youtube({
            url: link,
            fast: false
        });
        scrappedPlaylist = await youtube.scrap();
    } else {
        let spotify = new Spotify({
            url: link
        });
        scrappedPlaylist = await spotify.scrap();
    }
    const playlist = new Playlist({
        url: link
    });
    if (scrappedPlaylist.length > 0) {
        scrappedPlaylist = scrappedPlaylist.filter(x => !x.name.includes('Deleted video') || !x.name.includes('Private video'))
        const promises = scrappedPlaylist.map(async (item, idx) => {
            playlist.songs.push(item.id);
            try {
                await songController.songRequest({
                    name: item.name
                }, res);
            } catch(ex) {
                console.log(ex);
                console.error(`Failed to request song: ${item.name}`)
            }
        });

        await Promise.all(promises);
        await playlist.save();
    } else {
        throw new Error('Failed to scrap videos from the playlist.');
    }
    downloadController.start_queue();
    res.status(202).json('Playlist requested.');
};
