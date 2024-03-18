var link = document.getElementById('invite-link').value;
var copyBtn = document.getElementById('copy-button');
var myProfileIcon = document.getElementById('my-profile-icon');
var myProfileGameName = document.getElementById('my-profile-gamename');
var myProfileTag = document.getElementById('my-profile-tag');
var myMostIcon = document.getElementById('my-detail-most');
var champions = '';

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
    var detailResponse = await requestGet(userDetailUrl);
    var detailJson = await detailResponse.json();
    var detail = JSON.parse(detailJson);
    var profileIconSrc = profileIconUrl + `/${detail['profileIconId']}.png`;

    var champResponse = await requestGet(champJsonUrl);
    var champJson = await champResponse.json();
    champions = toList(champJson.data);

    myProfileIcon.src = profileIconSrc;
    myProfileGameName.innerHTML = detail['gameName'];
    myProfileTag.innerHTML = '#' + detail['tag'];

    await setChampIcon(myMostIcon, champions, detail['most']);

})();
