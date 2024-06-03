require('dotenv').config();
const { Ollama } = require('ollama');
const fs = require('fs');

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { prompt } = req.body;

      const response = await ollama.chat({
        model: 'Phi-3-Mini-128k',
        //options: { num_predict: 100 },
        messages: prompt,
      });

      console.log('\x1b[32m%s\x1b[0m', prompt[0].content);
      console.log('\x1b[34m%s\x1b[0m', response.message.content);
      res.status(200).json({ message: response.message });
    
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error: Could not process your request.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
}
