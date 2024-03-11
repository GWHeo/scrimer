function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function createRoom() {
    var gameName = document.getElementById('maker-gamename').value;
    var tag = document.getElementById('maker-tag').value;
    var roomIdInput = document.getElementById('maker-room-id');
    var form = document.getElementById('create-room');
    var button = document.getElementById('create-button');

    button.innerHTML = spinnerDOM();
    button.disabled = true;
    userInfo = await fetchUserInfo(gameName, tag);
    if (userInfo.status == 200) {
        var data = userInfo.json()
        roomIdInput.value = data['roomId'];
        form.submit();
    } else if (userInfo.status == 302) {
        window.alert('이미 생성된 방이 있습니다!')
    } else if (userInfo.status == 400) {
        window.alert('닉네임과 태그를 모두 입력해주세요.')
    } else {
        window.alert("사용자를 찾을 수 없습니다.");
    }
    button.innerHTML = '생성';
    button.disabled = false;
}