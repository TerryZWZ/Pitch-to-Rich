const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');

const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { chatHistory } = req.body;
      const { prompt } = req.body;

      if(chatHistory != undefined){
        const completion = await openai.createCompletion({
          model: 'text-davinci-003',
          prompt: chatHistory,
          max_tokens: 250,
          temperature: 0.7,
        });

        console.log(completion.data.choices[0].text);
        res.status(200).json({ message: completion.data.choices[0].text });
      }
      else if(prompt != undefined){
        const completion = await openai.createCompletion({
          model: 'text-davinci-003',
          prompt: prompt,
          max_tokens: 250,
          temperature: 0.7,
        });

        console.log(completion.data.choices[0].text);
        res.status(200).json({ message: completion.data.choices[0].text });
      }
    
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