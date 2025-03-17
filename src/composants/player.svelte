<script lang="ts">
    import { onMount } from 'svelte';
    import SpotifyAuth from './SpotifyAuth.svelte';
    import Modal from './Modal.svelte';
    import type { Spotify } from '../types/spotify';

    export let playlistId: string;
    let player: Spotify.Player | null = null;
    let isPlaying: boolean = false;
    let score: number = 0;
    let currentSong: string = "";
    let userGuess: string = "";
    let showAnswer: boolean = false;
    let timeLeft: number = 30;
    let timer: number;
    let currentTrack: any = null;
    let isSDKReady: boolean = false;
    let playlistInfo: any = null;
    let token: string | null = null;
    let isAuthenticated: boolean = false;
    let showModal: boolean = false;
    let modalTitle: string = "";
    let modalMessage: string = "";
    let currentTrackIndex: number = 0;
    let currentDeviceId: string | null = null;

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

    async function getPlaylistInfo(): Promise<void> {
        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            playlistInfo = await response.json();
            //Randomize the playlist
            console.log('Informations de la playlist:', playlistInfo);
            console.log('Nombre de titres:', playlistInfo.tracks.total);
            console.log('Titres:', playlistInfo.tracks.items.map((item: any) => item.track.name));
        } catch (error) {
            console.error("Erreur lors de la récupération de la playlist:", error);
            alert("Erreur lors de la récupération de la playlist. Vérifiez votre token et l'ID de la playlist.");
        }
    }

    function initializePlayer(): void {
        if (!isSDKReady) {
            showModal = true;
            modalTitle = "Erreur";
            modalMessage = "Le SDK Spotify est en cours de chargement, veuillez patienter quelques secondes et réessayer.";
            return;
        }

        if (!token) {
            showModal = true;
            modalTitle = "Erreur";
            modalMessage = "Token Spotify non disponible. Veuillez vous reconnecter.";
            return;
        }

        // Charger les informations de la playlist avant d'initialiser le player
        getPlaylistInfo().then(() => {
            player = new window.Spotify.Player({
                name: 'Beat Battle Player',
                getOAuthToken: cb => cb(token || ''),
                volume: 0.5
            });
      
            player.addListener('ready', ({ device_id }) => {
                console.log('Prêt avec le device_id:', device_id);
                currentDeviceId = device_id;
                playNextTrack(device_id);
            });
      
            player.addListener('not_ready', ({ device_id }) => {
                console.log('Le device_id n\'est plus prêt:', device_id);
            });
      
            player.addListener('player_state_changed', state => {
                if (state) {
                    currentTrack = state.track_window.current_track;
                    currentSong = currentTrack.name;
                    console.log('Chanson actuelle:', currentSong);
                }
            });
      
            player.addListener('initialization_error', ({ message }) => {
                console.error('Erreur d\'initialisation:', message);
                showModal = true;
                modalTitle = "Erreur d'initialisation";
                modalMessage = message;
            });
      
            player.addListener('authentication_error', ({ message }) => {
                console.error('Erreur d\'authentification:', message);
                showModal = true;
                modalTitle = "Erreur d'authentification";
                modalMessage = "Erreur d'authentification Spotify. Veuillez vérifier votre token.";
            });
      
            player.addListener('account_error', ({ message }) => {
                console.error('Erreur de compte:', message);
                showModal = true;
                modalTitle = "Erreur de compte";
                modalMessage = message;
            });
      
            player.connect().then(success => {
                if (success) {
                    console.log('Connexion au player réussie!');
                }
            });
        }).catch(error => {
            console.error("Erreur lors de l'initialisation:", error);
            showModal = true;
            modalTitle = "Erreur";
            modalMessage = "Erreur lors de l'initialisation du player. Vérifiez votre token et l'ID de la playlist.";
        });
    }
  
    function cleanSongTitle(title: string): string {
        // Supprime tout ce qui est entre parenthèses ou crochets
        return title.replace(/[\[\(].*?[\]\)]/g, '').trim();
    }

    async function playNextTrack(deviceId: string): Promise<void> {
        if (!deviceId || !playlistInfo || !token) {
            console.error("Impossible de jouer la piste suivante:", { deviceId, hasPlaylistInfo: !!playlistInfo, hasToken: !!token });
            return;
        }
        
        const tracks = playlistInfo.tracks.items;
        if (currentTrackIndex >= tracks.length) {
            currentTrackIndex = 0;
        }

        try {
            console.log("Lecture de la piste suivante:", currentTrackIndex);
            const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    context_uri: `spotify:playlist:${playlistId}`,
                    offset: { position: currentTrackIndex },
                    position_ms: 0
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            currentTrackIndex++;
            isPlaying = true;
            startTimer();
        } catch (error) {
            console.error("Erreur lors de la lecture:", error);
            showModal = true;
            modalTitle = "Erreur";
            modalMessage = "Erreur lors de la lecture. Vérifiez votre token Spotify et votre connexion internet.";
        }
    }

    function startTimer(): void {
        if (timer) clearInterval(timer);
        timeLeft = 30;
        
        timer = setInterval(() => {
            if (isPlaying) {
                timeLeft--;
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    showAnswer = true;
                    if (player) {
                        player.pause();
                        showModal = true;
                        modalTitle = "Temps écoulé !";
                        modalMessage = `La chanson était : ${currentSong}`;
                    }
                }
            }
        }, 1000);
    }

    function calculateSimilarity(str1: string, str2: string): number {
        const clean1 = cleanSongTitle(str1).toLowerCase();
        const clean2 = cleanSongTitle(str2).toLowerCase();
        
        if (clean1 === clean2) return 1;
        
        const words1 = clean1.split(' ');
        const words2 = clean2.split(' ');
        
        let matches = 0;
        for (const word1 of words1) {
            for (const word2 of words2) {
                if (word1 === word2) {
                    matches++;
                    break;
                }
            }
        }
        
        return matches / Math.max(words1.length, words2.length);
    }

    function checkAnswer(): void {
        const similarity = calculateSimilarity(userGuess, currentSong);
        
        if (similarity >= 0.8) {
            score += 100;
            showModal = true;
            modalTitle = "Bravo !";
            modalMessage = "+100 points !";
        } else {
            showModal = true;
            modalTitle = "Dommage !";
            modalMessage = `La réponse était : ${currentSong}`;
        }
        userGuess = "";
        showAnswer = false;
        timeLeft = 30;
        if (player) {
            player.pause();
        }
    }

    function resetGame(): void {
        score = 0;
        userGuess = "";
        showAnswer = false;
        timeLeft = 30;
        isPlaying = false;
        currentTrackIndex = 0;
        if (timer) clearInterval(timer);
    }

    function closeModal(): void {
        showModal = false;
        if (player && currentDeviceId) {
            playNextTrack(currentDeviceId);
        }
    }
</script>
  
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
  
<div class="blind-test-container">
    {#if !isAuthenticated}
        <SpotifyAuth on:token={handleToken} />
    {:else}
        <div class="game-header">
            <div class="score">Score: {score}</div>
            <div class="timer">{timeLeft}s</div>
        </div>

        <div class="controls">
            <button on:click={initializePlayer}>Démarrer le Blind Test</button>
            <button on:click={resetGame}>Nouvelle Partie</button>
        </div>

        <div class="progress-bar">
            <div class="progress-bar-fill" style="--time-left: {timeLeft}"></div>
        </div>

        <input
            type="text"
            class="guess-input"
            placeholder="Entrez le nom de la chanson..."
            bind:value={userGuess}
            on:keydown={(e) => e.key === 'Enter' && checkAnswer()}
        />

        <button on:click={checkAnswer}>Valider la réponse</button>

        <Modal 
            show={showModal}
            title={modalTitle}
            message={modalMessage}
            onClose={closeModal}
        />
    {/if}
</div>
  