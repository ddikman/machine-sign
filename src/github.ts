
// Store state in localStorage to prevent CSRF attacks
function generateState(): string {
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('github_oauth_state', state);
    return state;
}

function verifyState(state: string): boolean {
    const savedState = localStorage.getItem('github_oauth_state');
    localStorage.removeItem('github_oauth_state');
    return state === savedState;
}

export async function authenticateWithGithub(clientId: string): Promise<string> {
    const state = generateState();
    const currentUrl = new URL(window.location.href);
    const redirectUri = `${currentUrl.origin}/github-callback`;

    // Open GitHub OAuth flow in a popup
    const authWindow = window.open(
        `https://github.com/login/oauth/authorize?` +
        `client_id=${clientId}&` +
        `scope=repo&` +
        `state=${state}&` +
        `redirect_uri=${redirectUri}`,
        'github-oauth',
        'width=600,height=800'
    );

    return new Promise((resolve, reject) => {
        // Listen for the redirect with the code
        window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) return;

            // Close the window if it's still open
            if (authWindow) {
                authWindow.close();
            }

            const params = new URLSearchParams(event.data);
            const code = params.get('code');
            const returnedState = params.get('state');

            if (!code || !returnedState) return;
            if (!verifyState(returnedState)) {
                reject(new Error('Invalid state parameter'));
                return;
            }

            // Exchange code for token using GitHub's CORS proxy
            fetch('https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: clientId,
                    code: code,
                    redirect_uri: redirectUri,
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    reject(new Error(data.error_description || data.error));
                } else {
                    resolve(data.access_token);
                }
                authWindow?.close();
            })
            .catch(error => {
                reject(error);
                authWindow?.close();
            });
        });
    });
}

export async function createPullRequest(
    token: string,
    owner: string,
    repo: string,
    branch: string,
    title: string,
    files: {path: string, content: string}[]
): Promise<string> {
    // Create a new branch
    const timestamp = new Date().getTime();
    const newBranch = `update-sign-${timestamp}`;

    // Get the latest commit SHA from the base branch
    const baseRef = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        }
    ).then(r => r.json());

    // Create new branch
    await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/refs`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
                ref: `refs/heads/${newBranch}`,
                sha: baseRef.object.sha,
            }),
        }
    );

    // Create commits for each file
    for (const file of files) {
        await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
                body: JSON.stringify({
                    message: `Update ${file.path}`,
                    content: btoa(file.content),
                    branch: newBranch,
                }),
            }
        );
    }

    // Create pull request
    const pr = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
                title,
                head: newBranch,
                base: branch,
                body: 'Updated sign configuration',
            }),
        }
    ).then(r => r.json());

    return pr.html_url;
}