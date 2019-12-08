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
 * 
 */
exports.start_queue = async function(req, res) {
    let queue = await new Song().find({
        selector: {
            'downloaded': { $eq: false }
          }
    });
    QUEUE = queue;
    module.exports.process_queue();
};

/**
 * process_queue: Process the current element from de queue
 */
exports.process_queue = async function() {
    if (QUEUE.length > 0) {
        let element = QUEUE.pop();
        console.log(`Proccessing element #${QUEUE.length} - ${element.title}`)
        await module.exports.download_song(element.url, element.code);
        element.downloaded = true;
        // new Song(element).save();
        module.exports.process_queue();
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

// Display book create form on GET.
exports.book_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book create GET');
};

// Handle book create on POST.
exports.book_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book create POST');
};

// Display book delete form on GET.
exports.book_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};