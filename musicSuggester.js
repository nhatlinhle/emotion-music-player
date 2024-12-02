import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
    clientId: 'a76b22b0629d40a992d0fd86c4d50622',
    clientSecret: '6cf3f015d82143aa99d7fa8ff26c3c54',
    redirectUri: 'https://tommy-blog.online/',
});

const emotionMusicMap = {
    happy: 'pop',
    sad: 'blues',
    angry: 'rock',
    surprised: 'jazz',
};

async function addMusicToPlaylist(emotion) {
    try {
        const genre = emotionMusicMap[emotion] || 'pop';
        
        // Lấy access token từ Spotify
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body['access_token']);

        const searchData = await spotifyApi.searchTracks(`genre:${genre}`, { limit: 1 });
        const track = searchData.body.tracks.items[0];

        const playlistId = 'YOUR_PLAYLIST_ID';
        await spotifyApi.addTracksToPlaylist(playlistId, [track.uri]);

        return track.name;
    } catch (error) {
        console.error('Spotify API error:', error);
        return null;
    }
}

export default addMusicToPlaylist;