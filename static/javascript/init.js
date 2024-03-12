function setMargin() {
    var gnb = document.getElementById('gnb');
    var footer = document.getElementById('footer');
    var chatbox = document.getElementById('chat-box');
    var content = document.getElementById('content');

    content.style.marginTop = `${gnb.offsetHeight}px`;
    chatbox.style.marginBottom = `${footer.offsetHeight}px`;
}

window.onload = function() {
    setMargin();
}