var express = require('express')
var app = express();
var http = require('http');
var https = require('https');
////var OAuth= require('oauth').OAuth;
//
//var OAuth = require('OAuth');
//var oauth = new OAuth.OAuth(
//      'https://api.twitter.com/oauth/request_token',
//      'https://api.twitter.com/oauth/access_token',
//      '2bjc6UMsRz85YC4JIzYZ984nr',
//      '18xosis9MgvqRshLbmfroXvXHrdE97QoqHHYEq3fDx5EnZFRh9',
//      '1.0A',
//      'http://ftd.herokuapp.com/twitter_callback',
//      'HMAC-SHA1'
//);
//    
//oauth.get(
//      'https://api.twitter.com/1.1/trends/place.json?id=23424977',
//      '81404737-dOUXh4oOjTnu3RJH1MeRSviEbuCCopNO53tfI0mTx', 
//      //you can get it at dev.twitter.com for your own apps
//      'zKUz6rwOqURPRckjvVkIWlYwlOUXsXshw9N4U9MXQsyaM', 
//      //you can get it at dev.twitter.com for your own apps
//      function (e, data, res){
//        if (e) console.error(e);        
//        console.log(data);
//      });    
//
//
////var oa = new OAuth(
////		"https://api.twitter.com/oauth/request_token",
////		"https://api.twitter.com/oauth/access_token",
////		"2bjc6UMsRz85YC4JIzYZ984nr",
////		"18xosis9MgvqRshLbmfroXvXHrdE97QoqHHYEq3fDx5EnZFRh9",
////		"1.0",
////		"http://ftd.herokuapp.com/twitter_callback",
////		"HMAC-SHA1"
////);


var bodyParser = require('body-parser');

var server = http.createServer(app);

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use('/js', express.static('js'));
app.use('/css', express.static('css'));
app.use('/fonts', express.static('fonts'));
app.use('/images', express.static('images'));



app.get('/', function(request, response) {
	response.sendfile(__dirname+'/index.html');
});

app.get('/weibo_login_home', function(request, response) {
	response.sendfile(__dirname+'/weibotest.html');
});

app.get('/weibo_update', function(request, response) {
	var json_test = '{"access_token":"2.00bFo2AGfagwYCc4a389cecf0YeBKE",'
		+ '"remind_in":"157679999","expires_in":157679999,"uid":"5501994427"}';
	
	var token = JSON.parse(json_test)['access_token'];

	var querystring = require('querystring');
	var post_data = querystring.stringify({
      'status' : 'this is the first test weibo!'
  	});

	var options = {
			hostname: 'api.weibo.com',
			path: '/2/statuses/update.json?access_token=' + token, // query_string already has "?q="
			method: 'POST',
			headers: {
	          'Content-Type': 'application/x-www-form-urlencoded',
	          'Content-Length': post_data.length
	      	}
	};
	var body = "";
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
		    console.log(res.statusCode);
		    response.end();
		  });
	});
	
	req.write(post_data);
	req.end();
	//response.send(body);
});

app.get('/weibo_callback', function(request, response) {
	
	var code = request.param('code');
	
	var options = {
			hostname: 'api.weibo.com',
			path: '/oauth2/access_token?client_id=2348647833&client_secret=fa360248bc7c33b45929826eb3f8510e'
				+ '&grant_type=authorization_code&redirect_uri=http://ftd.herokuapp.com/weibo_callback&code=' 
				+ code, // query_string already has "?q="
			method: 'POST'
	};
	
	var body = "";
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

		    // redirect to app home	    
		    response.redirect('https://ftd.herokuapp.com/weibo_home?access_token=' + data['access_token']);
		    var access_token = "2.00bFo2AGfagwYCc4a389cecf0YeBKE";
		    response.end();
		  });
	});
	req.end();
});

app.get('/weibo_home', function(request, response) {
	var token = request.param('access_token');

	var options = {
			hostname: 'api.weibo.com',
			path: '/2/statuses/user_timeline.json?access_token=' + token,
			method: 'GET'
	};
	
	var body = "";
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

		    // redirect to app home	    
		    response.send(data);
		    response.end();
		  });
	});
	req.end();

});

app.get('/weibo_access_token_success', function(request, response) {
	response.send("yes got it!");
});

app.get('/facebook_login', function(request, response) {
	response.send("facebook login");
});


app.post('/facebook_token', function(request, response) {
	console.log(request.body.access_token);
	var code = request.param('access_token');

	
//	console.log(code);
	
	response.send("thanks for the token");
});



// Twitter login handlers

app.get('/twitter_login', function(request, response) {
	response.sendfile(__dirname+'/twitter_login.html');
});

app.get('/twitter_login1', function(request, response) {
	var auth = 'OAuth ' +
			
			'oauth_consumer_key="2bjc6UMsRz85YC4JIzYZ984nr",' +
			'oauth_nonce="34acba8ee4f5bbd5a17dc9564bc75be3",' +
			'oauth_signature="Z2Wj3hPsoRA9h2SDdaIuVTU0HxM%3D",' +
			'oauth_signature_method="HMAC-SHA1",' +
			'oauth_timestamp="1422701818",' +
			'oauth_token="81404737-dOUXh4oOjTnu3RJH1MeRSviEbuCCopNO53tfI0mTx",' + 
			'oauth_version="1.0"' ;

	var options = {
			hostname: 'api.twitter.com',
			path: '/1.1/statuses/home_timeline.json',
			method: 'GET',
			
			headers : {
				'Authorization': auth
			}
	};
	
	var body = "";
	var req = https.request(options, function(res) { // res is IncomingMessage help: http://nodejs.org/api/http.html#http_http_incomingmessage

		console.log('HEADERS: ' + JSON.stringify(req.getHeader("Authorization")));
		// res.statusCode
		res.setEncoding("utf8");
		res.on('data', function (chunk) {// this happens multiple times! So need to use 'body' to collect all data
			body += chunk;
//			console.log(res.headers);
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

		    // redirect to app home	    
		    response.send(data);
		    response.end();
		  });
	});
	req.end();
	
	
//	oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
//		if (error) {
//			console.log(error);
//			res.send("yeah no. didn't work.")
//		}
//		else {
////			req.session.oauth = {};
////			req.session.oauth.token = oauth_token;
//			console.log('oauth.token: ' + oauth_token);
////			req.session.oauth.token_secret = oauth_token_secret;
//			console.log('oauth.token_secret: ' + oauth_token_secret);
//			res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
//	}
//	});
	
	
});

app.get('/twitter_callback', function(req, res, next){
////	if (req.session.oauth) {
//		req.session.oauth.verifier = req.query.oauth_verifier;
//		var oauth = req.session.oauth;
//
//		oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, 
//		function(error, oauth_access_token, oauth_access_token_secret, results){
//			if (error){
//				console.log(error);
//				res.send("yeah something broke.");
//			} else {
////				req.session.oauth.access_token = oauth_access_token;
////				req.session.oauth,access_token_secret = oauth_access_token_secret;
//				console.log(results);
//				res.send("worked. nice one.");
//			}
//		}
//		);
////	} else
////		next(new Error("you're not supposed to be here."))
	
	
	console.log("calllllllbackkkk");
	response.send("twitter login callback here!");
});



var port = process.env.PORT || 5000;
server.listen(port, function() {
  console.log("Listening on " + port);
});
