async function setLeaderRspModal(step) {
    var modalLabel = document.getElementById('leader-rsp-modal-label');
    var modalBody = document.getElementById('leader-rsp-modal-body');
    modalLabel.innerHTML = '가위바위보 선택';
    modalBody.innerHTML = `
        <div class="row justify-content-center align-items-center">
            <div class="col">
                <div class="rsp-card" id="rsp-scissor" onclick="selectRsp('rsp-scissor');">
                    <p class="fs-rsp">✌</p>
                </div>
            </div>
            <div class="col">
                <div class="rsp-card" id="rsp-rock" onclick="selectRsp('rsp-rock');">
                    <p class="fs-rsp">✊</p>
                </div>
            </div>
            <div class="col">
                <div class="rsp-card" id="rsp-paper" onclick="selectRsp('rsp-paper');">
                    <p class="fs-rsp">🖐</p>
                </div>
            </div>
        </div>
        <input type="hidden" id="rsp-selected-value">
    `;

    var timerConsole = document.getElementById('rsp-timer');
    var setTimer = 5000;
    var timer = rspTimer(setTimer);
    setTimeout(function () {
        clearInterval(timer)
        var selected = document.getElementById('rsp-selected-value');
        //console.log(selected.value)
    }, setTimer);
}

function selectRsp(id) {
    var cards = document.getElementsByClassName('rsp-card');
    var targetCard = document.getElementById(id);
    var hiddenInput = document.getElementById('rsp-selected-value')

    for (let i=0; i<cards.length; i++) {
        if (cards[i].classList.contains('rsp-card-selected')){
            cards[i].classList.remove('rsp-card-selected');
        }
    }
    targetCard.classList.add('rsp-card-selected');
    if (id.includes('rock')) {
        hiddenInput.value = 'rock';
    }
    if (id.includes('scissor')) {
        hiddenInput.value = 'scissor';
    }
    if (id.includes('paper')) {
        hiddenInput.value = 'paper';
    }
}

function rspTimer(time) {
    var timerConsole = document.getElementById('rsp-timer');
    var interval = 1000; // milliseconds
    var secondsLeft = time;
    timerConsole.innerHTML = `${Math.floor(secondsLeft/1000)}`;
    var timer = setInterval(function() {
        secondsLeft -= interval;
        timerConsole.innerHTML = `${Math.floor(secondsLeft/1000)}`;
    }, interval);
    return timer;
}