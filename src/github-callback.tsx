import { useEffect } from 'react';

export function GitHubCallback() {
    useEffect(() => {
        // Send the URL search params back to the opener window
        if (window.opener) {
            window.opener.postMessage(window.location.search, window.location.origin);
            window.close();
        }
    }, []);

    return (
        <div>
            Processing GitHub authentication...
        </div>
    );
}