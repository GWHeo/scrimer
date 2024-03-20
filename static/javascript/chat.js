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

window.onresize = function(e) {
    chatMarginSetting(992);
    chatBodySizing();
}

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
    text = chatInput.value;
    response = await requestPost(sendChatUrl, {
        'message': text
    })
    switch(response.status) {
        case 200:
            break;
    }
    chatInput.value = '';
    sendBtn.disabled = true;
}

function chatInputBtnControl() {
    if (chatInput.value == '' || chatInput.value == null) {
        sendBtn.disabled = true;
    } else {
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

// websocket
const chatSocket = new WebSocket(chatWsUrl);
chatSocket.onmessage = function(event) {
    var data = JSON.parse(event.data);
    var message = data.message.message;
    switch(message.status) {
        case 'connect':
            message.data['message'] = `${message.data.name}님이 입장했습니다.`;
            parseMessage(message);
            break;
        case 'disconnect':
            message.data['message'] = `${message.data.name}님이 퇴장했습니다.`;
            parseMessage(message);
            break;
        case 'onchange':
            if (message.type == 'chat') {
                parseMessage(message);
            }
    }
}