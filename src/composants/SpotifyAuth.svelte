<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    // Remplacez par votre Client ID
    const CLIENT_ID = '1d7bdd8092a94ee280f1ec1036a328bb';
    const REDIRECT_URI = 'http://localhost:5173/musique';
    const SCOPES = [
        'streaming',
        'user-read-email',
        'user-read-private',
        'user-read-playback-state',
        'user-modify-playback-state'
    ];

    function login() {
        const authUrl = new URL('https://accounts.spotify.com/authorize');
        authUrl.searchParams.append('client_id', CLIENT_ID);
        authUrl.searchParams.append('response_type', 'token');
        authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
        authUrl.searchParams.append('scope', SCOPES.join(' '));
        
        // Sauvegarder l'état actuel pour la redirection
        localStorage.setItem('spotify_auth_state', 'true');
        
        // Rediriger vers Spotify
        window.location.href = authUrl.toString();
    }

    // Vérifier si on revient d'une authentification
    if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        if (hash && localStorage.getItem('spotify_auth_state')) {
            const params = new URLSearchParams(hash.substring(1));
            const token = params.get('access_token');
            if (token) {
                localStorage.setItem('spotify_token', token);
                dispatch('token', token);
                window.location.hash = '';
                localStorage.removeItem('spotify_auth_state');
            }
        }
    }
</script>

<div class="auth-container">
    <button on:click={login}>
        Se connecter avec Spotify
    </button>
</div>

<style>
    .auth-container {
        text-align: center;
        padding: 2rem;
    }

    button {
        background-color: #1DB954;
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 25px;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    button:hover {
        background-color: #1ed760;
        transform: scale(1.05);
    }
</style> 