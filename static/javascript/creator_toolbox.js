function editMaxParticipants() {
    var editBtn = document.getElementById('edit-max-participants');
    var submitBtn = document.getElementById('submit-max-participants');
    var input = document.getElementById('max-participants');
    editBtn.disabled = true;
    submitBtn.disabled = false;
    input.readOnly = false;
    input.focus();
}

async function submitMaxParticipants() {
    var submitBtn = document.getElementById('submit-max-participants');
    var input = document.getElementById('max-participants');
    if (input.value < 2 || input.value >10) {
        alert('최대인원은 2인 이상 10인 이하로 입력해야합니다.');
        return;
    }
    submitBtn.disabled = true;
    submitBtn.innerHTML = spinnerDOM();
    input.readOnly = true;
    await wsSend('changeMaxParticipants', {
        'value': input.value
    });
}

function applyMaxParticipants(value) {
    var editBtn = document.getElementById('edit-max-participants');
    var submitBtn = document.getElementById('submit-max-participants');
    var input = document.getElementById('max-participants');
    editBtn.disabled = false;
    submitBtn.innerHTML = '적용';
    input.value = value;
}

function showLeaderCheckBox() {
    var leaderCheckBoxes = document.getElementsByClassName('leader-check-box');
    for (let i=0; i<leaderCheckBoxes.length; i++) {
        var classList = leaderCheckBoxes[i].classList;
        if (classList.contains('d-none')) {
            classList.remove('d-none');
        }
    }
}

function hideLeaderCheckBox() {
    var leaderCheckBoxes = document.getElementsByClassName('leader-check-box');
    for (let i=0; i<leaderCheckBoxes.length; i++) {
        var classList = leaderCheckBoxes[i].classList;
        if (!classList.contains('d-none')) {
            classList.add('d-none');
        }
    }
}

function setDraftConsole() {
    var creatorToolBoxStep1 = document.getElementById('divide-method-toolbox-select-leader');
    var creatorToolBoxStep2 = document.getElementById('divide-method-toolbox-select-first');
    var creatorToolBoxStep2Btn = document.getElementById('divide-method-toolbox-select-first-btn');
    var creatorToolBoxCount = document.getElementById('selected-leader-count');
    var creatorToolBoxCheck = document.getElementById('select-leader-check');

    var checkboxes = document.getElementsByName('card-tool-set-leader');
    var counter = 0;
    var isFull = false;
    for (let i=0; i<checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            counter += 1;
        }
        if (counter >= 2) {
            isFull = true;
        }
    }
    creatorToolBoxCount.innerHTML = counter;
    if (isFull) {
        for (let i=0; i<checkboxes.length; i++) {
            if (!checkboxes[i].checked) {
                checkboxes[i].disabled = true;
            }
        }
        creatorToolBoxCheck.classList.remove('d-none');
        creatorToolBoxStep1.classList.add('text-darker');
        creatorToolBoxStep2.classList.remove('text-darker');
        creatorToolBoxStep2Btn.disabled = false;
    } else {
        for (let i=0; i<checkboxes.length; i++) {
            if (!checkboxes[i].checked) {
                checkboxes[i].disabled = false;
            }
        }
        if (!creatorToolBoxCheck.classList.contains('d-none')) {
            creatorToolBoxCheck.classList.add('d-none');
            creatorToolBoxStep1.classList.remove('text-darker');
            creatorToolBoxStep2.classList.add('text-darker');
            creatorToolBoxStep2Btn.disabled = true;
        }
    }
}

function setDivideMethodToolBox(method) {
    var element = '';
    switch(method) {
        case 'draft':
            element = getDraftToolBoxEl();
            showLeaderCheckBox();
            break;
        case 'random':
            element = getRandomToolBoxEl();
            hideLeaderCheckBox();
            break;
    }

    var toolboxDiv = document.getElementById('divide-method-toolbox');
    toolboxDiv.innerHTML = element;
    if (method == 'draft') {
        setDraftConsole();
    }
    divideMode = method;
}

function draftStepText(step) {
    var text = '';
    switch(step) {
        case 0:
            text = '팀 뽑기 대기중 ...'
            break;
        case 1:
            text = '(드래프트) 주장끼리 선 정하는 중 ...'
            break;
        case 2:
            text = '(드래프트) 주장끼리 팀원 뽑는 중 ...'
            break;
        case 3:
            text = '(드래프트) 팀 선정 완료!'
            break;
    }
    return text
}

function setDraftStatus(step) {
    var creatorToolBoxStep2 = document.getElementById('divide-method-toolbox-select-first');
    var creatorToolBoxStep2Btn = document.getElementById('divide-method-toolbox-select-first-btn');
    var creatorToolBoxStep2Check = document.getElementById('select-first-check');
    var stopDraftBtn = document.getElementById('stop-draft-btn');
    var statusCircle = document.getElementById('status-circle');
    var statusConsole = document.getElementById('status-console');

    switch(step) {
        case 0:
            if (isCreator) {
                creatorToolBoxStep2.classList.remove('text-darker');
                creatorToolBoxStep2Btn.classList.remove('d-none');
                creatorToolBoxStep2Check.classList.add('d-none');
                stopDraftBtn.classList.add('d-none');
            }

            statusCircle.classList.remove('text-warning');
            statusCircle.classList.add('text-danger');
            statusConsole.innerHTML = draftStepText(0)
            break;
        case 1:
            if (isCreator) {
                creatorToolBoxStep2.classList.add('text-darker');
                creatorToolBoxStep2Btn.classList.add('d-none');
                creatorToolBoxStep2Check.classList.remove('d-none');
                stopDraftBtn.classList.remove('d-none');
            }

            statusCircle.classList.remove('text-danger');
            statusCircle.classList.add('text-warning');
            statusConsole.innerHTML = draftStepText(1)
            break;
    }
}

async function startDraftPick() {
    await wsSend('draftPick', {
        'step': 1
    });
}

async function stopDraftPick() {
    if (confirm('팀 뽑기가 진행중입니다. 중지하시겠습니까? 팀 현황이 초기화됩니다.')) {
        await wsSend('draftPick', {
            'step': 0
        });
    }
}