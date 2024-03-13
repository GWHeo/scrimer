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
    console.log(chatBody.style.height)
}

chatMarginSetting(992);

window.onresize = function(e) {
    var topMargin = document.getElementById('gnb').offsetHeight;
    var bottomMargin = document.getElementById('footer').offsetHeight;

    chatMarginSetting(992);
    chatBodySizing();
}

chatBubble.addEventListener('click', () => {
    chatBox.style.display = 'flex';
    chatBubble.style.display = 'none';
});

minimizeButton.addEventListener('click', () => {
    chatBox.style.display = 'none';
    chatBubble.style.display = 'flex';
});

chatInput.addEventListener('keyup', function(e) {
    if (e.keyCode == 13) {
        e.preventDefault();
        sendBtn.click();
    }
})

// chat message
function sendMessage() {
    text = chatInput.value;
    chatBody.innerHTML += messageHtml;

    var messageContainer = document.getElementsByClassName('chat-message');
    messageContainer[messageContainer.length - 1].innerHTML = text + '<br>';
    chatBody.scrollTo(0, chatBody.scrollHeight);
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