var express = require('express')
var app = express();

app.set('port', (process.env.PORT || 5000))

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
	response.send("user code is " + code);
});


app.get('/facebook_login', function(request, response) {
	
	
	response.send("facebook login");
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})