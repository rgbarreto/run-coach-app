import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateOAuthHeader } from './garminOAuth.js';
import { parseGarminActivity, parseGarminDaily } from './garminParser.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory server-side session cache for request tokens
// In production, this would be backed by Redis or Firestore
const tempOAuthSessions = new Map();

// In-memory Database to act as server storage for testing
// In production, this would write to Firestore directly
const syncedDataStore = {
  users: new Map(),
  activities: [],
  metrics: []
};

// Garmin API endpoints
const GARMIN_BASE_URL = 'https://connectapi.garmin.com';
const GARMIN_REQUEST_TOKEN_URL = `${GARMIN_BASE_URL}/oauth-service/oauth/request_token`;
const GARMIN_ACCESS_TOKEN_URL = `${GARMIN_BASE_URL}/oauth-service/oauth/access_token`;
const GARMIN_CONFIRM_URL = 'https://connect.garmin.com/oauth-confirm';

// Load credentials from environment
const CONSUMER_KEY = process.env.GARMIN_CONSUMER_KEY || 'MOCK_CONSUMER_KEY';
const CONSUMER_SECRET = process.env.GARMIN_CONSUMER_SECRET || 'MOCK_CONSUMER_SECRET';

console.log(`[Garmin Backend] Key configured: ${CONSUMER_KEY ? 'YES' : 'NO'}`);

/**
 * Endpoint 1: Generate Garmin OAuth Request Token
 * Initiates the Garmin OAuth 1.0a handshake
 */
app.get('/garmin/request-token', async (req, res) => {
  const athleteId = req.query.athleteId;
  const callbackUrl = req.query.callback || 'exp://localhost:8081'; // expo scheme

  if (!athleteId) {
    return res.status(400).json({ error: 'athleteId is required' });
  }

  // IF KEYS ARE MOCK, RUN MOCK HANDSHAKE (developer sandbox mode)
  if (CONSUMER_KEY === 'MOCK_CONSUMER_KEY') {
    console.log(`[Garmin OAuth] Running in developer sandbox mode (MOCK KEYS)`);
    
    // Store mock request token
    const mockRequestToken = `mock_req_tok_${Math.random().toString(36).substring(2)}`;
    tempOAuthSessions.set(mockRequestToken, { athleteId, callbackUrl });

    // Mock Garmin Authorization page redirect
    const mockAuthUrl = `http://localhost:${PORT}/garmin/mock-auth-page?oauth_token=${mockRequestToken}`;
    return res.json({ redirectUrl: mockAuthUrl });
  }

  try {
    // Generate OAuth header for Request Token endpoint
    // Needs oauth_callback in signature
    const requestUrl = GARMIN_REQUEST_TOKEN_URL;
    const params = {
      oauth_callback: `http://localhost:${PORT}/garmin/callback`
    };

    const authHeader = generateOAuthHeader(
      'POST',
      requestUrl,
      params,
      CONSUMER_KEY,
      CONSUMER_SECRET
    );

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Garmin returned error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.text();
    // Garmin returns urlencoded body: oauth_token=xxx&oauth_token_secret=yyy&oauth_callback_confirmed=true
    const urlParams = new URLSearchParams(responseData);
    const oauthToken = urlParams.get('oauth_token');
    const oauthTokenSecret = urlParams.get('oauth_token_secret');

    // Save tokens in session cache
    tempOAuthSessions.set(oauthToken, {
      athleteId,
      callbackUrl,
      tokenSecret: oauthTokenSecret
    });

    // Garmin redirect URL where user inputs their Garmin Connect login credentials
    const redirectUrl = `${GARMIN_CONFIRM_URL}?oauth_token=${oauthToken}`;
    res.json({ redirectUrl });

  } catch (error) {
    console.error('[Garmin Request Token Error]', error);
    res.status(500).json({ error: 'Failed to initiate Garmin connection', details: error.message });
  }
});

/**
 * Endpoint 2: Garmin OAuth Callback
 * Receives verifier from Garmin Connect redirects and exchanges for Access Token
 */
app.get('/garmin/callback', async (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;

  if (!oauth_token || !oauth_verifier) {
    return res.status(400).send('Missing oauth token or verifier');
  }

  const session = tempOAuthSessions.get(oauth_token);
  if (!session) {
    return res.status(404).send('Session not found or expired');
  }

  const { athleteId, callbackUrl, tokenSecret } = session;

  try {
    let accessToken = '';
    let accessTokenSecret = '';

    if (CONSUMER_KEY === 'MOCK_CONSUMER_KEY') {
      accessToken = `mock_acc_tok_${athleteId}`;
      accessTokenSecret = 'mock_secret_key';
    } else {
      // Real API Access Token exchange
      const requestUrl = GARMIN_ACCESS_TOKEN_URL;
      const params = {
        oauth_verifier: String(oauth_verifier)
      };

      const authHeader = generateOAuthHeader(
        'POST',
        requestUrl,
        params,
        CONSUMER_KEY,
        CONSUMER_SECRET,
        String(oauth_token),
        tokenSecret
      );

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to exchange token: ${await response.text()}`);
      }

      const responseData = await response.text();
      const urlParams = new URLSearchParams(responseData);
      accessToken = urlParams.get('oauth_token');
      accessTokenSecret = urlParams.get('oauth_token_secret');
    }

    // Securely save the access tokens in Firestore for this user
    // We log it here for verification. In a real integration, we perform a Firestore SDK update:
    // db.collection('users').doc(athleteId).update({ garminToken: accessToken, garminTokenSecret: accessTokenSecret, connectedGarmin: true });
    console.log(`[Garmin Sync] Success! Garmin Account Connected for Athlete: ${athleteId}`);
    console.log(`[Garmin Sync] AccessToken: ${accessToken.substring(0, 10)}...`);

    // Clean up temporary session
    tempOAuthSessions.delete(oauth_token);

    // Redirect the user back to the mobile app using their custom protocol scheme
    const deepLinkUrl = `${callbackUrl}?garminConnected=true&athleteId=${athleteId}`;
    res.redirect(deepLinkUrl);

  } catch (error) {
    console.error('[Garmin Callback Error]', error);
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
});

/**
 * Developer Sandbox Page: Simulates Garmin Authorization login page
 */
app.get('/garmin/mock-auth-page', (req, res) => {
  const { oauth_token } = req.query;
  const session = tempOAuthSessions.get(oauth_token);

  if (!session) {
    return res.status(404).send('Invalid mock session token');
  }

  res.send(`
    <html>
      <head>
        <title>Conectar ao Garmin Connect (Simulador)</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #121212; color: #ffffff; padding: 40px; text-align: center; }
          .card { background: #1e1e1e; border: 1px solid #333; border-radius: 12px; max-width: 450px; margin: 50px auto; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          h2 { color: #ff5722; margin-top: 0; }
          .btn { display: inline-block; background: #ff5722; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; transition: background 0.2s; border: none; cursor: pointer; }
          .btn:hover { background: #e64a19; }
          .desc { color: #888; font-size: 14px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Garmin Connect</h2>
          <p>O aplicativo <strong>Run Coach App</strong> gostaria de sincronizar seus dados de treino e saúde.</p>
          <p class="desc">Isso permitirá ler seus batimentos cardíacos em repouso, sono, VO2 Max e corridas.</p>
          <a class="btn" href="http://localhost:${PORT}/garmin/callback?oauth_token=${oauth_token}&oauth_verifier=mock_ver_789">Autorizar Integração</a>
        </div>
      </body>
    </html>
  `);
});

/**
 * Endpoint 3: Manual data sync pull trigger
 * Triggers sync manually for local testing or REST polling
 */
app.post('/garmin/sync-latest', (req, res) => {
  const { athleteId } = req.body;

  if (!athleteId) {
    return res.status(400).json({ error: 'athleteId is required' });
  }

  console.log(`[Garmin Sync] Triggered manual pull sync for athlete: ${athleteId}`);

  // Generate simulated Garmin Health responses if in development/mock mode
  if (CONSUMER_KEY === 'MOCK_CONSUMER_KEY') {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Garmin Activity Schema sample response
    const mockGarminActivity = {
      summaryId: Math.floor(Math.random() * 900000 + 100000),
      distanceInMeters: 5200 + Math.round(Math.random() * 4000), // 5.2 - 9.2 km
      durationInSeconds: 1600 + Math.round(Math.random() * 1200),
      activityType: 'RUNNING',
      activityName: 'Corrida Estádio (Garmin)',
      startTimeInSeconds: Math.floor(Date.now() / 1000) - 3600,
      averageHeartRateInBpm: 146,
      maxHeartRateInBpm: 168,
      activeKilocalories: 420,
      averageRunCadenceInStepsPerMinute: 174,
      elevationGainInMeters: 18
    };

    // Garmin Daily Summary Schema sample response
    const mockGarminDaily = {
      summaryId: Math.floor(Math.random() * 900000 + 100000),
      calendarDate: todayStr,
      restingHeartRateInBpm: Math.round(54 + Math.random() * 4 - 2),
      vo2Max: 46.5,
      sleepDurationInSeconds: 27000 + Math.round(Math.random() * 3600), // ~7.5 hours
      recoveryTimeInHours: Math.round(12 + Math.random() * 10),
      bodyBattery: 85,
      hrvStatus: 58,
      steps: 10450,
      activeKilocalories: 510
    };

    // Map using our clean Parsers
    const activityDTO = parseGarminActivity(mockGarminActivity, athleteId);
    const dailyDTO = parseGarminDaily(mockGarminDaily, athleteId);

    // Save to our memory database
    syncedDataStore.activities.unshift(activityDTO);
    syncedDataStore.metrics.push(dailyDTO);

    return res.json({
      success: true,
      message: 'Dados sincronizados com sucesso do simulador Garmin!',
      synced: {
        activities: [activityDTO],
        metrics: [dailyDTO]
      }
    });
  }

  // If live, we would retrieve tokens from Firestore, sign the requests with generateOAuthHeader,
  // query Garmin REST API end-points, parse the response, and update Firestore.
  res.status(501).json({ error: 'Sincronização real necessita das credenciais Garmin de Produção.' });
});

/**
 * Endpoint 4: Webhook Callback
 * Garmin Connect Cloud pushes new activity logs here
 */
app.post('/garmin/webhook', (req, res) => {
  // Garmin pushes array payloads in headers/body
  const payload = req.body;
  
  console.log('[Garmin Webhook] Received Garmin Push payload:', JSON.stringify(payload).substring(0, 150) + '...');
  
  // Garmin webhooks need a fast 200 response to prevent timeouts
  res.status(200).send('Webhook Received');

  // Async processing: parse and write to database
  if (payload.activities) {
    payload.activities.forEach(act => {
      // Map user
      const athleteId = act.userId || 'athlete-1';
      const parsed = parseGarminActivity(act, athleteId);
      console.log(`[Garmin Webhook] Parsed activity: ${parsed.title} - ${parsed.distance}m`);
      // Update DB e.g. db.collection('activities').doc(parsed.id).set(parsed);
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Garmin OAuth Server running on http://localhost:${PORT}`);
  console.log(`👉 Webhook URL (for Garmin settings): http://localhost:${PORT}/garmin/webhook`);
});
