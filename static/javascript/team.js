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