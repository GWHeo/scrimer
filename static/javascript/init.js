function setMargin() {
    var gnb = document.getElementById('gnb');
    var content = document.getElementById('content');

    content.style.marginTop = `${gnb.offsetHeight}px`;
}

window.onload = function() {
    setMargin();
}