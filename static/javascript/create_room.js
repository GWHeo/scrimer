function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function createRoom() {
    var gameName = document.getElementById('maker-gamename').value;
    var tag = document.getElementById('maker-tag').value;
    var form = document.getElementById('create-_room');
    var button = document.getElementById('create-button');

    button.innerHTML = spinnerDOM();
    button.disabled = true;
    userInfo = await fetchUserInfo(gameName, tag);
    if (userInfo.status == 200) {
        window.alert('success')
        //form.submit();
    } else {
        window.alert("사용자를 찾을 수 없습니다.");
    }
    button.innerHTML = '생성';
    button.disabled = false;
}