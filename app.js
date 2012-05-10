
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app);

var fs = require('fs')
  , path = require('path');

app.listen(process.env.PORT || 80, ready);

function handler(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var index = fs.createReadStream(path.join(__dirname, 'index.html'));
  index.pipe(res);
}

function ready() {
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



