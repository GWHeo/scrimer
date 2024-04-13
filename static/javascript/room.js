var link = document.getElementById('invite-link').value;
var copyBtn = document.getElementById('copy-button');
var myProfileIcon = document.getElementById('my-profile-icon');
var myProfileGameName = document.getElementById('my-profile-gamename');
var myProfileTag = document.getElementById('my-profile-tag');
var myTierIcon = document.getElementById('my-detail-tier');
var myTierText = document.getElementById('my-detail-tier-text');
var myMost1Icon = document.getElementById('my-detail-most1');
var myMost1Text = document.getElementById('my-detail-most1-text');
var myMost2Icon = document.getElementById('my-detail-most2');
var myMost2Text = document.getElementById('my-detail-most2-text');
var myMost3Icon = document.getElementById('my-detail-most3');
var myMost3Text = document.getElementById('my-detail-most3-text');
var champions = '';

copyBtn.addEventListener('click', async function() {
    const tooltip = bootstrap.Tooltip.getInstance('#copy-button');
    window.navigator.clipboard.writeText(link);
    copyBtn.innerHTML = `<i class="bi bi-check-lg"></i>`;
    tooltip.setContent({'.tooltip-inner': '복사 완료!'});
    await sleep(5);
    copyBtn.innerHTML = `<i class="bi bi-copy"></i>`;
    tooltip.setContent({'.tooltip-inner': '복사하기'});
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

async function leaveChannel() {
    if (confirm('채널에서 퇴장하시겠습니까? 방장인 경우 방이 삭제됩니다.')) {
        chatSocket.close(1000);
        window.location.href = '/';
    }
}

(async () => {
    var detailResponse = await requestGet(userDetailUrl);
    switch(detailResponse.status) {
        case 404:
            alert('사용자를 찾을 수 없습니다. 다시 참여해 주세요.');
            window.location.href = '/';
            break;
        case 500:
            alert('서버오류입니다. 잠시 후 다시 시도해주세요.');
            window.location.href = '/';
            break;
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
        setChampIcon(myMost1Icon, myMost1Text, champions, detail.most1),
        setChampIcon(myMost2Icon, myMost2Text, champions, detail.most2),
        setChampIcon(myMost3Icon, myMost3Text, champions, detail.most3)
    ]

    var initMyDetails = await Promise.all(
        promises.map(async (promise) => {
            await promise;
        })
    )

    // lane
    await changeMyLane(true);

    // set participant card
    await setOldUsers();
    await sendNewUser();

})();
