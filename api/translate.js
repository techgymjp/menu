export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, targetLang } = req.body;
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google API Key が設定されていません');
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        source: 'ja'
      })
    });

    const data = await response.json();
    if (data.data && data.data.translations && data.data.translations[0]) {
      const translatedText = data.data.translations[0].translatedText;
      res.json({ success: true, translatedText });
    } else {
      res.status(500).json({ success: false, error: '翻訳に失敗しました' });
    }
  } catch (error) {
    console.error('Translation API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}