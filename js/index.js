const userInfoKeys = ['name', 'avatar_url', 'blog', 'bio', 'location'];

// clear local storage
console.log('Clearing local storage');
localStorage.clear();

async function handle(e) {
    e.preventDefault()

    const userName = document.getElementById('username').value;

    console.log(`Getting user info for: ${userName}`);
    const userInfo = await getDataWithCaching(userName);

    if (userInfo) {
        console.log(userInfo);
        setUserInfo(userInfo);
    }
    else {
        console.log('User not found');
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
        console.log('Getting user info from local storage');
        console.log(userInfo);
        return JSON.parse(userInfo);
    } else {
        console.log('Getting user info from GitHub');
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
    document.getElementById('col2').style.display = 'block';
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
