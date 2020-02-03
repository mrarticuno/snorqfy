const fs = require('fs');
const util = require('util');
let Song = require('../models/song');
const exec = util.promisify(require('child_process').exec);
let QUEUE = [];
let broken = [
    'The uploader has not made this video available in your country.',
    'The uploader has not made this video available',
    'This video contains content from SME, who has blocked it in your country on copyright grounds.',
    'This video contains content from UMG, who has blocked it in your country on copyright grounds.'
]

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
        new Song(element).save();
        await module.exports.process_queue();
    } else {
        const MC = require('../controllers/monitorController');
        MC.start_monitor();
    }
};

/**
 * download_song: Download a song from the link and put on the output folder
 */
exports.download_song = async function(link, output, retry) {
    const command = util.promisify(exec);
    console.log(link, output);
    try {
        await command(`ytdl ${link} | ffmpeg -i pipe:0 -b:a 192K -vn "musics/${output}.mp3"`);
    } catch (e) {
        broken.forEach(item => {
            if (e.message.includes(item)){
                console.debug('Video Unavailable.')
                return;
            }
        });
        if (!retry) {
            console.log(`Error during download of ${output} trying auto-remediation.`);
            fs.unlink(`musics/${output}.mp3`, (err) => {
                if (err) {
                    console.log('File do not exists, Auto-Remediation failed.')
                }else {
                    console.log(`musics/${output}.mp3 was deleted`);
                }
              });
            await module.exports.download_song(link, output, true);
        } else {
            console.log(`Error during download of ${output} auto-remediation failed.`);
            console.log(e);
        }
    }
};
