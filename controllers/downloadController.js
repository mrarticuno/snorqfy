const fs = require('fs');
const util = require('util');
let Song = require('../models/song');
const exec = util.promisify(require('child_process').exec);
let QUEUE = [];

exports.index = function(req, res) {
    res.send('QUEUE START');
    exports.module.start_queue();
};

/**
 * start_queue: Start the main function to download the songs on the queue
 */
exports.start_queue = async function(req, res) {
    QUEUE = await new Song().find({
        selector: {
            'downloaded': {$eq: false}
        }
    });
    await module.exports.process_queue();
};

/**
 * process_queue: Process the current element from de queue
 */
exports.process_queue = async function() {
    if (QUEUE.length > 0) {
        let element = QUEUE.pop();
        console.log(`Processing element #${QUEUE.length} - ${element.title}`)
        await module.exports.download_song(element.url, element.code);
        element.downloaded = true;
        // new Song(element).save();
        await module.exports.process_queue();
    }
};

/**
 * download_song: Download a song from the link and put on the output folder
 */
exports.download_song = async function(link, output) {
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
        console.log(`Error during download of ${output}`);
        console.log(e);
        return false;
    }
    return true;
};
