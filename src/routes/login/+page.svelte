<script lang="ts">
    import { onMount } from 'svelte';
    import SpotifyAuth from '../../composants/SpotifyAuth.svelte';
    let token: string | null = null;
    let isAuthenticated: boolean = false;
    let isSDKReady: boolean = false;


    function handleToken(event: CustomEvent<string>) {
        token = event.detail;
        isAuthenticated = true;
        initializeSDK();
    }

    function initializeSDK() {
        if (!token) return;

        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            isSDKReady = true;
            console.log('Spotify SDK est prêt');
        };
    }

    onMount(() => {
        // Vérifier si un token existe déjà
        const savedToken = localStorage.getItem('spotify_token');
        if (savedToken) {
            token = savedToken;
            isAuthenticated = true;
            initializeSDK();
        }
    });


</script>

<SpotifyAuth on:token={handleToken} />

<style>
    .blind-test-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        text-align: center;
        font-family: 'Arial', sans-serif;
    }

    .game-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding: 1rem;
        background: rgba(29, 185, 84, 0.1);
        border-radius: 10px;
    }

    .score {
        font-size: 1.5rem;
        font-weight: bold;
        color: #1DB954;
    }

    .timer {
        font-size: 2rem;
        font-weight: bold;
        color: #333;
    }

    .controls {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-bottom: 2rem;
    }

    button {
        padding: 12px 24px;
        background-color: #1DB954;
        color: white;
        border: none;
        cursor: pointer;
        border-radius: 25px;
        font-size: 1rem;
        font-weight: bold;
        transition: all 0.3s ease;
        text-transform: uppercase;
    }

    button:hover {
        background-color: #1ed760;
        transform: scale(1.05);
    }

    .guess-input {
        width: 100%;
        max-width: 400px;
        padding: 1rem;
        margin: 1rem 0;
        border: 2px solid #1DB954;
        border-radius: 25px;
        font-size: 1rem;
        text-align: center;
    }

    .guess-input:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(29, 185, 84, 0.3);
    }

    .progress-bar {
        width: 100%;
        height: 10px;
        background: #ddd;
        border-radius: 5px;
        margin: 1rem 0;
        overflow: hidden;
    }

    .progress-bar-fill {
        height: 100%;
        background: #1DB954;
        width: calc((var(--time-left) / 30) * 100%);
        transition: width 1s linear;
    }
</style>