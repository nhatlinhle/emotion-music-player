const express = require('express')
const path = require('path')
const { get } = require('request')
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors');

const app = express()

const CLIENT_ID = 'a76b22b0629d40a992d0fd86c4d50622';
const CLIENT_SECRET = '6cf3f015d82143aa99d7fa8ff26c3c54';
const PLAYLIST_ID = 'YOUR_PLAYLIST_ID';

const spotifyApi = new SpotifyWebApi({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
});

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

async function initializeSpotifyApi() {
  const data = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(data.body['access_token']);
}

async function refreshAccessToken() {
  try {
      const data = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(data.body['access_token']);
  } catch (error) {
      console.error('Lỗi làm mới Access Token:', error);
  }
}

const viewsDir = path.join(__dirname, 'views')
app.use(express.static(viewsDir))
app.use(express.static(path.join(__dirname, './public')))
app.use(express.static(path.join(__dirname, '../images')))
app.use(express.static(path.join(__dirname, '../media')))
app.use(express.static(path.join(__dirname, '../../weights')))
app.use(express.static(path.join(__dirname, '../../dist')))

app.get('/', (req, res) => res.redirect('/webcam_face_expression_recognition'))

app.get('/webcam_face_expression_recognition', (req, res) => res.sendFile(path.join(viewsDir, 'webcamFaceExpressionRecognition.html')))

app.post('/fetch_external_image', async (req, res) => {
  const { imageUrl } = req.body
  if (!imageUrl) {
    return res.status(400).send('imageUrl param required')
  }
  try {
    const externalResponse = await request(imageUrl)
    res.set('content-type', externalResponse.headers['content-type'])
    return res.status(202).send(Buffer.from(externalResponse.body))
  } catch (err) {
    return res.status(404).send(err.toString())
  }
})

app.post('/add-music', async (req, res) => {
  const { emotion } = req.body;

  if (!emotion) {
    return res.status(400).json({ error: 'Emotion không hợp lệ' });
  }

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

  const genre = emotionMusicMap[emotion] || 'pop';

  try {
    const searchData = await spotifyApi.searchTracks(`genre:${genre}`, { limit: 1 });

    res.json(searchData)
    // const track = searchData.body.tracks.items[0];
  } catch (err) {
    console.error('Lỗi Spotify API:', err);
    res.status(500).json({ err: 'Lỗi khi thêm bài hát vào playlist' });
  }
});

app.listen(3001, async () => {
  console.log('Listening on port 3000!')
  await initializeSpotifyApi();
  setInterval(refreshAccessToken, 1000 * 60 * 60);
})

function request(url, returnBuffer = true, timeout = 10000) {
  return new Promise(function(resolve, reject) {
    const options = Object.assign(
      {},
      {
        url,
        isBuffer: true,
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
        }
      },
      returnBuffer ? { encoding: null } : {}
    )

    get(options, function(err, res) {
      if (err) return reject(err)
      return resolve(res)
    })
  })
}