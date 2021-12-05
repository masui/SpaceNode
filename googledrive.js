//
// fetchの使いかた
// https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
//
// open
// https://www.npmjs.com/package/opn
//
// asyncが全然無意味な気がする...
//

const http = require('http');
const querystring = require('querystring');
const open = require('open');
const url = require('url');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
//const filetype = require('file-type')
const mime = require('mime-types')

// import {filetype} from 'file-type';

 
const { google } = require('googleapis');

const appdir = path.dirname(process.argv[1])
const google_refresh_token_path = appdir + '/google_refresh_token'
var google_refresh_token = null

const client_id = "245084284632-v88q7r65ddine8aa94qp7ribop4018eg.apps.googleusercontent.com"
const client_secret = "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"

function upload_googledrive(file){
    if(fs.existsSync(google_refresh_token_path)){
	const buff = fs.readFileSync(google_refresh_token_path, "utf8");
	google_refresh_token = buff.trim()
	
	upload_googledrive_with_token(file,google_refresh_token)
    }
    else{
	get_google_refresh_token_and_upload(file)
    }
}

function upload_googledrive_with_token(file,token){
    console.log(`upload: token=${token}`)

    file = '/Users/masui/Desktop/rect.png';
    
    var oauth2Client = new google.auth.OAuth2(client_id, client_secret, "http://localhost/");
    oauth2Client.setCredentials({
	refresh_token: token
    });

    oauth2Client.refreshAccessToken(function(err,res){
	var drive = google.drive({ version: 'v3', auth: oauth2Client });
	drive.files.list({
	    //q: "title='Space'"
	    q: "name = 'Space' and mimeType = 'application/vnd.google-apps.folder' and parents in 'root'"
	},async function(err,res2){
	    var folderId = null

	    if(res2.data.files.length <= 0){ // Spaceフォルダが存在しない場合
		const fileMetadata = {
		    'name': 'Space', //作成したいフォルダの名前
		    'mimeType': 'application/vnd.google-apps.folder'
		};
		const params = {
		    resource: fileMetadata,
		    fields: 'id'
		}
		try {
		    const res = await drive.files.create(params);
		    console.log("folder created")
		    console.log(res.data);
		    folderId = res.data.id
		} catch (error) {
		    console.log(error);
		}
	    }
	    else {
		// Spaceという名前のフォルダを探してIDを取得する
		folderId = res2.data.files[0].id
	    }

	    const filename = path.basename(file)
	    
	    const params = {
		resource: {
		    name: filename,
		    parents: [folderId]
		},
		media: {
		    mimeType: mime.lookup(file),
		    body: fs.createReadStream(file)
		},
		fields: 'id'
	    };
	    
	    const res = drive.files.create(params);

	});
    });
}

const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    "http://localhost/"
);

// generate a url that asks permissions for Blogger and Google Calendar scopes
const scopes = [
  'https://www.googleapis.com/auth/drive'
];

const auth_url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',

  // If you only need one scope you can pass it as a string
  scope: scopes
});

console.log(oauth2Client)
console.log(auth_url)

upload_googledrive("/Users/masui/SpaceNode/googledrive.js")


async function get_google_refresh_token_and_upload(file){
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
	open(auth_url)
    });

    function run(code){
	console.log(`run code=${code}`)

	oauth2Client.getToken(code, function(err, tokens) {
	    console.log('トークンが発行されました');
	    console.log(tokens);
	    console.log('上記の情報を大切に保管してください');
	    
	    try {
		fs.writeFileSync(google_refresh_token_path,tokens.refresh_token + "\n")
		console.log('write end');
		google_refresh_token = tokens.refresh_token
		console.log(`google_refresh_token === ${google_refresh_token}`)
	    }catch(e){
		console.log(e);
	    }
	    
	    upload_googledrive_with_token(file,google_refresh_token)
	});
    }

    /*
    //token_uri = 'https://www.googleapis.com/auth/drive' // 全部許可
    token_uri = 'https://www.googleapis.com/auth/drive.file'

    //token_uri = 'https://www.googleapis.com/auth/token' // 全部許可
	    
    res = fetch(token_uri, {
	method: 'POST',
	headers: {
	    'Content-Type': 'application/x-www-form-urlencoded',
	},
	body: querystring.stringify({
	    'client_id': client_id,
	    'client_secret': client_secret,
	    'code': code,
	    'grant_type': 'authorization_code',
	    'redirect_uri': "http://localhost/"
	})
    }).then(function(res) {
	console.log(res)
	resjson = res.text()
	console.log(`res.json() = ${resjson}`)
	return resjson;
    }).then(function(json) {
	console.log(`json = ${json}`)
	//google_token = json.access_token
	//console.log(`google_token = ${google_token}`)
	if(false){
	    try {
		fs.writeFileSync(gyazo_token_path,gyazo_token + "\n")
		console.log('write end');
		console.log(`gyazo_token === ${gyazo_token}`)
	    }catch(e){
		console.log(e);
	    }
	    
	    upload_gyazo_with_token(image,gyazo_token,title,desc)
	}
    })
    */
    
    //return gyazo_token
}


