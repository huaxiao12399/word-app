export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const subscription_key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION || 'eastasia';
    const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    if (!subscription_key) {
      throw new Error('Azure Speech API key is not configured');
    }

    const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <voice name="en-GB-SoniaNeural">
        <prosody rate="0%" pitch="0%">
            ${text}
        </prosody>
    </voice>
</speak>`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': subscription_key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3'
      },
      body: ssml
    });

    if (!response.ok) {
      throw new Error(`Azure Speech API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error.message 
    });
  }
} 
