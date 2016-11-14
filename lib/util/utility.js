'use strict';

const fs = require('fs');
const archiver = require('archiver');

module.exports.ZipFile = function(pathToSourceDirectory, subDirectoriesToZip, pathToDestinationDirectory) {
    const archive = archiver('zip');
    const timeStamp = new Date().toISOString();
    const zipFileName = 'brixbundler_' + timeStamp + '.zip';

    if(pathToDestinationDirectory == null){
        return reply('please set pathToDestinationDirectory and retry').code(504);
    }

    const outputPath = pathToDestinationDirectory + '/' + zipFileName; //output file path
    const output = fs.createWriteStream(outputPath); //path to create .zip file

    archive.on('error', function(err){
        throw err;
    });

    archive.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
    });

    subDirectoriesToZip.forEach(function(subDirName) {
        // 1st argument is the path to directory
        // 2nd argument is how to be structured in the archive
        archive.directory(pathToSourceDirectory + subDirName, subDirName);
    });

    archive.pipe(output);
    archive.finalize();

    return {
        "pathToZipFile": outputPath,
        "timeStamp": timeStamp
    };
}