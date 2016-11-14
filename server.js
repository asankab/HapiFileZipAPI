'use strict';

const Hapi = require('hapi');
var config = require('./config/config');
const utility = require('./lib/util/utility');

process.on('uncaughtException', function(error)
{
    log.error(error);
});

process.on('unhandledRejection', function(error)
{
    log.error(error);
});

const server = new Hapi.Server();
server.connection({ port: 3000 });

server.register([require('vision'), require('inert')], function (err) {
    if (err) console.log(err);
});

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, world!');
    }
});

/*server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});*/

server.route({
    method: 'POST',
    path: '/api/v1/activities',
    handler: function (request, reply) {

        /*var payload = request.payload;
        var activityGuids = JSON.stringify(payload);

        console.log("activity Guids Array:" + activityGuids);
        console.log("payload:" + payload);

        activityGuids.forEach(function(activityID){
            console.log("Activity ID:" + activityID);
        });*/

        const sourceDirectoryPath = config.sourceDirectoryPath; //source directory to copy contents from
        const subDirectoriesToZip = config.subDirectoriesToZip; //directories to zip
        const destinationFolderPath = config.destinationFolderPath;

        if(sourceDirectoryPath == null){
            return reply('please set sourceDirectoryPath and retry').code(504);
        }

        if(subDirectoriesToZip == null){
            return reply('please set subDirectoriesToZip and retry').code(504);
        }

        if(destinationFolderPath == null){
            return reply('please set destinationFolderPath and retry').code(504);
        }

        var fileZipResponse = utility.ZipFile(sourceDirectoryPath, subDirectoriesToZip, destinationFolderPath);
        if(fileZipResponse != null){
            return reply({ "zipFileUrl": fileZipResponse.pathToZipFile,
                           "timeStamp": fileZipResponse.timeStamp }).code(200);
        }

        return reply().code(504);
    }
});

server.route({
    method: 'GET',
    path: '/api/v1/bundler/{param*}',
    handler: {
        directory: {
            path: 'zipfilestore'//,
            //listing: true
        }
    }
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});

//https://github.com/archiverjs/node-archiver
//https://www.npmjs.com/package/archiver
//https://github.com/archiverjs/node-archiver
//https://archiverjs.com/docs/
//http://stackoverflow.com/questions/34335326/node-archiver-archive-multiple-directories

//archive.directory('views', true, { date: new Date() });
//archive.directory('uploads', true, { date: new Date() });

/*handler : {
 file: {
 path: 'bulk-output.zip',
 filename: 'client.zip', // override the filename in the Content-Disposition header
 mode: 'attachment', // specify the Content-Disposition is an attachment
 lookupCompressed: true // allow looking for script.js.gz if the request allows it
 }
 }*/

//https://github.com/paullang/hapi-post-example