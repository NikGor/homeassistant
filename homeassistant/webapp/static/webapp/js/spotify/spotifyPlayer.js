// Spotify Web Playback SDK integration.
// The browser registers itself as a Spotify Connect device; actual playback
// control (play/pause/next/previous/volume/...) is routed through the backend,
// which calls the Spotify Web API directly — see spotifyControl().

let spotifyPlayerInstance = null;
let spotifyDeviceId = null;

async function fetchSpotifyStatus() {
    try {
        const response = await fetch('/spotify/api/status/');
        return await response.json();
    } catch (error) {
        console.error('Error fetching Spotify status:', error);
        return { success: false, connected: false };
    }
}

async function fetchSpotifyAccessToken() {
    const response = await fetch('/spotify/api/token/');
    const data = await response.json();
    if (!data.success) {
        throw new Error(data.message || 'Spotify is not connected');
    }
    return data.access_token;
}

async function spotifyControl(action, value) {
    try {
        const response = await fetch('/spotify/api/control/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, value })
        });
        return await response.json();
    } catch (error) {
        console.error('Error sending Spotify control command:', error);
        return { success: false, message: error.message };
    }
}

async function registerSpotifyDevice(deviceId) {
    try {
        await fetch('/spotify/api/device/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ device_id: deviceId })
        });
    } catch (error) {
        console.error('Error registering Spotify device:', error);
    }
}

window.onSpotifyWebPlaybackSDKReady = () => {
    fetchSpotifyStatus().then((status) => {
        if (!status.connected) {
            return;
        }

        const player = new Spotify.Player({
            name: 'Archie Web Player',
            getOAuthToken: (callback) => {
                fetchSpotifyAccessToken()
                    .then(callback)
                    .catch((error) => console.error('Error getting Spotify token:', error));
            },
            volume: 0.5
        });

        player.addListener('ready', ({ device_id }) => {
            spotifyDeviceId = device_id;
            registerSpotifyDevice(device_id);
        });

        player.addListener('player_state_changed', (state) => {
            window.dispatchEvent(new CustomEvent('spotify:state', { detail: state }));
        });

        player.addListener('initialization_error', ({ message }) => {
            console.error('Spotify init error:', message);
        });
        player.addListener('authentication_error', ({ message }) => {
            console.error('Spotify auth error:', message);
        });
        player.addListener('account_error', ({ message }) => {
            console.error('Spotify account error:', message);
        });

        player.connect();
        spotifyPlayerInstance = player;
    });
};
