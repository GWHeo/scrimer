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

async function requestPost(url, data) {
    var csrftoken = getCookie('csrftoken');
    var response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(data)
    })
    return await response
}

async function requestGet(url) {
    var response = await fetch(url, {
        method: 'GET',
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

function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

function capFirst(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function toList(obj) {
    return Object.keys(obj).map(key => ({
        name: key,
        value: obj[key]
    }))
}

async function setChampIcon(imgNode, textNode, champData, champId) {
    for (let i=0; i<champData.length; i++){
        if (champData[i].value.key == champId) {
            imgNode.src = champIconUrl + `/${champData[i].name}.png`;
            textNode.innerHTML = champData[i].value.name;
            break;
        }
    }
}

async function setRankIcon(imgNode, textNode, data) {
    var rank = '';
    if (data.length == 0) {
        if (textNode != null) {
            textNode.innerHTML = 'Unranked';
        }
        imgNode.src = fileUrl + 'tier/unranked.png';
    } else {
        for (let i=0; i<data.length; i++) {
            if (data[i].queueType == 'RANKED_SOLO_5x5') {
                if (textNode != null) {
                    textNode.innerHTML = data[i].tier + data[i].rank;
                }
                var filename = data[i].tier.toLowerCase() + '.png';
                imgNode.src = fileUrl + `tier/${filename}/`;
                break;
            }
        }
    }

}

async function setMainLane(imgNode, textNode, lane) {

}