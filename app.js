
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , redis = require('socket.io/node_modules/redis');

var fs = require('fs')
  , path = require('path')
  , crypto = require('crypto');
  

var pub = redis.createClient(6379, "ec2-23-21-226-21.compute-1.amazonaws.com");
var sub = redis.createClient(6379, "ec2-23-21-226-21.compute-1.amazonaws.com");
var store = redis.createClient(6379, "ec2-23-21-226-21.compute-1.amazonaws.com");

io.configure( function(){
  io.enable('browser client minification');  // send minified client
	io.enable('browser client etag');          // apply etag caching logic based on version number
	io.enable('browser client gzip');          // gzip the file
	io.set('log level', 1);                    // reduce logging
	var RedisStore = require('socket.io/lib/stores/redis');
	io.set('store', new RedisStore({redisPub:pub, redisSub:sub, redisClient:store}));
});

app.listen(process.env.PORT || 80, ready);

function handler(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var index = fs.createReadStream(path.join(__dirname, 'index.html'));
  index.pipe(res);
}

function ready() {
  if(!process.env.PORT)
  require('child_process').exec('/home/ubuntu/addelb.sh',
    function(err, stdout, stderr) {
      if(err) {
        console.error('Error exec add to ELB : ', err);
      }
      else {
        console.log('Add to ELB DONE.');
      }
    });
}

io.on('connection', function(socket) {
  var id = crypto.randomBytes(20).toString('hex');
  var user = {id: id, name: 'noname'};
  socket.set('user', user);
  socket.on('sendMessage', function(data) {
    socket.get('user', function(err, user) {
      socket.broadcast.emit('bcMsg', {from: user, msg: data.msg});
    });
  });
  socket.on('setUsername', function(data) {
    socket.get('user', function(err, user) {
      user.name = data.name;
      socket.broadcast.emit('onUserConnect', {user: user});
      socket.set('user', user);
    });
  });
  
});





