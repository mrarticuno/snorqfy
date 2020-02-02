const fs = require('fs');
const util = require('util');
let crawler = require('youtube-crawler');
let Song = require('../models/song');
const downloadController = require('../controllers/downloadController');

/**
 * listFiles: list all the files available in the music folder
 * @param req
 * @param res
 * @returns {Promise<string[]>}
 */
exports.listFiles = async function(req, res) {
    const readdir = util.promisify(fs.readdir);
    return res.status(200).json(await readdir('./musics/'));
};

/**
 * List
 */
exports.list = async function(req, res) {
    let { search } = req.params
    let result = []
    if (!search || search.length === 0) {
        result = await new Song().all();
    } else {
        result = await new Song().find({
            selector: {
                'title': { $regex: RegExp(search, "i") }
            }
        });
    }
    return res.status(200).json(result.length > 0);
};

/**
 * Search
 */
exports.search = async function(req, res) {
    let { search } = req.params;
    const craw = util.promisify(crawler);
    let result = await craw(search);

    res.status(200).json(result);
};

/**
 * Delete song
 */
exports.delete = async function(req, res) {
    let { code, soft } = req.body;
    if (code) {
        let song = await new Song().find({
            selector: {
                'code': { $eq: code }
            }
        });
        if (song && song.length === 1) {
            if (soft) {
                song.downloaded = false;
                await song.save();
            }
            await fs.unlinkSync(`./musics/${code}.mp3`)
        } else {
            throw new Error('Song not found.');
        }
        return files.includes(id);
    } else {
        throw new Error('Invalid parameters');
    }
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
        await module.exports.songRequest(req.body);
        downloadController.start_queue();
        res.status(200).json('Song request done.')
    } catch (exp) {
        console.log(exp);
        res.status(500).json('Internal Server Error');
    }
};

/**
 * songRequest
 * Inputs:
 * - name: (string) Name of the music
 * - applysufix: (bool) Apply lyrics suffix to avoid video musics with history
 * - index: (int) Number of the index of the search that has to be downloaded
 * - force: (bool) Force to check if the song is the same of the DB
 * - list: (bool) Return the result array of the search
 */
exports.songRequest = async function (request) {
    let { name, applysufix, index, force, list } = request;

    if (!force) {
        let checkMatchInDB = await new Song().find({
            selector: {
                'title': { $regex: RegExp(name, "i") }
              }
        });

        if (checkMatchInDB && checkMatchInDB.length > 0) {
            return;
        }
    }

    const craw = util.promisify(crawler);

    if (applysufix) {
        name = `${name} oficial`;
    }
    
    let result = await craw(name.replace(/[^\x00-\x7F]/g, ""));

    if (!result) {
        result = await craw(name);
        if (result && result.length > 0) {
            await module.exports.processSong(result, index, list);
        }
    } else if (result.length > 0) {
        await module.exports.processSong(result, index, list);
    }
};

/**
 * playlistRequest
 * Inputs:
 * - list: (array) Array of links that must be downloaded
 * - force: (boolean) Boolean that force to re-download all the playlist
 */
exports.playlistRequest = async function (request) {
    let { list } = request;

    if (list && list.length > 0) {
        list.forEach(item => {
            new Song({
                url: item.url,
                title: item.name
            }).save();
        });
    }
};

exports.processSong = async function (result, index, list) {
    if (list) {
        res.status(200).json(result);
        return;
    }
    else if (index && result[index]) {
        result = result[index];
    } else {
        result = result[0];
    }

    let checkMusicInDB = await new Song().find({
        selector: {
            'url': { $eq: result.link }
          }
    });

    if (checkMusicInDB && checkMusicInDB.length > 0) {
    } else {
        await new Song({
            url: result.link,
            title: result.title
        }).save();
    }
};
