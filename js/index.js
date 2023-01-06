const userInfoKeys = ['name', 'avatar_url', 'blog', 'bio', 'location'];

async function handle(e) {
    e.preventDefault();

    const userName = document.getElementById('username').value;
    const userInfo = await getDataWithCaching(userName);

    if (userInfo) {
        setUserInfo(userInfo);
    }
    else {
        clearUserInfo();
        document.getElementById('message').innerHTML = 'User not found';
    }
}

// Check local storage to see if we have the data
// If we do, return it
// If we don't, fetch it and store it in local storage
async function getDataWithCaching(username) {
    const userInfo = localStorage.getItem(username);

    if (userInfo) {
        return JSON.parse(userInfo);
    } else {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (response.status === 404) {
            return null;
        } else if (response.status !== 200) {
            throw new Error(`Request failed with error ${response.status}`);
        }

        const json = await response.json();

        const data = {
            name: json.name,
            avatar_url: json.avatar_url,
            blog: json.blog,
            bio: json.bio,
            location: json.location
        };
        localStorage.setItem(username, JSON.stringify(data));
        return json;
    }
}

function setUserInfo(userInfo) {
    userInfoKeys.forEach(key => {
        const element = document.getElementById(key);
        // although handle avatar_url differently
        if (key === 'avatar_url') {
            if (userInfo[key]) {
                element.src = userInfo[key];
                element.style.display = 'block';
            }
        }
        else {
            element.innerHTML = userInfo[key] || '';
        }
    });
}

function clearUserInfo() {
    userInfoKeys.forEach(key => {
        const element = document.getElementById(key);
        if (key === 'avatar_url') {
            element.style.display = 'none';
        }
        else {
            element.innerHTML = '';
        }
    });
}
