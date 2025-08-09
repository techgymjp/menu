export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;
    
    if (!apiKey || !sheetId) {
      throw new Error('環境変数が設定されていません');
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:D?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.values && data.values.length > 1) {
      const menuData = data.values.slice(1).map(row => ({
        name: row[0] || '',
        price: parsePrice(row[1]) || 0,
        description: row[2] || '',
        imageNumber: row[3] || '1'
      }));
      
      res.json({ success: true, menuData });
    } else {
      res.status(404).json({ success: false, error: 'メニューデータが見つかりません' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

function parsePrice(priceValue) {
  if (!priceValue) return 0;
  
  if (typeof priceValue === 'string') {
    const numericValue = priceValue.replace(/[^\d.-]/g, '');
    return parseInt(numericValue) || 0;
  }
  
  if (typeof priceValue === 'number') {
    return Math.round(priceValue);
  }
  
  return 0;
}