import { NextRequest, NextResponse } from "next/server";
import SpotifyWebApi from "spotify-web-api-node";

// Set up Spotify API client
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

async function getSpotifyAccessToken() {
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body.access_token);
    } catch (error) {
        console.error("Error getting Spotify access token:", error);
    }
}

// Define mood-to-genre mapping
const MOOD_GENRES: { [key: string]: string[] } = {
    happy: ["pop", "dance", "house"],
    sad: ["blues", "acoustic", "soul"],
    energetic: ["rock", "metal", "edm"],
    relaxed: ["jazz", "chill", "lo-fi"],
    romantic: ["r&b", "love songs", "indie"],
};

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const mood = url.searchParams.get("mood");

    if (!mood) {
        return NextResponse.json({ error: "Please provide a mood (happy, sad, energetic, relaxed, romantic)." }, { status: 400 });
    }

    await getSpotifyAccessToken();

    const genres = MOOD_GENRES[mood.toLowerCase()] || ["pop"];
    const genre = genres[Math.floor(Math.random() * genres.length)];

    try {
        const data = await spotifyApi.searchTracks(`genre:${genre}`, { limit: 5 });
        const tracks = data.body.tracks?.items.map((track: SpotifyApi.TrackObjectFull) => ({
            name: track.name,
            artist: track.artists[0].name,
            url: track.external_urls.spotify,
        }));

        if (!tracks || tracks.length === 0) {
            return NextResponse.json({ error: "No songs found for this mood." }, { status: 404 });
        }

        return NextResponse.json({ recommendations: tracks }, { status: 200 });
    } catch (error) {
        console.error("Error fetching music:", error);
        return NextResponse.json({ error: "Failed to fetch music recommendations." }, { status: 500 });
    }
}

