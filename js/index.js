const userInfoKeys = ['name', 'avatar_url', 'blog', 'bio', 'location', 'most_used_language'];

// clear local storage
console.log('Clearing local storage');
localStorage.clear();

async function handle(e) {
    e.preventDefault();

    const userName = document.getElementById('username').value;

    console.log(`Getting user info for: ${userName}`);
    const userInfo = await getDataWithCaching(userName);

    if (userInfo) {
        setUserInfo(userInfo);
    } else {
        console.log('User not found');
        clearUserInfo();
        userNotFound();
    }
}

// Check local storage to see if we have the data
// If we do, return it
// If we don't, fetch it and store it in local storage
async function getDataWithCaching(username) {
    const userInfo = localStorage.getItem(username);

    if (userInfo) {
        console.log('Getting user info from local storage');
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

        // Get most used language
        console.log('Getting most used language');
        const mostUsedLanguage = await getMostUsedLanguage(username);
        console.log(mostUsedLanguage);

        const data = {
            name: json.name,
            avatar_url: json.avatar_url,
            blog: json.blog,
            bio: json.bio,
            location: json.location,
            most_used_language: mostUsedLanguage
        };
        localStorage.setItem(username, JSON.stringify(data));
        return data;
    }
}

async function getMostUsedLanguage(username) {
    const fiveRecentUsedReposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=5&sort=pushed`);
    const fiveRecentUsedRepos = await fiveRecentUsedReposResponse.json();

    const mostUsedLanguage = {
        language: '',
        point: 0
    };

    for (let userRepo of fiveRecentUsedRepos) {
        const languagesResponse = await fetch(userRepo.languages_url);
        const languages = await languagesResponse.json();

        if (Object.keys(languages).length === 0) {
            continue;
        }

        // languages is like: { "JavaScript": 1234, "HTML": 1234 }

        // Find key, value with maximum value
        const language = Object.keys(languages).reduce((a, b) => languages[a] > languages[b] ? a : b);
        const point = languages[language];

        if (point > mostUsedLanguage.point) {
            mostUsedLanguage.language = language;
            mostUsedLanguage.point = point;
        }
    }

    return mostUsedLanguage.language;
}

function setUserInfo(userInfo) {
    console.log('Set not found image to go away');
    document.getElementById('not-found-image').style.display = 'none';
    document.getElementById('col2').style.display = 'block';
    document.getElementById('message').innerHTML = '';

    userInfoKeys.forEach(key => {
        const element = document.getElementById(key);
        // although handle avatar_url differently
        if (key === 'avatar_url') {
            if (userInfo[key]) {
                element.src = userInfo[key];
                element.style.display = 'block';
            }
        } else {
            if (userInfo[key]) {
                element.innerHTML = `${titleCase(key)}: ${userInfo[key]}`;
            } else {
                element.innerHTML = '';
            }
        }
    });
}

function clearUserInfo() {
    userInfoKeys.forEach(key => {
        const element = document.getElementById(key);
        if (key === 'avatar_url') {
            element.style.display = 'none';
        } else {
            element.innerHTML = '';
        }
    });
}

function userNotFound() {
    document.getElementById('message').innerHTML = 'User not found';
    document.getElementById('message').style.fontSize = '1.5em';

    document.getElementById('not-found-image').style.display = 'block';
}

// Utility functions
function titleCase(str) {
    return str.replaceAll('_', ' ').replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
