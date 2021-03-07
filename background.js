let authorization_tab;
let username = userid = "";

// If token exists already, just get the user info
if(document.cookie.split('; ').find(row => row.startsWith('_a_tok='))){
    GetUserInfo();
    console.log('user already exists.');
}





// Get authorization code
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    
    // Authorization
    if(req.message === "Authorize"){
        client_id = req.client_id;
        code_verifier = req.code_challenge;
        const auth_url = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${req.client_id}&code_challenge=${req.code_challenge}`;
        chrome.tabs.create({url: auth_url}, (tab) => {authorization_tab = tab.id;});
        chrome.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
            if(tabID == authorization_tab){
                if(tab.url.includes('myanimelist') && tab.url.includes('code=')){
                    let auth_code = tab.url.split('code=')[1];
                    GetAuthToken(auth_code, req.client_id, req.code_challenge);
                    chrome.tabs.remove(authorization_tab);
                }
            }
        })
    }


    // UserGetMe
    if(req.message === "UserMe"){

        if((username != "") && (userid != "")){
            sendResponse({"name": username, "id": userid});
        }
        else
        {
            GetUserInfo().then(() => {sendResponse({"name": username, "id": userid})});
        }
    }

    return true;
});



// Encode to conform
const encodeParameters = p => Object.entries(p).map(kv => kv.map(encodeURIComponent).join("=")).join("&");

// Gets user's information
async function GetUserInfo(sender){
    const options = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + document.cookie.split('; ').find(row => row.startsWith('_a_tok=')).split('=')[1]
        }
    }

    const u_res = await fetch('https://api.myanimelist.net/v2/users/@me', options);
    const json = await u_res.json();
    username = json.name;
    userid = json.id;

}



// Exchanges auth_code to auth_token and refresh_token
async function GetAuthToken(code, cid, cc){
    const auth_res = await fetch('https://myanimelist.net/v1/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: encodeParameters({
            client_id: cid,
            code: code,
            code_verifier: cc,
            grant_type: "authorization_code"
        })
    });

    const json = await auth_res.json();
    let a_tok = json.access_token;
    let expiry = json.expires_in;
    let ref_tok = json.refresh_token;

    document.cookie = "_a_tok=" + a_tok + ";max-age=" + (Date.now()/1000 + expiry);
    document.cookie = "_ref_tok=" + ref_tok + ";max-age=" + (Date.now()/1000 + expiry);
}


// console.log(document.cookie.includes('_c_ver'));