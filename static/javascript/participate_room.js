async function validateLink() {
    var roomCodeInput = document.getElementById('room-code-input');
    var button = document.getElementById('participate-button');
    var form = document.getElementById('validate-room');
    var roomIdInput = document.getElementById('participant-room-id');

    button.innerHTML = spinnerDOM();
    button.disabled = true;
    roomInfo = await fetchRoomInfo(roomCodeInput.value);
    status = roomInfo.status;
    if(status == 200) {
        var data = await roomInfo.json();
        roomIdInput.value = data['roomId'];
        // jquery
        $('#validateRoomModal').modal('hide');
        $('#participateRoomModal').modal('show');
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
        console.log($('#participateRoomModal'))
        $('#participateRoomModal').modal('show');
    }
}
