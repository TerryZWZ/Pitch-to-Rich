const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');

const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { prompt } = req.body;

      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: prompt,
        max_tokens: 250,
        temperature: 0.7,
      });

      console.log(completion.data.choices[0].message.content);
      res.status(200).json({ message: completion.data.choices[0].message });
    
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error: Could not process your request.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
}