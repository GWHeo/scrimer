async function validateUserName() {
    var gameName = document.getElementById('gamename').value;
    var tag = document.getElementById('tag').value;
    var roomIdInput = document.getElementById('room-id');
    var form = document.getElementById('enter-room');
    var button = document.getElementById('enter-button');

    button.innerHTML = spinnerDOM();
    button.disabled = true;
    //userInfo = await fetchUserInfo(gameName, tag, role, roomIdInput.value);
    userInfo = await requestPost(userInfoUrl, {
        'gameName': gameName,
        'tag': tag,
        'userRole': role,
        'roomId': roomIdInput.value
    })
    switch(userInfo.status) {
        case 200:
            var data = await userInfo.json()
            roomIdInput.value = data['roomId'];
            form.submit();
            break;
        case 302:
            var data = await userInfo.json();
            if (role == 'creator'){
                window.alert('이미 생성된 방이 있습니다!')
            } else {
                window.alert('이미 참여 중인 방입니다!')
            }
            roomIdInput.value = data['roomId'];
            form.submit();
            break;
        case 400:
            window.alert('닉네임과 태그를 모두 입력해주세요.');
            break;
        case 404:
            window.alert('생성된 방이 없습니다.');
            break;
        case 500:
            window.alert('서버 오류');
        default:
            window.alert("사용자를 찾을 수 없습니다.");
    }

    button.innerHTML = '생성';
    button.disabled = false;
}