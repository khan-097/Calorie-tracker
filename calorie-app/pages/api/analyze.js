import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image, mediaType } = req.body;
  if (!image || !mediaType) {
    return res.status(400).json({ error: 'Image data missing' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured. Please add ANTHROPIC_API_KEY to your environment variables.' });
  }

  const client = new Anthropic({ apiKey });

  const prompt = `তুমি একজন বিশেষজ্ঞ পুষ্টিবিদ। এই খাবারের ছবি বিশ্লেষণ করো এবং নিম্নলিখিত তথ্য JSON ফরম্যাটে দাও।

গুরুত্বপূর্ণ: শুধুমাত্র valid JSON দাও, কোনো অতিরিক্ত টেক্সট নয়।

{
  "foodName": "খাবারের বাংলা নাম",
  "emoji": "উপযুক্ত একটি ইমোজি",
  "portion": "আনুমানিক পরিমাণ (যেমন: ১ প্লেট, ২৫০ গ্রাম)",
  "calories": সংখ্যা (kcal),
  "protein": সংখ্যা (গ্রাম),
  "carbs": সংখ্যা (গ্রাম),
  "fat": সংখ্যা (গ্রাম),
  "fiber": সংখ্যা বা null (গ্রাম),
  "ingredients": ["উপাদান১", "উপাদান২", "উপাদান৩"],
  "advice": "এই খাবার সম্পর্কে ২-৩ বাক্যে স্বাস্থ্য পরামর্শ বাংলায়",
  "healthyAlternatives": "স্বাস্থ্যকর বিকল্প বা পরামর্শ বাংলায়"
}

যদি ছবিতে খাবার না থাকে তাহলে:
{
  "error": "এই ছবিতে কোনো খাবার দেখা যাচ্ছে না"
}`;

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: image,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    const text = response.content[0].text.trim();
    // Strip markdown code fences if present
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean);

    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Claude API error:', err);
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'AI থেকে তথ্য পাঠানোয় সমস্যা হয়েছে। আবার চেষ্টা করুন।' });
    }
    return res.status(500).json({ error: err.message || 'বিশ্লেষণ ব্যর্থ হয়েছে' });
  }
}
