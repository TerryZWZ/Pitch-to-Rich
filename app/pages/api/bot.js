require('dotenv').config();
const { Groq } = require('groq-sdk');
const { Ollama } = require('ollama');
const fs = require('fs');

const groq = new Groq({ apiKey:  process.env.GROQ_API_KEY});
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { prompt, localLLM, model } = req.body;
      let message;
      let tokens;
      let speed;

      if (localLLM) {
        const response = await ollama.chat({
          model: model,
          options: {
            num_predict: 1024,
            //temperature: ,
            //"stop": [],
          },
          messages: prompt,
        });

        message = response.message;
        tokens = response.eval_count;
        speed = Math.round(response.eval_count / (response.eval_duration / (10**9)));
      }
      else {
        const response = await groq.chat.completions.create({
          model: model,
          max_tokens: 1024,
          //temperature: ,
          //stop: ,
          messages: prompt
        })

        message = response.choices[0]?.message;
        tokens = response.usage?.completion_tokens;
        speed = Math.round(response.usage?.completion_tokens / response.usage?.total_time)
      }

      //console.log('\x1b[32m%s\x1b[0m', prompt[0].content);
      //console.log('\x1b[34m%s\x1b[0m', message);

      res.status(200).json({ message: message, tokens: tokens, speed: speed});
    
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error: Could not process your request.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
}
