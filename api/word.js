export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const API_URL = "https://generativelanguage.googleapis.com/v1beta";
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      throw new Error('API key is not configured');
    }

    const payload = req.body;
    if (!payload.contents || !payload.contents[0]?.parts?.[0]?.text) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    const response = await fetch(`${API_URL}/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0) {
      const result = data.candidates[0].content.parts[0].text;
      res.json({ result });
    } else {
      throw new Error('No valid response from API');
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch word information',
      details: error.message 
    });
  }
}
