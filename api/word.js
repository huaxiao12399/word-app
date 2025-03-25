export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { word } = req.body;
  if (!word) {
    return res.status(400).json({ error: 'Word is required' });
  }

  try {
    const API_URL = "https://generativelanguage.googleapis.com/v1beta";
    const API_KEY = process.env.GEMINI_API_KEY;

    const prompt = `Provide the word, phonetic transcription (British English), and syllable breakdown for the word "${word}".`;
    
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    const response = await fetch(`${API_URL}/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`API请求失败: ${response.status} ${errorData ? JSON.stringify(errorData) : ''}`);
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
    res.status(500).json({ error: error.message || '获取单词信息失败' });
  }
}
