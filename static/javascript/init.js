function setMargin() {
    var gnb = document.getElementById('gnb');
    var content = document.getElementById('content');

    content.style.marginTop = `${gnb.offsetHeight}px`;
}

function initGnb(breakPoint) {
    var desktop = document.getElementById('hamburger-desktop');
    var mobile = document.getElementById('hamburger-mobile');
    if (window.innerWidth > breakPoint) {
        desktop.classList.remove('d-none');
    } else {
        mobile.classList.remove('d-none');
    }
}

window.onload = function() {
    setMargin();
    initGnb();
}