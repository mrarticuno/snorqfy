const Song = require('../models/song');
const Playlist = require('../models/Playlist');
const fs = require('fs');

/**
 * start_monitor: Monitoring the data
 */
exports.start_monitor = async function() {
    let allSongs = await new Song().all();
    let allPlaylists = await new Playlist().all();
    console.log('Data Ready, Checking integrity.');
    module.exports.check_songs(allPlaylists, allSongs);
};

/**
 * check_songs: Check if the songs has files available
 */
exports.check_songs = async function(playlists, songs) {
    if (playlists && playlists.length > 0) {
        playlists.forEach(playlist => {
            if (playlist && playlist.songs.length > 0) {
                playlist.songs.forEach((song, index, object) => {
                    if (!fs.existsSync(`musics/${song}.mp3`)) {
                        let brokenSong = songs.find(x => x.code === song);
                        if (brokenSong && brokenSong.broken) {}
                        else if (brokenSong) {
                            brokenSong = new Song(brokenSong);
                            brokenSong.broken = true;
                            brokenSong.save();
                            console.log(`Broken song ${song} - ${brokenSong.title} found, marking as broken.`);
                        } else {
                            object.splice(index, 1);
                            console.log(`Broken song ${song} not found, removing from playlist.`);
                        }
                    }
                });
            }
        });
    }
    console.log('Integrity check done, ready to go.');
};
