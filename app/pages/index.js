import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css';

const App = () => {

  // Game Variables
  const [player, setPlayer] = useState([]);
  const [NPC, setNPC] = useState({name: '', description: ''});
  const [product, setProduct] = useState({ name: '', price: 0});
  const [money, setMoney] = useState(0);
  const [hype, setHype] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [score, setScore] = useState(0);
  const [purchased, setPurchased] = useState([]);

  // Chat Menu Variables
  const [chat, setChat] = useState([]);
  const [chatHistory, setChatHistory] = useState('');
  const [chatInstruction, setChatInstruct] = useState(false);
  const [chatDisabled, setChatDisabled] = useState(false);

  // Choice Menu Variables
  const [choice, setChoice] = useState([{ text: 'What product do you want to sell?', bubble: 'menu' }]);
  const [choiceHistory, setChoiceHistory] = useState('');
  const [choiceInstruction, setChoiceInstruct] = useState(false);
  const [choiceDisabled, setChoiceDisabled] = useState(false);
  const [personFinder, setPersonFinder] = useState('');

  // Progression Variables
  const [intro, setIntro] = useState(true);
  const [hold, setHold] = useState('');
  const [extend, setExtend] = useState(false);
  const [step, setStep] = useState(1);
  const [pickNPC, setPickNPC] = useState(false);
  const [chatting, setChatting] = useState(false);
  const [clientList, setClientList] = useState([]);
  const [noClient, setNoClient] = useState(true);
  const [saveHype, setSaveHype] = useState(0);
  const [shop, setShop] = useState(false);
  const [shopInfo, setShopInfo] = useState('');
  const [buy, setBuy] = useState(false);

/* ------------------------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------------------------ */

  // Reading instructions to start game
  useEffect(() => {
    async function readChoiceInstructions() {
      const response = await fetch('/choiceInstructions.txt');
      const text = await response.text();
      setHold(text);
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
        setChoiceInstruct(true);
        const entry = event.target.value.trim();
        setChoice([...choice, { text: entry, bubble: 'user' }]);
        event.target.value = '';
        const productPrice = parseFloat(entry); 
        setProduct(prevProduct => ({ ...prevProduct, price: prevProduct.price + productPrice }));
        setChoiceHistory(hold + product.name + ' for ' + '$' + entry + ' <end>');
        setHold(choiceHistory + ' ' + personFinder + ' Hype: ' + hype);
        setExtend(true);
        setStep(3);
      }
      else if (step == 3) { // Choosing client
        setChoiceInstruct(true);
        const entry = event.target.value.trim();
        setChoice([...choice, { text: entry, bubble: 'user' }]);
        event.target.value = '';

        // Identifying NPC
        for (let i = 0; i < clientList.length; i++) {
          let number = entry.replace(/\D/g, ''); // Makes sure there is only a number
          let index = '[ ' + number + ' ]'

          if ((clientList[i].text).includes(index)) {
            setNPC(clientList[i].text);

            const regex = /\[ ([^\]]+) \] (\w+) \| (.+)/;
  
            const filterName = (clientList[i].text).match(regex); // Parsing name out of string

            if (filterName) {
              const NPCname = filterName[2];
              const NPCdescription = filterName[3];
              setNPC({name: NPCname, description: NPCdescription});
            }

            break;
          }
        }

        setPickNPC(true);
        setChoiceHistory(choiceHistory + ' ' + entry + '<end>');
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
          setChoice([...choice, { text: entry, bubble: 'user' }]);
          setStep(6);
        }
        else if (entry == '2') {
          setChoice([...choice, { text: entry, bubble: 'user' }, { text: 'Here is what is for sale (Press 0 to go back)', bubble: 'user' },]);
          setHold(choiceHistory);
          setShop(true);
          setChoiceHistory(shopInfo);
          setStep(5);
        }
        else if (entry == '3') {
          if (purchased.length == 0) {
            setChoice([...choice, { text: entry, bubble: 'user' }, { text: 'You have nothing...', bubble: 'user', },
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
          setChoice([...choice, { text: entry, bubble: 'user' }]);
          setStep(4);
        }
      }
      else if (step == 5) {
        setChoiceInstruct(true);
        const entry = event.target.value.trim();
        setChoice([...choice, { text: entry, bubble: 'user' }]);
        event.target.value = '';
        if (entry == '0') {
          setChoice([...choice, { text: entry, bubble: 'user' }, { text: 'Press 1 find clients. Press 2 to buy something. Press 3 to show your purchases', bubble: 'menu' }]);
        }
        else {
          setBuy(true);
          setChoiceHistory(...choiceHistory + entry);
        }
        setStep(4);
      }
      else if (step == 6) { // Presenting 5 clients after first time
        setChoiceInstruct(true);
        const entry = event.target.value.trim();
        setChoice([...choice, { text: entry, bubble: 'user' }]);
        event.target.value = '';
        setChoiceHistory(hold + product.name + ' for ' + '$' + product.price + ' <end>');
        setHold(choiceHistory + ' ' + personFinder);
        setExtend(true);
        setStep(3);
      }
    }
  };

  // When Choice History is updated with user input, an OpenAI API call occurs
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
          body: JSON.stringify({ prompt }),
        });

        const data = await res.json(); // API Return Data

        return data.message
      }
      catch (error) {
        console.error(error);
      }
    }

    // choiceInstruction is used to prevent looping
    if (choiceInstruction == true) {

      // Default Call
      if (extend == false && pickNPC == false) {
        const reply = apiCall(choiceHistory);
        reply.then(data => {
          setChoiceHistory(choiceHistory + ' ' + data);
          setChoice([...choice, { text: data, bubble: 'menu' }]);
          setChoiceDisabled(false); // Renabling Chat
          setChoiceInstruct(false);
        });
      }

      // Client Finder Call (Step 2)
      if (extend == true) {
        const reply = apiCall(choiceHistory);
        const extension = apiCall(hold);
        Promise.all([reply, extension]).then(data => {
          const [replyData, extensionData] = data;
          setChoiceHistory(choiceHistory + ' ' + replyData + ' ' + hold + ' ' + extensionData);

          let clients = [];

          for (let i = 0; i < 5; i++) {
            clients = extensionData.split(' <stop>');
          }

          const clientData = clients.slice(0, 5).map((data) => {
            return { text: data, bubble: 'menu' };
          });

          setClientList(clientData);

          if (replyData.includes('Error')) {
            setChoice([...choice, { text: 'Here are 5 people', bubble: 'menu' }, ...clientData]);
          }
          else {
            setChoice([...choice, { text: replyData, bubble: 'menu' }, { text: 'Here are 5 people', bubble: 'menu' }, ...clientData]);
          }
          
          setChoiceDisabled(false); // Re-enabling Chat
          setChoiceInstruct(false);
          setExtend(false);
        });
      }

      // Client Submission Call (Step 3)
      else if (pickNPC == true) {
        const reply = apiCall(choiceHistory);
        reply.then(data => {
          setChoiceHistory(choiceHistory + ' ' + data);
          setChoice([...choice, { text: data, bubble: 'menu' }]);
          setChoiceDisabled(false); // Re-enabling Chat
          setChoiceInstruct(false);
        });
      }

      // Shop Call (Step 4/5)
      else if (shop == true) {
        const reply = apiCall(choiceHistory);

        reply.then(data => {
          if (buy) {
            setChoiceHistory(hold);

            const purchase = data.replace('You have bought ', '');
            const purchaseValue = parseInt(purchase.split('-'));

            if (money < purchaseValue) {
              setChoice([...choice, { text: 'Too poor for ' + purchase, bubble: 'menu' },
                { text: 'Press 1 find clients. Press 2 to buy something. Press 3 to show your purchases', bubble: 'menu' }]);
            }
            else if (money >= purchaseValue){
              setPurchased([...purchased, purchase]);
              setChoice([...choice, { test: 'You have purchased '+ purchase, bubble: 'menu'},
                { text: 'Press 1 find clients. Press 2 to buy something. Press 3 to show your purchases', bubble: 'menu' }]);
            }

            setBuy(false);
          }
          else {
            reply.then(data => {
              setChoiceHistory(choiceHistory + ' ' + data);
              setChoice([...choice, { text: data, bubble: 'menu' }]);
            });
          }

          setChoiceDisabled(false); // Re-enabling Chat
          setChoiceInstruct(false);
          setShop(false);
        });
      }
    }
    
    console.log(choiceHistory);
  }, [choiceHistory, choiceInstruction]);

  // Used to prevent looping API call by disabling choiceInstruct
  useEffect(() => {
    setChoiceInstruct(false);
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
      const cmd = start + 'BECOME YOURSELF'
    
      setChatHistory(cmd);
    }

    if (chatting == true){
      setChat([...chat, { text: 'You are now chatting with ' + NPC.name, bubble: 'menu' }]);
      readChatInstructions(NPC);
    }
  }, [chatting]);

  // When chat menu is entered
  const chatSubmit = async (event) => {
    if (event.key === 'Enter' && event.target.value.trim() !== '' && chatDisabled == false) {
      setChatInstruct(true);
      const entry = event.target.value.trim();
      setPlayer([...player, entry]);
      setChat([...chat, { text: entry, bubble: 'user' }]);
      event.target.value = '';
      setChatHistory(chatHistory + entry + '<end>\n\n');
    }
  };

  // When Chat History is updated with user input, an OpenAI API call occurs
  useEffect(() => {
    const apiCall = async () => {
      if (chatInstruction == true) {
        setChatDisabled(true);
        try {
          const res = await fetch('/api/bot', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ chatHistory }),
          });

          const data = await res.json();

          setChat([...chat, { text: data.message, bubble: 'menu' }]);
          setChatHistory(chatHistory + data.message + '\n\n');

          const scoreRegex = /<score\s+(\d+)>/;
          const hypeRegex = /<hype\s+(\d+)>/;
          const scoreMatch = (data.message).match(scoreRegex);
          const hypeMatch = (data.message).match(hypeRegex);
          const scoreAdd = scoreMatch ? parseInt(scoreMatch[1]) : null;
          const hypeAdd = hypeMatch ? parseInt(hypeMatch[1]) : null; 

          setScore(scoreAdd);
          setSaveHype(hypeAdd);

          setChatDisabled(false);
        }
        catch (error) {
          console.error(error);
        }
      }
    }
    apiCall();
    console.log(score);
  }, [chatHistory, chatInstruction]);

  // Used to prevent looping API call by disabling chatInstruct
  useEffect(() => {
    if (score == 100) {
      setChat([...chat, { text: 'You earned a customer!', bubble: 'user' }]);
      setChatHistory('');
      setChatInstruct(false);
      setChatDisabled(true);

      setMoney(money + product.price);
      setHype(hype + saveHype);
      setCustomers(customers + 1);

      setChoice([...choice, { text: 'Unforunate. Press 1 find clients. Press 2 to buy something. Press 3 to show your purchases', bubble: 'menu' }]);
      setChoiceDisabled(false);
      setChoiceHistory('');
      setStep(4);
    }
    else if (score < 0) {
      setChat([...chat, { text: 'You lost a customer...', bubble: 'user' }]);
      setChatHistory('');
      setChatInstruct(false);
      setChatDisabled(true);
      setChoiceDisabled(false);

      setChoice([...choice, { text: 'Unforunate. Press 1 find clients. Press 2 to buy something. Press 3 to show your purchases', bubble: 'menu' }]);
      setChoiceDisabled(false);
      setChoiceHistory('');
      setStep(4);
    }
  }, [score]);


  // Used to prevent looping API call by disabling chatInstruct
  useEffect(() => {
    setChatInstruct(false);
  }, [chatDisabled]);

  return (
    <div className={styles.container}>
      <div className={styles.chatContainer}>
        <div className={styles.infoMenu}>
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
          <div className={styles.characterInfo}>
            <div className = {styles.characterContainer}>
              <div className={styles.nameCharacter}>{NPC.name}</div>
              <br></br><br></br>
              <div className={styles.descriptionCharacter}>{NPC.description}</div>
              {noClient && <div className={styles.noClient}>Find a Customer to pitch your product</div>}
            </div>
          </div>
        </div>
        <div className={styles.chat}>
          <div className={styles.playerContainer}>
            {chat.map((message, index) => (
              <div key={index} className={styles.entry}>
                <div style={{ backgroundColor: message.bubble == 'user' ? '#222D54' : '#FF8787' }} className={styles.bubble}>{message.text}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.choiceContainer}>
          <div className={styles.choiceMenu}>
            {choice.map((message, index) => (
              <div key={index} className={styles.entry}>
                <div style={{ backgroundColor: message.bubble == 'user' ? '#b1cfb7' : '#fae1b2' }} className={styles.choiceBubble}>{message.text}</div>
              </div>
            ))}
          </div>
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
        </div>
      </div>
      <div className={styles.promptContainer}>
        <div style={{ display: chatDisabled && chatting ? 'flex' : 'none' }} className={styles.loadingIndicator}>
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