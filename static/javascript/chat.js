// chat box sizing & positioning
const rightContent = document.getElementById('right-content');
const footer = document.getElementById('footer');
const chatBubble = document.getElementById('chatBubble');
const chatBox = document.getElementById('chatBox');
const minimizeButton = document.getElementById('minimizeBtn');
const chatHeader = document.getElementById('chatHeader');
const chatBody = document.getElementById('chatBody');
const chatFooter = document.getElementById('chatFooter');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

function chatMarginSetting(breakPoint) {
    var innerWidth = window.innerWidth;
    var innerHeight = window.innerHeight;
    chatBubble.style.marginBottom = `${footer.offsetHeight}px`;
    chatBox.style.marginBottom = `${footer.offsetHeight}px`;
    if (innerWidth > breakPoint) {
        chatBubble.style.right = `${rightContent.offsetWidth}px`;
        chatBox.style.right = `${rightContent.offsetWidth}px`;
    } else {
        chatBubble.style.removeProperty('right');
        chatBox.style.removeProperty('right');
    }
}

function chatBodySizing() {
    var topMargin = document.getElementById('gnb').offsetHeight;
    var bottomMargin = document.getElementById('footer').offsetHeight;

    var contentHeight = innerHeight - topMargin - bottomMargin;
    if (contentHeight <= 400) {
        chatBody.style.height = `${contentHeight - chatHeader.offsetHeight - chatFooter.offsetHeight - 32}px`;
    } else {
        chatBody.style.height = '240px';
    }
}

chatMarginSetting(992);
chatBodySizing();

chatBubble.addEventListener('click', () => {
    chatBox.style.visibility = 'visible';
    chatBubble.style.visibility = 'hidden';
});

minimizeButton.addEventListener('click', () => {
    chatBox.style.visibility = 'hidden';
    chatBubble.style.visibility = 'visible';
});

chatInput.addEventListener('keyup', function(e) {
    if (e.keyCode == 13) {
        e.preventDefault();
        sendBtn.click();
    }
})

// chat message
async function sendMessage() {
    var text = chatInput.value;
    await wsSend('chat', text);
    chatInput.value = '';
    chatInput.focus();
    sendBtn.classList.remove('btn-theme');
    sendBtn.classList.add('btn-theme-outline');
    sendBtn.disabled = true;
}

function chatInputBtnControl() {
    if (chatInput.value == '' || chatInput.value == null) {
        sendBtn.classList.remove('btn-theme');
        sendBtn.classList.add('btn-theme-outline');
        sendBtn.disabled = true;
    } else {
        sendBtn.classList.remove('btn-theme-outline');
        sendBtn.classList.add('btn-theme');
        sendBtn.disabled = false;
    }
}

function parseMessage(data) {
    chatBody.innerHTML += messageHtml;
    var msgType = data.type;
    var msgStatus = data.status;
    var msgData = data.data;
    var userClass = '';
    var userType = '';

    if (msgType == 'system') {
        userClass = 'chat-user-system';
        userType = '(시스템)';
    } else if (msgType == 'chat') {
        if (msgData.owner) {
            userClass = 'chat-user-creator';
            userType = '(방장)';
        }
        switch(msgData.role) {
            case 'leader':
                userClass = 'chat-user-leader';
                userType = '(주장)';
                break;
            case 'participant':
                userClass = 'chat-user-participant';
                userType = '';
                break;
        }
    }

    var messageContainers = document.getElementsByClassName('chat-div');
    var container = messageContainers[messageContainers.length - 1];
    if (msgType != 'system') {
        container.classList.add('chat-message-wrapper')
        if (msgData.userId == user) {
            container.classList.add('my-chat');
        }
    }
    var children = container.children;
    for (let i=0; i<children.length; i++){
        if (children[i].classList.contains('chat-user')) {
            if (msgType != 'system') {
                children[i].classList.add(userClass);
                children[i].innerHTML = `${msgData.name}${userType}:`
            }
        }
        if (children[i].classList.contains('chat-message')) {
            if (msgType == 'system') {
                children[i].classList.add(userClass);
            }
            children[i].innerHTML = msgData.message;
        }
    }
    chatBody.scrollTo(0, chatBody.scrollHeight);
}

function setParticipantCard(data) {
    var html = `
        <div class="row m-2 align-items-center" id="profile-card-header-${data.userId}">
            <div class="col-auto">
                <img class="participant-profile-icon rounded-circle" src="${profileIconUrl}/${data.profileIconId}.png">
            </div>
            <div class="col-auto p-0">
                <div>
                    <span>${data.gameName}</span><span class="text-darker fs-small">#${data.tag}</span>
                    <input type="hidden" id="game-name-${data.userId}" value="${data.gameName}#${data.tag}">
                </div>
                <div class="d-inline-flex" id="card-user-badge-${data.userId}">
                </div>
            </div>
        </div>
        <div class="row m-2 justify-content-center align-items-center">
            <div class="col">
                <img class="participant-detail-icon" id="card-user-tier-${data.userId}" src="">
            </div>
            <div class="col">
                <img class="participant-detail-icon" id="card-user-most-${data.userId}" src="">
            </div>
            <div class="col">
                <img class="participant-detail-icon" id="card-user-lane-${data.userId}" src="">
            </div>
        </div>
    `;
    return html;
}

function setLeaderCheckbox(data) {
    var oldTools = document.getElementsByClassName('participant-card-leader');
    var toolDisable = '';
    if (oldTools.length == 2) {
        toolDisable = 'disabled';
    }
    var display = 'd-none';
    if (divideMode == 'draft') {
        display = '';
    }
    var html = `
        <div class="col-auto leader-check-box ${display}">
            <div class="form-check">
                <input class="from-check-input" type="checkbox" value="" name="card-tool-set-leader" id="card-tool-set-leader-${data.userId}" onclick="changeRole(${data.userId})" ${toolDisable}>
                <label class="form-check-label" for="card-tool-set-leader-${data.userId}">
                    주장
                </label>
            </div>
        </div>
    `;
    return html;
}

async function changeRole(userId) {
    var checkbox = document.getElementById(`card-tool-set-leader-${userId}`);
    var creatorToolBoxStep1 = document.getElementById('divide-method-toolbox-select-leader');
    var creatorToolBoxStep2 = document.getElementById('divide-method-toolbox-select-first');
    var creatorToolBoxStep2Btn = document.getElementById('divide-method-toolbox-select-first-btn');
    var creatorToolBoxCount = document.getElementById('selected-leader-count');
    var creatorToolBoxCheck = document.getElementById('select-leader-check');
    var role = 'participant';

    if (checkbox.checked) {
        role = 'leader';
    }
    await wsSend('changeRole', {
        'userId': userId,
        'role': role
    });
    setDraftConsole();
}

function changeCardBorder(data) {
    var card = document.getElementById(`card-user-${data.userId}`);
    if (data.role == 'leader') {
        card.classList.add('participant-card-leader');
    } else {
        card.classList.remove('participant-card-leader');
    }
}

function changeRoleBadge(data) {
    var roleBadgeDiv = document.getElementsByClassName(`user-role-${data.userId}`);
    var badgeEl = participantBadgeEl;
    if (data.role == 'leader') {
        badgeEl = leaderBadgeEl;
    }
    for (let i=0; i<roleBadgeDiv.length; i++) {
        roleBadgeDiv[i].innerHTML = badgeEl;
    }
}

function changeCardDetail(data) {
    var tierImg = document.getElementById(`card-user-tier-${data.userId}`);
    setRankIcon(tierImg, null, data.rank);
    var mostImg = document.getElementById(`card-user-most-${data.userId}`);
    setChampIcon(mostImg, null, champions, data.most);
    var laneImg = document.getElementById(`card-user-lane-${data.userId}`);
    setMainLane(laneImg, null, data.lane);
}

const board = document.getElementById('participant-board');
async function newUser(data) {
    if (document.getElementById(`card-user-${data.userId}`) != null) {
        return
    }
    var cardDiv = document.createElement("div");
    cardDiv.classList.add('participant-card', 'shadow', 'm-2', 'p-1', 'fs-small');
    cardDiv.id = `card-user-${data.userId}`;
    cardDiv.innerHTML = setParticipantCard(data);
    board.appendChild(cardDiv);

    var badge = document.getElementById(`card-user-badge-${data.userId}`);
    badge.innerHTML = '';
    if (data.owner) {
        badge.innerHTML += '<div>' + creatorBadgeEl + '</div>';
    }
    if (data.role == 'leader') {
        cardDiv.classList.add('participant-card-leader');
        badge.innerHTML += `<div class="user-role-${data.userId}">` + leaderBadgeEl + '</div>';
    }
    if (data.role == 'participant') {
        badge.innerHTML += `<div class="user-role-${data.userId}">` + participantBadgeEl + '</div>';
    }
    if (isCreator) {
        cardDiv.innerHTML += setLeaderCheckbox(data);
    }
    changeCardDetail(data);
}

function removeUser(data) {
    var cardDiv = document.getElementById(`card-user-${data.userId}`);
    cardDiv.remove();
}

function setRspWinner(user) {
    user.team = 'blue';
    user.teamName = '블루팀';
}
function setRspLooser(user) {
    user.team = 'red';
    user.teamName = '레드팀';
}
function setRspDraw(user1, user2) {
    user1.team = 'draw';
    user1.teamName = '무승부';
    user2.team = 'draw';
    user2.teamName = '무승부';
}

// websocket
var chatSocket;
var reconnectionAttempts = 0;
const maxReconnectionAttempts = 1800;
const reconnectionTimeInterval = 2000;

function startWebSocket() {
    chatSocket = new WebSocket(chatWsUrl);
    chatSocket.onmessage = handleWebSocketMessage;
    chatSocket.onclose = handleWebSocketClosure;
    chatSocket.onerror = handleWebSocketError;
    reconnectionAttempts = 0;
}

async function handleWebSocketMessage(event) {
    var data = JSON.parse(event.data);
    var message = data.message;
    switch(message.status) {
        case 'connect':
            message.data['message'] = `${message.data.gameName}#${message.data.tag}님이 입장했습니다.`;
            parseMessage(message);
            break;
        case 'disconnect':
            message.data['message'] = `${message.data.gameName}#${message.data.tag}님이 퇴장했습니다.`;
            parseMessage(message);
            removeUser(message.data);
            if (message.data['owner']) {
                chatSocket.close(1000);
                if (!isCreator){
                    alert('방장이 방을 나가 채널이 종료되었습니다.');
                }
                window.location.href = '/';
            }
            break;
        case 'onchange':
            if (message.type == 'chat') {
                parseMessage(message);
            }
            if (message.type == 'system') {
                changeCardDetail(message.data)
            }
            break;
        case 'newUser':
            await newUser(message.data);
            if (!isTeamBoardHeightSet) {
                setTeamBoardHeight();
            }
            break;
        case 'changeRole':
            switch(message.data.role) {
                case 'leader':
                    message.data['message'] = `${message.data.gameName}#${message.data.tag}님이 주장으로 선정되었습니다.`;
                    if (message.data.userId == user) {
                        myRole = 'leader';
                    }
                    break;
                case 'participant':
                    message.data['message'] = `${message.data.gameName}#${message.data.tag}님이 주장에서 제외되었습니다.`;
                    if (message.data.userId == user) {
                        myRole = 'participant';
                    }
                    break;
            }
            changeCardBorder(message.data);
            changeRoleBadge(message.data);
            parseMessage(message);
            break;
        case 'changeMaxParticipants':
            applyMaxParticipants(message.data.value);
            break;
        case 'draftPick':
            setDraftStatus(message.data.step);
            switch(message.data.step) {
                case -1:
                    break;
                case 0:
                    roomStatus = 'ready';
                    if (myRole == 'leader') {
                        // jquery
                        alert('드래프트 픽이 중지되었습니다.');
                        $('#leader-rsp-modal').modal('hide');
                    }
                    message.data['message'] = '팀 가르기(드래프트)가 중지되었습니다.';
                    parseMessage(message);
                    rspMe = resetRspUser();
                    rspCompetitor = resetRspUser();
                    break;
                case 1:
                    roomStatus = 'progress';
                    if (myRole == 'leader') {
                        if (document.getElementById('rsp-selected-value') == null) {
                            await setLeaderRspModal(message.data.step);
                         }
                        // jquery
                        $('#leader-rsp-modal').modal('show');
                    }
                    message.data['message'] = '팀 가르기(드래프트)가 시작되었습니다.';
                    parseMessage(message);
                    break;
                case 2:
                    message.data['message'] = `${message.data.userName}님이 ${message.data.teamName} 주장으로 결정되었습니다.`;
                    parseMessage(message);
                    moveUserCardToTeamBoard(message.data.userId, message.data.team);
                    if (message.data.userId == user) {
                        setTeamSelectBtn(2);
                    }
                    break;
                default:
                    for (let i=0; i<message.data.cardUserIds.length; i++) {
                        message.data['message'] = `${message.data.cardUserNames[i]}님이 ${message.data.teamName}으로 뽑혔습니다.`;
                        parseMessage(message);
                        moveUserCardToTeamBoard(message.data.cardUserIds[i], message.data.team);
                    }
                    setTeamSelectBtn(message.data.step);
                    if (message.data.step == 7) {
                        message.data['message'] = '팀 뽑기가 완료됐습니다.';
                        parseMessage(message);
                    }
            }
            break;
        case 'rspResult':
            if (myRole != 'leader') {
                break;
            }
            var isDraw = receiveRspResult(message.data);
            setRspResultModal();
            await wsSend('rspComplete', {
                'userId': user,
                'isDraw': isDraw
            });
            if (isDraw) {
                rspMe = resetRspUser();
                rspCompetitor = resetRspUser();
            }
            break;
        case 'rspComplete':
            if (message.data.userId == user) {
                await receiveRspComplete(message.data.isDraw);
            }
            break;
        case 'reset':
            setDraftStatus(0);
            resetTeam();
            message.data['message'] = '팀이 초기화 되었습니다.';
            parseMessage(data);
    }
}

function handleWebSocketClosure(event) {
    var code = event.code;
    // Abnormal closure
    if (!event.wasClean) {
        setTimeout(startWebSocket(), reconnectionTimeInterval);
        reconnectionAttempts += 1;
        if (reconnectionAttempts > maxReconnectionAttempts) {
            return
        }
    } else {
        console.log('normal closed')
    }
}

function handleWebSocketError(event) {
    console.log(event);
    console.log('error');
}

startWebSocket();