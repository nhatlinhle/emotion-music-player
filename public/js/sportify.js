
const CLIENT_ID = 'a76b22b0629d40a992d0fd86c4d50622';
const CLIENT_SECRET = '6cf3f015d82143aa99d7fa8ff26c3c54';
const token = 'BQCSitx5QHUXsUAehOnoJ9Tz71QRTw9gv-0LFt_8za2p4WALXnkaai_KPLBPzrmk3RXnYhc3XWapRKzigwwL5jYR8XGyMpKYiswx1reeddnWnp4EuJrz-2yh1mhpmR4_3hS65MSxHp43DTKDBGgkqTUCx4yA8oaaHW3rcmzZegc9RnKpFb9HS6BoNBVLuS9oZEse9uAR7wrkNDg0TDdrdmwoWVgE1N4N8Xmi';
const today = new Date().toISOString().split('T')[0];

$(document).ready(function () {
  $('#authorize-btn').click(function () {
    const authUrl = generateSpotifyAuthUrl();
    window.location.href = authUrl;
  });
});

function generateSpotifyAuthUrl() {
  const clientId = 'a76b22b0629d40a992d0fd86c4d50622';
  const redirectUri = 'http://localhost:3001/webcam_face_expression_recognition';
  const scopes = [
    'user-read-private',
    'playlist-read-private',
    'playlist-modify-private',
    'user-read-email'
  ];

  const authUrl = `https://accounts.spotify.com/authorize?` +
    `response_type=code&` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scopes.join(' '))}`;

  return authUrl;
}

$(document).ready(function () {
  const params = new URLSearchParams(window.location.search);
  const authorizationCode = params.get('code');

  if (authorizationCode) {
    getAccessToken(authorizationCode);
  }
});

async function getAccessToken(authorizationCode) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa('a76b22b0629d40a992d0fd86c4d50622:6cf3f015d82143aa99d7fa8ff26c3c54')
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authorizationCode,
      redirect_uri: 'http://localhost:3001/webcam_face_expression_recognition'
    })
  });

  const data = await response.json();
  if (data.access_token) {
    const token = data.access_token;
    localStorage.setItem("token", data.access_token);
    const today = new Date().toISOString().split('T')[0];

    const playlist = await findOrCreatePlaylist(token, today);

    displayPlaylistEmbed(playlist);
  } else {
    console.error('Failed to get access token');
  }
}

async function findOrCreatePlaylist(token, today) {
  const userId = await getCurrentUserId(token);
  const playlists = await getUserPlaylists(token);

  let playlist = playlists.find(p => p?.name === today);

  if (!playlist) {
    playlist = await createPlaylist(token, userId, today);
    paylistGlobal = playlist
    console.log('Playlist created:', playlist.name);
  } else {
    paylistGlobal = playlist
    console.log('Playlist already exists:', playlist.name);
  }

  return playlist;
}

async function getCurrentUserId(token) {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  return data.id;
}

async function getUserPlaylists(token) {
  const response = await fetch('https://api.spotify.com/v1/me/playlists', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  return data.items;
}

async function createPlaylist(token, userId, playlistName) {
  const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: playlistName,
      description: `Playlist for ${playlistName}`,
      public: false
    })
  });
  const data = await response.json();
  return data;
}

async function searchTrackByEmotion(emotion) {
  const emotionMusicMap = {
    neutral: 'ambient',
    disgusted: 'punk',
    fearful: 'classical',
    happy: 'pop',
    sad: 'blues',
    angry: 'rock',
    surprised: 'jazz',
    fearful: 'classical',
  };

  const token = localStorage.getItem("token")

  const genre = emotionMusicMap[emotion] || 'pop';

  // fetch tracks by genre and contry vietnam
  const response = await fetch(`https://api.spotify.com/v1/search?q=genre:${genre}&type=track&market=VN`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const data = await response.json();
  return data;
}

searchTrackByEmotion('fearful')

function displayPlaylistEmbed(playlist) {
  const playlistId = playlist.id;
  const iframe = `
      <iframe 
          src="https://open.spotify.com/embed/playlist/${playlistId}" 
          width="600" 
          height="580" 
          frameborder="0" 
          allowtransparency="true" 
          allow="encrypted-media">
      </iframe>
  `;
  document.getElementById('playlist-container').innerHTML = iframe;
}

async function addTrackToPlaylist(trackId) {
  const token = localStorage.getItem("token")
  
  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${paylistGlobal.id}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [`spotify:track:${trackId}`],
      }),
    });

    if (response.ok) {
      console.log(`Track ${trackId} added successfully to playlist ${paylistGlobal.id}`);
    } else {
      const error = await response.json();
      console.error("Failed to add track:", error);
    }
  } catch (err) {
    console.error("Error adding track to playlist:", err);
  }
}