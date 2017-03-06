// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;

var databaseUri = process.env.DATABASE_URI || process.env.MONGOLAB_URI

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
	serverURL: "http://27.120.92.29/parse",
	facebookAppIds: ['694111927364944'],
    databaseURI: process.env.DATABASE_URI || 'mongodb://shintaro0221:ans8hj3we@ds061415.mongolab.com:61415/drnear',  
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',  
    appId: '7sQi0lLjmfSyfDtXDvi0pk4jcXz6jDBMRGAnVH24',  
    masterKey: 'pMgGwh8jrQ4wAImJAEe7txBcE6CQC14Xl8opg3XL'
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a web site.');
});

var port = process.env.PORT || 1337;
app.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});
