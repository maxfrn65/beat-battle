<script>
	import { onMount } from 'svelte';
    let {children} = $props();

	let isOpen = false;
	let darkMode = false;

	onMount(() => {
		darkMode = JSON.parse(localStorage.getItem('darkMode') || 'false');
		if (darkMode) {
			document.documentElement.classList.add('dark');
		}
	});

	function toggleDarkMode() {
		darkMode = !darkMode;
		localStorage.setItem('darkMode', JSON.stringify(darkMode));
		document.documentElement.classList.toggle('dark');
	}
</script>

<!-- Navbar -->
<nav class="navbar">
	<div class="container">
		<!-- Logo -->
		<a href="/" class="logo">Beat Battle</a>

		<!-- Liens Desktop -->
		<div class="nav-links">
			<a href="/play">Jouer</a>
			<a href="/leaderboard">Classements</a>
			<a href="/playlists">Playlists</a>
		</div>

		<!-- Boutons -->
		<div class="nav-buttons">
			<a href="/login" class="btn">Connexion</a>
			<button on:click={toggleDarkMode} class="toggle-darkmode">
				{darkMode ? "☀️" : "🌙"}
			</button>
			<button class="burger-menu" on:click={() => (isOpen = !isOpen)}>
				{isOpen ? "✖" : "☰"}
			</button>
		</div>
	</div>

	<!-- Menu Mobile -->
	<div class="mobile-menu {isOpen ? 'open' : ''}">
		<a href="/play">Jouer</a>
		<a href="/leaderboard">Classements</a>
		<a href="/playlists">Playlists</a>
		<a href="/login" class="btn">Connexion</a>
		<button on:click={toggleDarkMode} class="toggle-darkmode">
			{darkMode ? "☀️ Mode Jour" : "🌙 Mode Nuit"}
		</button>
	</div>
</nav>

{@render children()}

<style>
    @import "../app.css";
    /* ======= NAVBAR ======*/

    .navbar {
        background: white;
        color: black;
        padding: 15px 20px;
        width: 100%;
        position: sticky;
        top: 0;
        z-index: 1000;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    }

    .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: auto;
    }

    /* Logo */
    .logo {
        font-size: 24px;
        font-weight: bold;
        text-decoration: none;
        color: black;
    }

    /* Liens Navigation */
    .nav-links {
        display: flex;
        gap: 20px;
    }

    .nav-links a {
        text-decoration: none;
        color: black;
        font-weight: 600;
        font-size: 16px;
        transition: color 0.3s ease-in-out;
    }

    .nav-links a:hover {
        color: #ff4d6d;
    }

    /* Boutons */
    .nav-buttons {
        display: flex;
        gap: 10px;
    }

    .toggle-darkmode {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        transition: transform 0.2s ease-in-out;
    }

    .toggle-darkmode:hover {
        transform: scale(1.2);
    }

    /* ======= MENU BURGER ======= */
    .burger-menu {
        display: none;
        font-size: 26px;
        background: none;
        border: none;
        cursor: pointer;
    }

    /* ======= MENU MOBILE ======= */
    .mobile-menu {
        display: none;
        flex-direction: column;
        background: white;
        position: absolute;
        top: 60px;
        left: 0;
        width: 100%;
        padding: 15px;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease-in-out;
        transform: translateY(-10px);
        opacity: 0;
    }

    .mobile-menu.open {
        display: flex;
        transform: translateY(0);
        opacity: 1;
    }

    .mobile-menu a {
        padding: 10px;
        text-decoration: none;
        color: black;
        font-weight: bold;
        transition: color 0.3s ease-in-out;
    }

    .mobile-menu a:hover {
        color: #ff4d6d;
    }

    /* ======= MODE SOMBRE ======= */
    .dark .navbar {
        background: black;
        color: white;
    }

    .dark .logo, .dark .nav-links a, .dark .mobile-menu a {
        color: white;
    }

    .dark .btn {
        background: white;
        color: #ff4d6d;
    }

    .dark .btn:hover {
        background: #ff2744;
        color: white;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
        .nav-links {
            display: none;
        }

        .burger-menu {
            display: block;
        }
    }
</style>