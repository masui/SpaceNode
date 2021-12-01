var net = require('net');
const { execSync } = require('child_process')

var Gyazo = require('gyazo-api');

serverdata = ''
code = null

var server = net.createServer(function(conn){
    console.log('server-> tcp server created');
    
    conn.on('data', function(data){
	console.log('server data-> ' + data)
	console.log(' from ' + conn.remoteAddress + ':' + conn.remotePort);
	conn.write('server -> Repeating: ' + data);

	serverdata = data
	url = data.toString().split(/ /)[1]
	a = url.match(/code=(.*)$/)
	code = a[1]
	console.log(`code = ${code}`)
	
	const stdout = execSync(cmd)
	console.log(`stdout: ${stdout.toString()}`)

	if(code == null){
	    var GYAZO_TOKEN = process.env['GYAZO_TOKEN']
	    console.log(`GYAZO_TOKEN = ${GYAZO_TOKEN}`)

	    var gyazoclient = new Gyazo(GYAZO_TOKEN);
	    
	    //gyazoclient.upload('/Users/masui/tmp/20211002_170017.jpg', {
	    console.log('try to upload-----------')
	    gyazoclient.upload('/Users/masui/Desktop/safe_image.jpeg', {
		title: "my picture",
		desc: "upload from nodejs"
	    })
		.then(function(res){
		    console.log(res.data.image_id);
		    console.log(res.data.permalink_url);
		})
		.catch(function(err){
		    console.error(err);
		});
	}
	
    });

    conn.on('close', function(){
	console.log('server-> client closed connection');
    });
}).listen(80);

console.log('listening on port 80');


var client = new net.Socket();
client.setEncoding('utf8');

client.connect('80', 'localhost', function(){
    console.log('client-> connected to server');
    // client.write('Who needs a browser to communicate?');

    gyazo_client_id = "USECCHCZuVIN3DykF7Ixvy_wR93NqoUWlcMkQK2EoYM"     // Space.app用のID
    gyazo_client_secret = "7qcQynnsvWh_AZ78Lp-ZCvPkADG48ZH6jHsKcBpM0t0"
    gyazo_callback_url = "http://localhost/"
    
    cmd = `open 'https://gyazo.com/oauth/authorize?client_id=${gyazo_client_id}&redirect_uri=${gyazo_callback_url}&response_type=code'`

    console.log('execSync(cmd)')
    const stdout = execSync(cmd)
    console.log(`stdout: ${stdout.toString()}`)
    
});

process.stdin.resume(); // 何これ?

// process.stdin.on('data', function(data){
//   client.write(data);
// });
// 

client.on('data', function(data){
    console.log('client-> ' + data);
});

client.on('close', function(){
    console.log('client-> connection is closed');
});

console.log(serverdata)
