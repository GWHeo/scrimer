async function validateUserName() {
    var gameName = document.getElementById('gamename').value;
    var tag = document.getElementById('tag').value;
    var roomIdInput = document.getElementById('room-id');
    var form = document.getElementById('enter-room');
    var button = document.getElementById('enter-button');

    button.innerHTML = spinnerDOM();
    button.disabled = true;
    userInfo = await fetchUserInfo(gameName, tag, role, roomIdInput.value);
    if (userInfo.status == 200) {
        var data = await userInfo.json()
        roomIdInput.value = data['roomId'];
        form.submit();
    } else if (userInfo.status == 302) {
        var data = await userInfo.json();
        if (role == 'creator'){
            window.alert('이미 생성된 방이 있습니다!')
        }
        roomIdInput.value = data['roomId'];
        form.submit();
    } else if (userInfo.status == 400) {
        window.alert('닉네임과 태그를 모두 입력해주세요.')
    } else {
        window.alert("사용자를 찾을 수 없습니다.");
    }
    button.innerHTML = '생성';
    button.disabled = false;
}