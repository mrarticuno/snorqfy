const fs = require('fs');
const util = require('util');
let crawler = require('youtube-crawler');
let Song = require('../models/song');
let SongException = require('../models/exceptions/songException');
const downloadController = require('../controllers/downloadController');

exports.index = async function(req, res) {
    downloadController.start_queue();
    
    res.status(200).json('Started');
};

/**
 * listFiles: list all the files available in the music folder
 * @param req
 * @param res
 * @returns {Promise<string[]>}
 */
exports.listFiles = async function(req, res) {
    const readdir = util.promisify(fs.readdir);
    return await readdir('./musics/');
};

/**
 * List
 */
exports.list = async function(req, res) {
    res.status(200).json(await listFiles());
};

/**
 * Search
 */
exports.search = async function(req, res) {
    let search = req.params.search;
    const craw = util.promisify(crawler);
    let result = await craw(search);

    res.status(200).json(result);
};

/**
 * Look file in the filesystem
 */
exports.searchFile = async function(req, res) {
    let { name, id } = req.body;
    const files = await listFiles();

    if (id) {
        return files.includes(id);
    } else  if(!id && name) {
        let result = await new Song().find({
            selector: {
                'title': { $regex: RegExp(name, "i") }
            }
        });
        return result.length > 0;
    } else {
        throw new Error('Invalid parameters');
    }
};

/**
 * request
 * Inputs:
 * - name: (string) Name of the music
 * - applysufix: (bool) Apply lyrics suffix to avoid video musics with history
 * - index: (int) Number of the index of the search that has to be downloaded
 * - force: (bool) Force to check if the song is the same of the DB
 * - list: (bool) Return the result array of the search
 */
exports.request = async function(req, res) {
    try {
        let { name, applysufix, index, force, list } = req.body;

        if (!force) {
            let checkMatchInDB = await new Song().find({
                selector: {
                    'title': { $regex: RegExp(name, "i") }
                  }
            });
    
            if (checkMatchInDB && checkMatchInDB.length > 0) {
                res.send(`Song ${name} is already in the Database.`);
                return;
            }
        }

        const craw = util.promisify(crawler);
        if (applysufix) {
            name = `${name} lyrics`;
        }
        let result = await craw(name);

        if (result.length > 0) {
            if (list) {
                res.status(200).json(result);
                return;
            }
            else if (index && result[index]) {
                result = result[index];
            } else {
                result = result[0];
            }
        } else {
            throw new SongException('Index not found. SE-1');
        }

        let checkMusicInDB = await new Song().find({
            selector: {
                'url': { $eq: result.link }
              }
        });

        if (checkMusicInDB && checkMusicInDB.length > 0) {
            res.send(`Song ${result.title} is already in the Database.`);
        } else {
            await new Song({
                url: result.link,
                title: result.title
            }).save();
            downloadController();
            res.send(`Song ${result.title} added to the download queue.`);
        }
    } catch (exp) {
        console.log(exp);
        res.status(500).json('Internal Server Error');
    }
};
