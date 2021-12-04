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
 
var Gyazo  = require('gyazo-api');

const gyazo_client_id = "USECCHCZuVIN3DykF7Ixvy_wR93NqoUWlcMkQK2EoYM" // Space.app用のID
const gyazo_client_secret = "7qcQynnsvWh_AZ78Lp-ZCvPkADG48ZH6jHsKcBpM0t0"
const gyazo_callback_url = "http://localhost/"

const appdir = path.dirname(process.argv[1])
const gyazo_token_path = appdir + '/gyazo_token'
var gyazo_token = null

async function get_gyazo_token_and_upload(image,title,desc){
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
	    
	    var token = await run(code)
	    console.log(`token = ${token}`)
	}
    }).listen(80, () => {
	// open the browser to the authorize url to start the workflow
	
	// opn(authorizeUrl);
	open(`https://gyazo.com/oauth/authorize?client_id=${gyazo_client_id}&redirect_uri=${gyazo_callback_url}&response_type=code`)
    });
    
    async function run(code){
	console.log(`run code=${code}`)
	token_uri = 'https://gyazo.com/oauth/token'
	
	res = await fetch(token_uri, {
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

	    upload_gyazo_with_token(image,gyazo_token,title,desc)
	})
	
	return gyazo_token
    }
}

function upload_gyazo_with_token(image,token,title,desc){
    var gyazo_client = new Gyazo(token);
    gyazo_client.upload(image, {
	title: title,
	desc: desc
    }).then(function(res){
	console.log(res.data.image_id);
	console.log(res.data.permalink_url);
    }).catch(function(err){
	console.error(err);
    });
}

function upload_gyazo(image,title,desc){
    if(fs.existsSync(gyazo_token_path)){
	const buff = fs.readFileSync(gyazo_token_path, "utf8");
	gyazo_token = buff.trim()
	
	upload_gyazo_with_token(image,gyazo_token,title,desc)
    }
    else{
	gyazo_token = get_gyazo_token_and_upload(image,title,desc)
    }
}

console.log(`------- gyazo_token = ${gyazo_token}`)

upload_gyazo('/Users/masui/Desktop/rect.png','RECT','RECT_DESC')
