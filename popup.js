const client_id = '0a2b7a0b78cdf64fb7b809c244ba8771';
var code_verifier, code_challenge;

// if cookies doesn't exist (first time) make generate code_verifier
if(!document.cookie.includes('_c_ver=')){
    document.cookie = '_c_ver=' + GenerateRandomString(128);
}
code_verifier = code_challenge = document.cookie.split('; ').find(row => row.startsWith('_c_ver=')).split('=')[1];


// if auth_tok doesn't exist
if(!document.cookie.includes('_a_tok')){
    ToAuthorize();
}
else {
    console.log('we have');
    document.querySelector('#authorization').hidden = true;
    document.querySelector('#authorized').hidden = false;
    SetUserInfo();
}







// events
document.querySelector('#auth').addEventListener("click", () => {
    chrome.runtime.sendMessage({message: "Authorize", client_id: client_id, code_challenge: code_challenge});
})








// functions
function SetUserInfo(){
    chrome.runtime.sendMessage({message: "UserMe"}, res => {
        document.querySelector('#username').textContent = res.name;
        document.querySelector('#userid').textContent = res.id;
    });
}

function ToAuthorize(){
    document.querySelector('#authorized').hidden = true;
    document.querySelector('#authorization').hidden = false;
}

function GenerateRandomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}