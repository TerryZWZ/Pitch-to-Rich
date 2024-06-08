import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css';

const App = () => {

  // Game Variables
  const [player, setPlayer] = useState([]);
  const [NPC, setNPC] = useState({name: '', description: ''});
  const [product, setProduct] = useState({ name: '', price: 0});
  const [money, setMoney] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [score, setScore] = useState(0);
  const [hype, setHype] = useState(0);
  const [displayScore, setDisplayScore] = useState('');
  const [rep, setRep] = useState('');
  const [purchased, setPurchased] = useState([]);

  // Chat Menu Variables
  const [chat, setChat] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInstruction, setChatInstruct] = useState(false);
  const [chatDisabled, setChatDisabled] = useState(true);
  const chatRef = useRef(null);

  // Choice Menu Variables
  const [choice, setChoice] = useState([{ text: 'What product do you want to sell?', bubble: 'menu' }]);
  const [choiceHistory, setChoiceHistory] = useState([]);
  const [choiceInstruction, setChoiceInstruct] = useState(false);
  const [choiceDisabled, setChoiceDisabled] = useState(false);
  const [personFinder, setPersonFinder] = useState('');
  const choiceRef = useRef(null);
  
  // Progression Variables
  const [step, setStep] = useState(1); // Change this to skip game menus
  const [hold, setHold] = useState([]);
  const [extend, setExtend] = useState(false);
  const [joke, setJoke] = useState(true);
  const [pickNPC, setPickNPC] = useState(false);
  const [chatting, setChatting] = useState(false);
  const [clientList, setClientList] = useState([]);
  const [noClient, setNoClient] = useState(true);
  const [saveHype, setSaveHype] = useState(0);
  const [shop, setShop] = useState(false);
  const [shopInfo, setShopInfo] = useState('');
  const [buy, setBuy] = useState(false);

  // Settings
  const [localLLM, setLocalLLM] = useState(false);
  const [model, setModel] = useState('llama3-70b-8192');
  const [outputInfo, setOutputInfo] = useState({ tokens: 0, speed: 0});

/* ------------------------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------------------------ */

  // Reading instructions to start game
  useEffect(() => {
    async function readChoiceInstructions() {
      const response = await fetch('/choiceInstructions.txt');
      const text = await response.text();
      setHold([text]);
    }
    readChoiceInstructions();
  }, []);

  // Reading instructions to find people
  useEffect(() => {
    async function readChoiceInstructions() {
      const response = await fetch('/personFinder.txt');
      const text = await response.text();
      setPersonFinder(text);
    }
    readChoiceInstructions();
  }, []);

  // Reading instructions for the shop
  useEffect(() => {
    async function readChoiceInstructions() {
      const response = await fetch('/shopInstructions.txt');
      const text = await response.text();
      setShopInfo(text);
    }
    readChoiceInstructions();
  }, []);

  // Choice menu is entered
  const choiceSubmit = async (event) => {
    if (event.key === 'Enter' && event.target.value.trim() !== '' && choiceDisabled == false) {

      if (step == 1){ // Setting product to sell
        const entry = event.target.value.trim();
        setChoice([...choice, { text: entry, bubble: 'user' }, { text: 'What price do you want to sell it at?', user: 'menu' }]);
        event.target.value = '';

        setProduct({...product, name: entry});

        setStep(2);
      }
      else if (step == 2) { // Presenting 5 clients to sell to
        const entry = event.target.value.trim();
        setChoice([...choice, { text: entry, bubble: 'user' }]);
        event.target.value = '';

        setChoiceInstruct(true);
        const productPrice = parseFloat(entry); 
        setProduct(prevProduct => ({ ...prevProduct, price: prevProduct.price + productPrice }));
        setChoiceHistory([...choiceHistory, { role: 'user', content: hold[0] + product.name + ' for ' + '$' + entry + '? <end>' } ]);
        setHold([...choiceHistory, { role: 'user', content: personFinder + ' Hype: ' + hype }]);
        setExtend(true);

        setStep(3);
      }
      else if (step == 3) { // Choosing client
        const entry = event.target.value.trim();
        setChoice([...choice, { text: entry, bubble: 'user' }]);
        event.target.value = '';

        setChoiceInstruct(true);

        // Identifying NPC
        for (let i = 0; i < clientList.length; i++) {
          let number = entry.replace(/\D/g, ''); // Makes sure there is only a number
          let index = '[ ' + number + ' ]';

          if ((clientList[i].text).includes(index)) {
            setNPC(clientList[i].text);
            console.log(clientList[i].text);
            const regex = /\[\s*(\d+)\s*\]\s*([^\|]+)\|\s*(.+)/;
            const filterName = (clientList[i].text).match(regex); // Parsing name out of string
            console.log(filterName);

            if (filterName) {
              const NPCname = filterName[2];
              const NPCdescription = filterName[3];
              setNPC({name: NPCname, description: NPCdescription});
            }

            break;
          }
        }

        setPickNPC(true);
        setChoiceHistory([...choiceHistory, { role: 'user', content: entry + '<end>' } ]);
        setChatting(true);
        setChatDisabled(false);
        setNoClient(false);
        setChoiceDisabled(true);

        setStep(0);
      }
      else if (step == 4) { // Prompting user after customer encounter
        setChoiceInstruct(true);
        const entry = event.target.value.trim();
        event.target.value = '';

        if (entry == '1') {
          setChoiceInstruct(true);
          setChoice([...choice, { text: entry, bubble: 'user' }]);
          setChoiceHistory([{ role: 'user', content: 'Tell a funny joke relating to ' + product.name }]);
          setHold([{ role: 'user', content: personFinder + ' Hype: ' + hype }])
          setExtend(true);

          setStep(3);
        }

        else if (entry == '2') {
          setChoiceInstruct(true);
          setShop(true);
          setChoice([...choice, { text: entry, bubble: 'user' }, { text: 'Here is what is for sale (Press 0 to go back)', bubble: 'menu' },]);
          setChoiceHistory([{ role: 'user', content: shopInfo }]);

          setStep(5);
        }

        else if (entry == '3') {
          setChoiceInstruct(true);

          if (purchased.length == 0) {
            setChoice([...choice, { text: entry, bubble: 'user' }, { text: 'You have nothing...', bubble: 'menu', },
              { text: 'Press 1 find clients. Press 2 to buy something. Press 3 to show your purchases', bubble: 'menu' }]);
          }
          else {
            let purchasedList = [];

            for (let i = 0; i < purchased.length; i++) {
              const bubble = { text: purchased[0], bubble: 'menu' };
              purchasedList.push(bubble);
            }

            setChoice([...choice, { text: entry, bubble: 'user' }, { text: 'Here are your items', bubble: 'menu' }, ...purchaseList,
              { text: 'Press 1 find clients. Press 2 to buy something. Press 3 to show your purchases', bubble: 'menu' }]);
          }

          setStep(4);
        }
        else {
          setChoice([...choice, { text: entry, bubble: 'user' }, { text: 'Press 1 find clients. Press 2 to buy something. Press 3 to show your purchases', bubble: 'menu' }]);

          setStep(4);
        }
      }
      else if (step == 5) {
        const entry = event.target.value.trim();
        setChoice([...choice, { text: entry, bubble: 'user' }]);
        event.target.value = '';

        if (parseInt(entry) <= 5 && parseInt(entry) >= 1) {
          setChoiceInstruct(true);
          setShop(true);
          setBuy(true);
          setChoiceHistory([...choiceHistory, { role: 'user', content: entry }]);
        }
        else {
          setChoice([...choice, { text: entry, bubble: 'user' }, { text: 'Press 1 find clients. Press 2 to buy something. Press 3 to show your purchases', bubble: 'menu' }]);
        }

        setStep(4);
      }
      else if (step == 6) { // Presenting 5 clients after first time
        const entry = event.target.value.trim();
        setChoice([...choice, { text: entry, bubble: 'user' }]);
        event.target.value = '';
        setChoiceInstruct(true);
        setChoiceHistory([{ role: 'user', content: personFinder + ' Hype: ' + hype }]);
        setExtend(true);

        setStep(3);
      }
    }
  };

  // When Choice History is updated with user input, an API call occurs
  useEffect(() => {

    // Actual API Call
    const apiCall = async (prompt) => {
      setChoiceDisabled(true); // Disable menu chat during API call

      try {
        const res = await fetch('/api/bot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, localLLM, model })
        });

        const data = await res.json(); // API Return Data
        setOutputInfo({ tokens: data.tokens, speed: data.speed })
        return data.message;
      }
      catch (error) {
        console.error(error);
      }
    }

    // choiceInstruction is used to prevent looping
    if (choiceInstruction == true) {

      // Default Call
      if (extend == false && pickNPC == false && shop == false && buy == false) {
        const reply = apiCall(choiceHistory);

        reply.then(data => {
          setChoiceHistory([...choiceHistory, data ]);
          setChoice([...choice, { text: data.content, bubble: 'menu' }]);
          setChoiceDisabled(false); // Renabling Chat
          setChoiceInstruct(false);
        });
      }
      
      // Client Finder Call (Step 2)
      else if (extend == true) {

        // Initial Joke
        if (joke == true) {
          const reply = apiCall(choiceHistory);

          reply.then(replyData => {
            setChoiceHistory([...choiceHistory, replyData]);
            setChoice([...choice, { text: replyData.content, bubble: 'menu' }]);
          });

          setJoke(false);
        }

        // Finding Clients
        else {
          const extension = apiCall(hold);

          extension.then(extensionData => {
            setChoiceHistory([...choiceHistory, { role: 'user', content: hold[0].content }, extensionData]);
          
            // Splitting client list into seperate bubbles
            let clients = [];
  
            for (let i = 0; i < 5; i++) {
              clients = extensionData.content.split(' <stop>');
            }
  
            const clientData = clients.slice(0, 5).map((data) => {
              return { text: data, bubble: 'menu' };
            });
  
            setClientList(clientData);
            setChoice(prevChoice => [...prevChoice, { text: 'Here are 5 people', bubble: 'menu' }, ...clientData]);
            
            setChoiceDisabled(false); // Re-enabling Chat
            setChoiceInstruct(false);
            setExtend(false);
          });
         }
      }
      
      // Client Submission Call (Step 3)
      else if (pickNPC == true) {
        let prompt = { role: 'user', content: 'You have chosen ' + NPC.name + '. Go start a conversation!' };
        setChoiceHistory([...choiceHistory, { role: 'user', content: prompt } ]);
        setChoice([...choice, { text: prompt.content, bubble: 'menu' }]);
        setChoiceDisabled(false); // Re-enabling Chat
        setChoiceInstruct(false);
        setPickNPC(false);
      }

      // Shop Call (Step 4/5)
      else if (shop == true) {
        const reply = apiCall(choiceHistory);

        reply.then(data => {

          // Step 5
          if (buy && data.content) {
            const purchase = data.content.replace('You have bought ', '');
            const purchaseValue = parseFloat(purchase.match(/\d+(\.\d+)?/));

            // If the player does not have enough money for the item
            if (money < purchaseValue) {
              setChoice([...choice, { text: 'Too poor for ' + purchase, bubble: 'menu' },
                { text: 'Press 1 find clients. Press 2 to buy something. Press 3 to show your purchases', bubble: 'menu' }]);
            }

            // If the player does have enough money for the item
            else if (money >= purchaseValue){
              setPurchased([...purchased, purchase]);
              setMoney(money - purchaseValue);
              setChoice([...choice, { text: 'You have purchased '+ purchase, bubble: 'menu'},
                { text: 'Press 1 find clients. Press 2 to buy something. Press 3 to show your purchases', bubble: 'menu' }]);
            }

            setChoiceDisabled(false); // Re-enabling Chat
            setChoiceInstruct(false);
            setBuy(false);
            setShop(false);
          }

          // Step 4
          else if (data.content) {
            reply.then(data => {
              let store = [];

              // Splitting shop item prompt into seperate bubbles
              for (let i = 0; i < 5 && data.content; i++) {
                store = data.content.split(' <stop>');
              }

              const storeData = store.slice(0, 5).map((item) => {
                return { text: item, bubble: 'menu' };
              });

              setChoiceHistory([...choiceHistory, data ]);
              setChoice([...choice, ...storeData]);
              setChoiceDisabled(false); // Re-enabling Chat
              setChoiceInstruct(false);
              setShop(false);
            });
          }
        });
      }
    }
    //console.log(choiceHistory);
  }, [choiceHistory, outputInfo]);

  // Used to prevent looping API call by disabling choiceInstruct
  useEffect(() => {
    if (choiceDisabled == false) {
      setChoiceInstruct(false);
    }
  }, [choiceDisabled]);

/* ------------------------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------------------------ */

  // Start Chat
  useEffect(() => {
    async function readChatInstructions(NPC) {
      const name = NPC.name;
      const description = NPC.description;

      const response = await fetch('/chatInstructions.txt');
      const text = await response.text();
      const start = text + 'Your name is ' + NPC.name + '. You are a: ' + NPC.description + '. ';
    
      setChatHistory([...chatHistory, { role: 'user', content: start } ]);
    }

    if (chatting == true){
      setChat([...chat, { text: 'You are now chatting with ' + NPC.name, bubble: 'menu' }]);
      readChatInstructions(NPC);
    }
  }, [chatting]);

  // When chat menu is entered
  const chatSubmit = async (event) => {
    if (event.key === 'Enter' && event.target.value.trim() !== '' && chatDisabled == false) {
      const entry = event.target.value.trim();
      event.target.value = '';

      setChatInstruct(true);
      setPlayer([...player, entry]);
      setChat([...chat, { text: entry, bubble: 'user' }]);
      setChatHistory([...chatHistory, { role: 'user', content: entry + '<end>' } ]);
    }
  };

  // When Chat History is updated with user input, an API call occurs
  useEffect(() => {

    // Actual API Call
    const apiCall = async (prompt) => {
      setChatDisabled(true); // Disable menu chat during API call

      try {
        const res = await fetch('/api/bot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, localLLM, model })
        });

        const data = await res.json(); // API Return Data
        setOutputInfo({ tokens: data.tokens, speed: data.speed })
        return data.message
      }
      catch (error) {
        console.error(error);
      }
    }

    // chatInstruction is used to prevent looping
    if (chatInstruction == true) {
      const reply = apiCall(chatHistory);

      reply.then(data => {
        const scoreRegex = /<score\s+(\d+)>/;
        const hypeRegex = /<hype\s+(\d+)>/;
        const scoreMatch = (data.content).match(scoreRegex);
        const hypeMatch = (data.content).match(hypeRegex);
        const scoreAdd = scoreMatch ? parseInt(scoreMatch[1]) : null;
        const hypeAdd = hypeMatch ? parseInt(hypeMatch[1]) : null;
        const message = data.content.replace(/<score\s\d+>|<hype\s\d+>/g, '');

        setDisplayScore('Score: ' + scoreAdd);
        setRep('Rep: ' + hypeAdd);
        setSaveHype(hypeAdd);
        setScore(scoreAdd);

        setChatHistory([...chatHistory, data ]);
        setChat([...chat, { text: message, bubble: 'menu' }]);

        setChatDisabled(false); // Renabling Chat
        setChatInstruct(false);
      });
    }
    
    //console.log(chatHistory);
  }, [chatHistory, outputInfo, chatInstruction, localLLM, model]);

  // Used to prevent looping API call by disabling chatInstruct
  useEffect(() => {
    if (score >= 100) {
      setChoiceInstruct(false);
      setChoiceHistory([]); // Emptying choice history for next round

      // Checking if the player scammed the customer
      let scam = true;

      for (let i = 0; i < choiceHistory.length; i++) {
        if (choiceHistory[i].content.includes(product.name.toLowerCase())){
          scam = false;
        }
      }

      if (scam){
        setChat([...chat, { text: 'You scammed a customer?', bubble: 'user' }]);

        setMoney(money + product.price);
        setHype(hype - saveHype);
        setCustomers(customers + 1);
      }
      else {
        setChat([...chat, { text: 'You earned a customer!', bubble: 'user' }]);

        setMoney(money + product.price);
        setHype(hype + saveHype);
        setCustomers(customers + 1);
      }

      setChatInstruct(false);
      setChatDisabled(true);
      setChatting(false);

      setNPC({ name: '', description: '' });
      setDisplayScore('');
      setRep('');

      setChoice([...choice, { text: 'Congratulations. Press 1 find clients. Press 2 to buy something. Press 3 to show your purchases', bubble: 'menu' }]);
      setChoiceDisabled(false);

      setStep(4);
      setScore(0);
    }

    else if (score <= 0 && chatting == true) {
      setChoiceInstruct(false);
      setChoiceHistory([]);

      setChat([...chat, { text: 'You lost a customer...', bubble: 'user' }]);
      setChatDisabled(true);
      setChatting(false);

      setNPC({ name: '', description: '' });
      setDisplayScore('');
      setRep('');

      setChoice([...choice, { text: 'Unforunate. Press 1 find clients. Press 2 to buy something. Press 3 to show your purchases', bubble: 'menu' }]);
      setChoiceDisabled(false);

      setStep(4);
      setScore(0);
    }
  }, [score]);

  // Used to prevent looping API call by disabling chatInstruct
  useEffect(() => {
    setChatInstruct(false);
  }, [chatDisabled]);

  const changeMethod = (event) => {
    const selectedMethod = event.target.value;
    setLocalLLM(selectedMethod == 'Local');
  }

  const changeModel = (event) => {
    const selectedMethod = event.target.value;
    setModel(selectedMethod);
  }

  // Used to autoscroll chat interfaces
  useEffect(() => {
    if (choiceRef.current) {
      choiceRef.current.scrollTop = choiceRef.current.scrollHeight;
    }
  }, [choice]);

  // Used to autoscroll chat interfaces
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chat]);

  // Display
  return (
    <div className={styles.container}>
      <div className={styles.chatContainer}>

        {/* Start of Left Container */}
        <div className={styles.infoMenu}>

          {/* Information Card */}
          <div className={styles.progressionInfo}>
            <div className = {styles.productContainer}>
              <div className = {styles.product}>Product: {product.name}</div>
              <div className = {styles.product}>Price: ${product.price}</div>
            </div>
            <br></br><br></br>
            <div className = {styles.scoreContainer}>
              <div className = {styles.score}>Money: ${money}</div>
              <div className = {styles.score}>Hype: {hype}</div>
              <div className = {styles.score}>Customers: {customers}</div>
            </div>
          </div>

          {/* Character Card */}
          <div className={styles.characterInfo}>
            <div className = {styles.characterContainer}>
              <div>
                <div className={styles.nameCharacter}>{NPC.name}</div>
                <br></br>
                <div className={styles.descriptionScore}>{displayScore}</div>
                <br></br>
                <div className={styles.descriptionScore}>{rep}</div>
                <br></br>
                <div className={styles.descriptionCharacter}>{NPC.description}</div>
              </div>
              {noClient && <div className={styles.noClient}>Find a Customer to pitch your product</div>}
            </div>
          </div>

        </div>

        {/* Conversation Chat */}
        <div className={styles.chat}>
          <div className={styles.playerContainer} ref={chatRef}>
            {chat.map((message, index) => (
              <div key={index} className={styles.entry}>
                <div style={{ backgroundColor: message.bubble == 'user' ? '#222D54' : '#FF8787' }} className={styles.bubble}>{message.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interface */}
        <div className={styles.choiceContainer}>

          {/* Interface Chat */}
          <div className={styles.choiceMenu} ref={choiceRef}>
            {choice.map((message, index) => (
              <div key={index} className={styles.entry}>
                <div style={{ backgroundColor: message.bubble == 'user' ? '#b1cfb7' : '#fae1b2' }} className={styles.choiceBubble}>{message.text}</div>
              </div>
            ))}
          </div>

          {/* Interface Prompt */}
          <div className={styles.choicePromptContainer}>
            <div style={{ display: choiceDisabled ? 'flex' : 'none' }} className={styles.loadingIndicator}>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
            </div>
            <input
              className={styles.choicePrompt}
              type='text'
              onKeyDown={choiceSubmit}
            />
          </div>

          {/* Options */}
          <div className={styles.options}>
            <select className={styles.methodSelect} onChange={changeMethod}>
              <option value="Remote">Remote API</option>
              <option value="Local">Local API</option>
            </select>

            {localLLM && (
              <select className={styles.localSelect}  onChange={changeModel} defaultValue = "">
                <option value="" disabled>Select a Model</option>
                <option value="Llama-3-8B-1048k">Llama 3 8B (1048k Context)</option>
                <option value="Phi-3-Mini-128k">Phi 3 Mini (128k Context)</option>
              </select>
            )}

            {!localLLM && (
              <select className={styles.localSelect}  onChange={changeModel} defaultValue = "llama3-70b-8192">
                <option value="llama3-70b-8192">Llama 3 70B (8K Context)</option>
                <option value="mixtral-8x7b-32768">Mixtral 8x7B (32K Context)</option>
              </select>
            )}
          </div>

          <div className={styles.outputInfo}>
            <p className={styles.outputText}>Tokens: {outputInfo.tokens}</p>
            <p className={styles.outputText}>Speed: {outputInfo.speed} t/s</p>
          </div>

        </div>

      </div>

      {/* Conversation Prompt */}
      <div className={styles.promptContainer}>
        <div style={{ display: chatDisabled && chatting && !choiceDisabled ? 'flex' : 'none' }} className={styles.loadingIndicator}>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
        </div>
        <input
          className={styles.prompt}
          type='text'
          onKeyDown={chatSubmit}
        />
      </div>
    </div>
  );
};

export default App;