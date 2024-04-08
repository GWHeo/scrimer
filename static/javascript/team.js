var isTeamBoardHeightSet = false;

function setTeamBoardHeight() {
    var cards = document.getElementsByClassName('participant-card');
    var cardHeight = cards[0].offsetHeight;

    var teamBoards = document.getElementsByClassName('team-board');
    for (let i=0; i<teamBoards.length; i++) {
        teamBoards[i].style.height = `${cardHeight * 5}px`;
    }
    isTeamBoardHeightSet = true;
}

function moveUserCardToTeamBoard(userId, team) {
    var participantBoard = document.getElementById('participant-board');
    var teamBoard = document.getElementsByClassName(`team-board-${team}`)[0]
    var userCard = document.getElementById(`card-user-${userId}`);
    participantBoard.removeChild(userCard);
    teamBoard.appendChild(userCard);
}

function setTeamSelectBtn(step) {
    var selectMaximum = 0;
    var selectedUsers = 0;
    switch(step) {
        case 2:
            if (rspMe.team == 'blue') {
                selectMaximum = 1;
            } else {
                return
            }
            break;
        case 3:
            if (rspMe.team == 'red') {
                selectMaximum = 2;
            } else {
                return
            }
        case 4:
            if (rspMe.team == 'blue') {
                selectMaximum = 2;
            } else {
                return
            }
        case 5:
            if (rspMe.team == 'red') {
                selectMaximum = 2;
            } else {
                return
            }
        case 6:
            if (rspMe.team == 'blue') {
                selectMaximum = 1;
            } else {
                return
            }
    }
    var participantBoard = document.getElementById('participant-board');
    var varStorage = document.createElement('div');
    varStorage.id = 'draft-variable-storage';
    varStorage.innerHTML = `
        <input type="hidden" id="draft-select-maximum" value="${selectMaximum}">
        <input type="hidden" id="draft-selected-users" value="${selectedUsers}">
    `;
    participantBoard.appendChild(varStorage);
    var userCards = participantBoard.children;
    for (let i=0; i<userCards.length; i++) {
        var cardUserId = userCards[i].id.split('-').pop();
        if (userCards[i].id == `card-user-${cardUserId}` && !userCards[i].classList.contains('participant-card-leader')){
            var el = document.createElement('div');
            el.classList.add('form-check', 'm-2', 'draft-select-input-div');
            el.innerHTML = `
                <input class="form-check-input draft-select-input" type="checkbox" value="${cardUserId}" id="draft-select-${cardUserId}" onchange="selectTeamUser(${cardUserId}, ${step})">
                <label class="form-check-label" for="draft-select-${cardUserId}">선택</label>
            `;
            userCards[i].appendChild(el);
        }
    }
}

function selectTeamUser(cardUserId, step) {
    var selectMaximum = document.getElementById('draft-select-maximum');
    var selectedUsers = document.getElementById('draft-selected-users');
    var checkbox = document.getElementById(`draft-select-${cardUserId}`);
    var participantBoard = document.getElementById('participant-board');
    var userCards = participantBoard.children;
    if (checkbox.checked) {
        selectedUsers.value = Number(selectedUsers.value) + 1;
        if (selectedUsers.value == selectMaximum.value) {
            for (let i=0; i<userCards.length; i++) {
                var userCardCheckbox = document.getElementById(`draft-select-${cardUserId}`);
                if (!userCardCheckbox.checked) {
                    userCardCheckbox.disabled = true;
                }
            }
            var confirmBtn = document.createElement('div');
            confirmBtn.classList.add('d-flex', 'm-2', 'justify-content-center', 'align-items-center');
            confirmBtn.setAttribute('id', 'draft-pick-confirm-button')
            confirmBtn.innerHTML = `
                <button class="btn btn-warning" onclick="sendTeamSelect(${step})">뽑기</button>
            `;
            participantBoard.parentElement.appendChild(confirmBtn);
        }
    } else {
        selectedUsers.value = umber(selectedUsers.value) - 1;;
        for (let i=0; i<userCards.length; i++) {
            var userCardCheckbox = document.getElementById(`draft-select-${cardUserId}`);
            if (userCardCheckbox.disabled == true) {
                userCardCheckbox.disabled = false;
            }
        }
    }
}

async function sendTeamSelect(step) {
    var checkboxes = document.getElementsByClassName('draft-select-input');
    var selected = [];
    var userNames = [];
    for (let i=0; i<checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            selected.push(checkboxes[i].value)
            var cardUserName = document.getElementById(`game-name-${checkboxes[i].value}`).value;
            userNames.push(cardUserName);
        }
    }
    await wsSend('draftPick', {
        'step': Number(Number(step) + 1),
        'userId': rspMe.id,
        'team': rspMe.team,
        'teamName': rspMe.teamName,
        'cardUserIds': selected,
        'cardUserNames': userNames
    })
    console.log(Number(Number(step) + 1))
    // initialize
    var selectDivs = document.getElementsByClassName('draft-select-input-div');
    for (let i=0; i<selectDivs.length; i++) {
        selectDivs[i].remove();
    }
    var varStorage = document.getElementById('draft-variable-storage');
    varStorage.remove();
    var pickBtn = document.getElementById('draft-pick-confirm-button');
    pickBtn.remove();
}