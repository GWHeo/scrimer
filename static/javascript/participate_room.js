async function validateLink() {
    var LinkInput = document.getElementById('link-input');
    var button = document.getElementById('participate-button');
    var form = document.getElementById('validate-room');
    var roomIdInput = document.getElementById('room-id');

    button.innerHTML = spinnerDOM();
    button.disabled = true;
    // roomInfo = await fetchRoomInfo(LinkInput.value);
    roomInfo = await requestPost(roomInfoUrl, {
        'link': LinkInput.value
    })
    status = roomInfo.status;
    if(status == 200) {
        var data = await roomInfo.json();
        // jquery
        $('#validateLinkModal').modal('hide');
        $('#userNameModal').modal('show');
        roomIdInput.value = data['roomId'];
    } else if (status == 400) {
        window.alert('초대 링크를 입력하세요.')
    } else if (status == 403) {
        window.alert('잘못 된 접근입니다.')
    }
    else {
        window.alert('생성 된 방을 찾을 수 없습니다.')
    }
    button.innerHTML = '입장';
    button.disabled = false;
}

window.onload = function() {
    if (isLinkAccess) {
        $('#userNameModal').modal('show');
        changeRole('participant');
    }
}
