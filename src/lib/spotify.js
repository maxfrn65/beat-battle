const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

export async function getSpotifyToken() {
	const response = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`)
		},
		body: "grant_type=client_credentials"
	});

	const data = await response.json();
	return data.access_token;
}

export async function getFeaturedPlaylists() {
	const token = await getSpotifyToken();
	if (!token) {
		console.error("❌ Impossible d'obtenir un token, vérifie tes credentials !");
		return;
	}
	console.log(token);
	const response = await fetch(
		"https://api.spotify.com/v1/playlists/6WbtTaIHymFYdKptEzhXcj",
		{
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
	);

	const data = await response.json();
	console.log(data.items);
	return data.items;
}

