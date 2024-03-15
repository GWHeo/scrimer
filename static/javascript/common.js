function spinnerDOM() {
    var element = `
        <div id="spinner-container">
            <div class="spinner-border spinner-border-sm text-secondary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    return element;
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function fetchUserInfo(gameName, tag, userRole, roomId) {
    var csrftoken = getCookie('csrftoken');
    var response = await fetch(userInfoUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            'gameName': gameName,
            'tag': tag,
            'userRole': userRole,
            'roomId': roomId
        })
    })
    return await response
}

async function fetchRoomInfo(link) {
    var csrftoken = getCookie('csrftoken');
    var response = await fetch(roomInfoUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            'link': link
        })
    })
    return await response
}

function changeRole(userRole) {
    var roleSpan = document.querySelectorAll('.user-role');
    role = userRole;

    if (role == 'creator') {
        roleText = '생성';
    } else {
        roleText = '참여';
    }

    roleSpan.forEach((el) => {
        el.innerHTML = roleText
    });
}