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

    divideMode = method;
}