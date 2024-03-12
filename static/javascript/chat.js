const rightContent = document.getElementById('right-content');
const footer = document.getElementById('footer');
const chatBubble = document.getElementById('chatBubble');
const chatBox = document.getElementById('chatBox');
const minimizeButton = document.getElementById('minimizeBtn');
const chatHeader = document.getElementById('chatHeader');
const chatBody = document.getElementById('chatBody');
const chatFooter = document.getElementById('chatFooter');

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

chatMarginSetting(992);

window.onresize = function(e) {
    var topMargin = document.getElementById('gnb').offsetHeight;
    var bottomMargin = document.getElementById('footer').offsetHeight;

    chatMarginSetting(992);

    var contentHeight = innerHeight - topMargin - bottomMargin;
    console.log(contentHeight)
    if (contentHeight <= 400) {
        chatBody.style.height = `${contentHeight - chatHeader.offsetHeight - chatFooter.offsetHeight - 32}px`;
    } else {
        chatBody.style.height = '240px';
    }
}

chatBubble.addEventListener('click', () => {
    chatBox.style.display = 'flex';
    chatBubble.style.display = 'none';
});

minimizeButton.addEventListener('click', () => {
    chatBox.style.display = 'none';
    chatBubble.style.display = 'flex';
});

