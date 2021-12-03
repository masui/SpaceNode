//
// fetchの使いかた
// https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
//
// open
// https://www.npmjs.com/package/opn
//
const http = require('http');
const querystring = require('querystring');
const open = require('open');
const url = require('url');
const path = require('path');
const fs = require('fs');
 


const fetch = require('node-fetch');

var appdir = path.dirname(process.argv[1])

// Gyazoトークンを調べる
//
var gyazo_token_path = appdir + '/gyazo_token'
var gyazo_token = null

if(fs.existsSync(gyazo_token_path)){
    const buff = fs.readFileSync(gyazo_token_path, "utf8");
    gyazo_token = buff.trim()
}
else{
    gyazo_token = get_gyazo_token()
}
console.log(`gyazo_token = ${gyazo_token}`)

function get_gyazo_token(){
    var code = ''
    
    // コールバックを受け取るためにlocalhostのサーバ立てる
    const server = http.createServer(async (req, res) => {
	console.log(req.url)
	if (req.url.indexOf('code') > -1) {
	    // acquire the code from the querystring, and close the web server.
	    const qs = querystring.parse(url.parse(req.url).query);
	    console.log(`Code is ${qs.code}`);
	    code = qs.code
	    res.end('Authentication successful! Please return to the console.');
	    server.close();
	    
	    var token = run(code)
	    console.log(`token = ${token}`)
	    
	    // process.exit(0)
	}
    }).listen(80, () => {
	// open the browser to the authorize url to start the workflow
	
	// opn(authorizeUrl);
    });
    
    gyazo_client_id = "USECCHCZuVIN3DykF7Ixvy_wR93NqoUWlcMkQK2EoYM" // Space.app用のID
    gyazo_client_secret = "7qcQynnsvWh_AZ78Lp-ZCvPkADG48ZH6jHsKcBpM0t0"
    gyazo_callback_url = "http://localhost/"

    open(`https://gyazo.com/oauth/authorize?client_id=${gyazo_client_id}&redirect_uri=${gyazo_callback_url}&response_type=code`)

    var gyazo_token = ''
    
    async function run(code){
	console.log(`run code=${code}`)
	token_uri = 'https://gyazo.com/oauth/token'
	
	await fetch(token_uri, {
	    method: 'POST',
	    headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
	    },
	    body: querystring.stringify({
		'client_id': gyazo_client_id,
		'client_secret': gyazo_client_secret,
		'code': code,
		'grant_type': 'authorization_code',
		'redirect_uri': gyazo_callback_url,
	    })
	}).then(function(res) {
	    return res.json();
	}).then(function(json) {
	    gyazo_token = json.access_token
	    try {
		fs.writeFileSync(gyazo_token_path,gyazo_token + "\n")
		console.log('write end');
		console.log(`gyazo_token === ${gyazo_token}`)
	    }catch(e){
		console.log(e);
	    }
	})
    }

    return gyazo_token
}
