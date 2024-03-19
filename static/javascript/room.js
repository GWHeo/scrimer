var link = document.getElementById('invite-link').value;
var copyBtn = document.getElementById('copy-button');
var myProfileIcon = document.getElementById('my-profile-icon');
var myProfileGameName = document.getElementById('my-profile-gamename');
var myProfileTag = document.getElementById('my-profile-tag');
var myTierIcon = document.getElementById('my-detail-tier');
var myTierText = document.getElementById('my-detail-tier-text');
var myMostIcon = document.getElementById('my-detail-most');
var myMostText = document.getElementById('my-detail-most-text');
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
    var detail = await detailResponse.json();
    //var detail = JSON.parse(detailJson);
    var profileIconSrc = profileIconUrl + `/${detail.profileIconId}.png`;

    // store champion json
    var champResponse = await requestGet(champJsonUrl);
    var champJson = await champResponse.json();
    champions = toList(champJson.data);

    // store images
    await storeImages();
    var img = document.getElementById('my-detail-lane');
    img.src = localImages['lane_bot'];

    // profile
    myProfileIcon.src = profileIconSrc;
    myProfileGameName.innerHTML = detail.gameName;
    myProfileTag.innerHTML = '#' + detail.tag;

    // tier
    await setRankIcon(myTierIcon, myTierText, detail.rank)

    // most
    await setChampIcon(myMostIcon, myMostText, champions, detail.most);

})();

