var express = require('express')
var app = express();
var http = require('http');
var https = require('https');

var OAuth = require('oauth');



var _TWITTER_CONSUMER_KEY = 'QCNjxwwnRY43ciBstZLqb2DTH';
var _TWITTER_CONSUMER_SECRET = 'spj49aPazeWSafjHEedZwjm8VyDtwnbgahG7Y5PokHEeGvS4Xj';

var _TWITTER_ACCESS_TOKEN = '81404737-dOUXh4oOjTnu3RJH1MeRSviEbuCCopNO53tfI0mTx';
var _TWITTER_ACCESS_TOKEN_SECRET = 'zKUz6rwOqURPRckjvVkIWlYwlOUXsXshw9N4U9MXQsyaM';


var _WEIBO_CODE ="c8cfe26cd92d2a40ab81214e389f2abd";
var _WEIBO_ACCESS_TOKEN = "2.00Ut6lRBfagwYC071b2f7df209COpI";


var oauth = new OAuth.OAuth(
	      'https://api.twitter.com/oauth/request_token',
	      'https://api.twitter.com/oauth/access_token',
	      _TWITTER_CONSUMER_KEY,
	      _TWITTER_CONSUMER_SECRET,
	      '1.0A',
	      null,
	      'HMAC-SHA1'
);


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
	response.sendfile(__dirname+'/index4.html');
});

app.get('/weibo_login_home', function(request, response) {
	response.sendfile(__dirname+'/weibotest.html');
});

app.get('/weibo_update', function(request, response) {
	var json_test = '{"access_token":"' + _WEIBO_ACCESS_TOKEN + '",'
		+ '"remind_in":"157679999","expires_in":157679999,"uid":"5501994427"}';
	
	var token = JSON.parse(json_test)['access_token'];

	var text = '';
	text += request.param('text');
	console.log(text);
	console.log(token);
	var querystring = require('querystring');
	var post_data = querystring.stringify({
      'status' : text
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
	//var code = _WEIBO_CODE;
	
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
		    response.redirect('/weibo_home?access_token=' + data['access_token'] + "&code=" + code);
//		    var access_token = "2.00Ut6lRBfagwYC071b2f7df209COpI";
		    response.end();
		  });
	});
	req.end();
});

app.get('/weibo_home', function(request, response) {
	var token = request.param('access_token');

	var code = request.param('code');

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


app.get('/fetch_tweets', function(request, response) {
	oauth.get(
		      'https://api.twitter.com/1.1/statuses/home_timeline.json',
		      _TWITTER_ACCESS_TOKEN, 
		      _TWITTER_ACCESS_TOKEN_SECRET, 
		      function (e, data, res){
		        if (e) console.error(e);        
		       response.send(JSON.parse(data));
	}); 
});

app.get('/send_tweet', function(request, response) {
	oauth.post(
			  "https://api.twitter.com/1.1/statuses/update.json",
		      _TWITTER_ACCESS_TOKEN, 
		      _TWITTER_ACCESS_TOKEN_SECRET, 
			  {"status":"Test tweets #OpenHack2015"},
			  function(error, data) {
			    if(error) console.log(require('sys').inspect(error))
			    else console.log(data)
			  }
	);
	
});

app.get('/bing', function(request, response) {
	var text = '';
	text += request.param('text');
	var qdata = 'translate ' + text + ' from english to chinese';
	//var querystring = require('querystring');
	var qstr ='';
	//qstr += encodeURIComponent(qdata);
	qstr += encodeURIComponent(qdata);
	console.log("qstr: " + qstr);
	/*
	var options = {
			hostname: 'api.justext.me',
			path: qstr, // query_string already has "?q="
			method: 'GET'
	};
	*/
	var options = {
			hostname: 'api.justext.me',
			//path: qstr, // query_string already has "?q="
			path : '/?Body=' + qstr,
			method: 'GET'
	};
	var body = "";
	
	var http = require('http');
	var req = http.request(options, function(res) { // res is IncomingMessage help: http://nodejs.org/api/http.html#http_http_incomingmessage
		// res.statusCode
		res.setEncoding("utf8");
		res.on('data', function (chunk) {// this happens multiple times! So need to use 'body' to collect all data
			body += chunk;
		});
		
		var data="";
		res.on('end', function () { // when we have full 'body', convert to JSON and send back to client.
			try {
				//data = body.substring(21, body.length-2);
				data += body.substring(39, body.length - 23);
		    } catch (er) {
		    	// something wrong with JSON

		    	response.statusCode = 400;
		    	return response.end('error: ' + er.message);
		    }

		    // redirect to app home	   
		    //response.redirect('/weibo_home?access_token=' + data['access_token'] + "&code=" + code);
//		    var access_token = "2.00Ut6lRBfagwYC071b2f7df209COpI";
		    response.send(data);
		    response.end();
		  });
	});
	console.log("22222");
	req.end();

});

var port = process.env.PORT || 5000;
server.listen(port, function() {
  console.log("Listening on " + port);
});
