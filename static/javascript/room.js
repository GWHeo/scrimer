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

async function sendNewUser() {
    await wsSend('newUser', null)
}

async function setOldUsers() {
    var response = await requestGet(fetchOldUsersUrl);
    var dataList = await response.json();
    dataList.forEach((data) => {
        newUser(data);
    })
}

(async () => {
    var detailResponse = await requestGet(userDetailUrl);
    if (detailResponse.status == 404) {
        alert('사용자를 찾을 수 없습니다. 다시 참여해 주세요.');
        window.location.href = '/';
    }
    var detail = await detailResponse.json();
    //var detail = JSON.parse(detailJson);
    var profileIconSrc = profileIconUrl + `/${detail.profileIconId}.png`;

    // store champion json
    var champResponse = await requestGet(champJsonUrl);
    var champJson = await champResponse.json();
    champions = toList(champJson.data);

    // store images
    await storeImages();

    // profile
    myProfileIcon.src = profileIconSrc;
    myProfileGameName.innerHTML = detail.gameName;
    myProfileTag.innerHTML = '#' + detail.tag;

    var promises = [
        // tier
        setRankIcon(myTierIcon, myTierText, detail.rank),
        // most
        setChampIcon(myMostIcon, myMostText, champions, detail.most)
    ]

    var initMyDetails = await Promise.all(
        promises.map(async (promise) => {
            await promise;
        })
    )

    // lane
    changeMyLane(true);

    // set participant card
    await setOldUsers();
    await sendNewUser();

})();


