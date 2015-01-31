var express = require('express')
var app = express();
var http = require('http');
var https = require('https');


var server = http.createServer(app);



app.get('/', function(request, response) {
	response.sendfile(__dirname+'/index.html');
});


app.get('/weibo_login_home', function(request, response) {
	response.sendfile(__dirname+'/weibotest.html');
});

app.get('/weibo_login', function(request, response) {
	
	
	response.send("yes got it!");
});

app.get('/weibo_callback', function(request, response) {
	
	var code = request.param('code');
	
	
	var options = {
			hostname: 'api.weibo.com',
			path: '/oauth2/access_token?client_id=2348647833&client_secret=fa360248bc7c33b45929826eb3f8510e&grant_type=authorization_code&redirect_uri=http://ftd.herokuapp.com/weibo_access_token_success&code=' + code, // query_string already has "?q="
			method: 'GET'
	};
	
	var req = https.request(options, function(res) { // res is IncomingMessage help: http://nodejs.org/api/http.html#http_http_incomingmessage
		// res.statusCode
		res.setEncoding("utf8");
		res.on('data', function (chunk) {// this happens multiple times! So need to use 'body' to collect all data
			body += chunk;
		});
		
		var data="";
		res.on('end', function () { // when we have full 'body', convert to JSON and send back to client.
			try {
				data = JSON.parse(body);
		    } catch (er) {
		    	// something wrong with JSON
		    	response.statusCode = 400;
		    	return response.end('error: ' + er.message);
		    }

		    // write back response json
		    response.send(data);
		    response.end();
		  });
	});
	req.end();
	
//	response.send("user code is " + code);
});

app.get('/weibo_access_token_success', function(request, response) {
	
	
	response.send("yes got it!");
});



app.get('/facebook_login', function(request, response) {
	
	
	response.send("facebook login");
});




var port = process.env.PORT || 5000;
server.listen(port, function() {
  console.log("Listening on " + port);
});