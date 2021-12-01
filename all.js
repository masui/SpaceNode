//
// fetchの使いかた
// https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
//
// open
// https://www.npmjs.com/package/opn
//
const http = require('http');
const querystring = require('querystring');
//const opn = require('opn');
const open = require('open');
const url = require('url');

const fetch = require('node-fetch');

var code = ''

// localhostのサーバ立てる
const server = http.createServer(async (req, res) => {
    console.log(req.url)
    if (req.url.indexOf('code') > -1) {
	// acquire the code from the querystring, and close the web server.
	const qs = querystring.parse(url.parse(req.url).query);
	console.log(`Code is ${qs.code}`);
	code = qs.code
	res.end('Authentication successful! Please return to the console.');
	server.close();

	run(code)

	// process.exit(0)
    }
}).listen(80, () => {
    // open the browser to the authorize url to start the workflow
    
    // opn(authorizeUrl);
});

// const { execSync } = require('child_process')

gyazo_client_id = "USECCHCZuVIN3DykF7Ixvy_wR93NqoUWlcMkQK2EoYM" // Space.app用のID
gyazo_client_secret = "7qcQynnsvWh_AZ78Lp-ZCvPkADG48ZH6jHsKcBpM0t0"
gyazo_callback_url = "http://localhost/"

// これはNodeで書くべきな?
//cmd = `open 'https://gyazo.com/oauth/authorize?client_id=${gyazo_client_id}&redirect_uri=${gyazo_callback_url}&response_type=code'`

cmd = open(`https://gyazo.com/oauth/authorize?client_id=${gyazo_client_id}&redirect_uri=${gyazo_callback_url}&response_type=code`)

//console.log('execSync(cmd)')
//const stdout = execSync(cmd)

console.log(`code = ${code}`)

// Gyazoのアクセストークン取得
function run(code){
    console.log(`run code=${code}`)
    token_uri = 'https://gyazo.com/oauth/token'
    
    fetch(token_uri, {
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
	console.log(json.access_token);
    })
}

//    puts "response.body = #{response.body}"
//    set_gyazo_token JSON.parse(response.body)['access_token'] # responseはJSONで返る
//    dialog("Gyazoアクセストークンが生成されました。","OK",2)
//    log "gyazo_token = #{gyazo_token}"
