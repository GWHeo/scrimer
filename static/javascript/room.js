var link = document.getElementById('invite-link').value;
var copyBtn = document.getElementById('copy-button');
var myProfileIcon = document.getElementById('my-profile-icon');
var myProfileGameName = document.getElementById('my-profile-gamename');
var myProfileTag = document.getElementById('my-profile-tag');

function copyLink() {
    window.navigator.clipboard.writeText(link);
    copyBtn.innerHTML = `<i class="bi bi-check-lg"></i>`;
}

copyBtn.addEventListener('click', async function() {
    window.navigator.clipboard.writeText(link);
    copyBtn.innerHTML = `<i class="bi bi-check-lg"></i>`;
    await sleep(5);
    copyBtn.innerHTML = `<i class="bi bi-copy"></i>`;
});

(async () => {
    var response = await requestGet(userDetailUrl);
    var data_json = await response.json();
    var data = JSON.parse(data_json);
    var profileIconSrc = profileIconUrl + `/${data['profileIconId']}.png`;
    myProfileIcon.src = profileIconSrc;
    myProfileGameName.innerHTML = data['gameName'];
    myProfileTag.innerHTML = '#' + data['tag'];
})();
