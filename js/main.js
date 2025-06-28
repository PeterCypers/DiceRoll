class Dice {
  #imageList = new Map([
    ['white', ["dice/white/dice-number-one-black-outline-20371.svg", "dice/white/dice-number-two-black-outline-20370.svg", "dice/white/dice-number-three-black-outline-20369.svg", "dice/white/dice-number-four-black-outline-20368.svg", "dice/white/dice-number-five-black-outline-20367.svg", "dice/white/dice-number-six-black-outline-20366.svg"]],
    ['black', ["dice/black/black-dice-number-one-20231.svg", "dice/black/black-dice-number-two-20230.svg", "dice/black/black-dice-number-three-20229.svg", "dice/black/black-dice-number-four-20228.svg", "dice/black/black-dice-number-five-20227.svg", "dice/black/black-dice-number-six-20226.svg"]],
    ['red', ["dice/red/red-dice-number-one-20204.svg", "dice/red/red-dice-number-two-20203.svg", "dice/red/red-dice-number-three-20202.svg", "dice/red/red-dice-number-four-20201.svg", "dice/red/red-dice-number-five-20200.svg", "dice/red/red-dice-number-six-20199.svg"]]
  ]);
  eyes;
  color;
  image;

  constructor(eyes, color) {
    this.eyes = eyes;
    
    this.setColor(color);
    this.setImage(eyes, color)
  }

  setColor(color) {
    this.color = color;
  }

  setImage(eyes, color) {
    this.image = this.#imageList.get(color)[eyes-1]; //convert eyes to array-index-position with -1
  }

  roll() {
    let newEyes = Math.floor(Math.random() * 6 + 1);
    this.eyes = newEyes;
    this.setImage(newEyes, this.color);
  }
}

class DiceCollection {
  dice = [];
  diceCount;
  diceColor;
  bgc;

  constructor(diceCount, diceColor, bgc) {
    this.diceCount = diceCount;
    this.diceColor = diceColor;
    this.bgc = bgc;
    this.initDice();
    this.toHtml();
  }

  initDice() {
    this.dice = [];
    for (let i = 1; i <= this.diceCount; i++) {
      this.dice.push(new Dice(1, this.diceColor));
    }
  }

  rollDice() {}

  setBGC(bgc) {
    this.bgc = bgc;
    this.toHtml();
  }

  setDiceColor(color) {
    this.diceColor = color;
    this.initDice();
    this.toHtml();
  }

  setDiceCount(newdiceCount) {
    this.diceCount = Number(newdiceCount);
    this.initDice();
    this.toHtml();
  }

  toHtml() {
    const DICE_AREA = document.getElementById("dice_container");
    DICE_AREA.innerHTML = "";

    this.dice.forEach(die => {
      const dieContainer = document.createElement("div");
      dieContainer.classList.add("die_container");
      dieContainer.classList.add(this.bgc);
      dieContainer.innerHTML = `<img src="${die.image}" alt="a ${die.color} die with ${die.eyes} eye(s)">`;

      DICE_AREA.append(dieContainer);
    });
  }
}

// happens initially, and every time the color is chosen
function initDice() {
  const DICE_COLOR = document.getElementById("dicecolor_select").value; // get color from the select option
  const DICE_COUNT = document.getElementById("dicecount_select").value; // get dice-count from the select option
  const BGC = document.getElementById("bgc_select").value;

  return new DiceCollection(DICE_COUNT, DICE_COLOR, BGC);
}

// when any change happens (color/dicecount)
function reloadDice() {

}

function resetClasslist(element) {
  element.classList.remove(...element.classList); //remove all existing colors with spread operator to access all elements in classlist
}

function initMainBGC() {
  const SAVEDSTATE = getFromStorage();
  const COLOR = SAVEDSTATE.background_color;
  const MAIN_ELEMENT = document.getElementsByTagName("main")[0];
  resetClasslist(MAIN_ELEMENT); //remove all existing colors with spread operator to access all elements in classlist
  MAIN_ELEMENT.classList.add(COLOR);
}

function changeBGC(color) {
  const MAIN_ELEMENT = document.getElementsByTagName("main")[0];
  resetClasslist(MAIN_ELEMENT); //remove all existing colors with spread operator to access all elements in classlist
  MAIN_ELEMENT.classList.add(color);
}

function calculatedVisibleSize(value) {
  if(value.length == 1){
    return value;
  }
  let firstNumber = Number(value[0]);
  let secondNumber = Number(value[1]);
  return String(firstNumber + secondNumber);
}

function initSlider() {
  const SAVEDSTATE = getFromStorage();
  // https://www.w3schools.com/howto/howto_js_rangeslider.asp
  var slider = document.getElementById("dice_size_slider");
  var output = document.getElementById("size_feedback");
  output.innerHTML = calculatedVisibleSize(slider.value); // Display the default slider value

  // Update the current slider value (each time you drag the slider handle)
  slider.oninput = function() {
    output.innerHTML = calculatedVisibleSize(this.value);
    SAVEDSTATE["dice_size"] = this.value;
    setToStorage(SAVEDSTATE);
  }
}

function getFromStorage(){
  const STORAGE_KEY = "dice_roll";
  const STORAGE = localStorage;
  return JSON.parse(STORAGE.getItem(STORAGE_KEY));
}

function setToStorage(savestate){
  const STORAGE_KEY = "dice_roll";
  const STORAGE = localStorage;
  STORAGE.setItem(STORAGE_KEY, JSON.stringify(savestate));
}


function init() {
  const STORAGE_KEY = "dice_roll";
  const STORAGE = localStorage;
  const MAIN_ELEMENT = document.getElementsByTagName("main")[0];
  const BGC_SELECT = document.getElementById("bgc_select");
  const DICE_COLOR_SELECT = document.getElementById("dicecolor_select");
  const DICE_COUNT_SELECT = document.getElementById("dicecount_select");
  const SLIDER = document.getElementById("dice_size_slider");

  /**
   * Saved values: background color / dice-color / dice-count / TODO: dice size
   * Not saved: dice eyes
   */
  if(!STORAGE.getItem(STORAGE_KEY)) { // Init localstorage
    const STORAGE_OBJECT = {};
    STORAGE_OBJECT["background_color"] = BGC_SELECT.value;
    STORAGE_OBJECT["dice_color"] = DICE_COLOR_SELECT.value;
    STORAGE_OBJECT["dice_count"] = DICE_COUNT_SELECT.value;
    STORAGE_OBJECT["dice_size"] = SLIDER.value;

    // STORAGE.setItem(STORAGE_KEY, JSON.stringify(STORAGE_OBJECT));
    setToStorage(STORAGE_OBJECT);
  }
  // when we have values in localstorage: set the optionselect to correct values
  const SAVEDSTATE = JSON.parse(STORAGE.getItem(STORAGE_KEY));
  BGC_SELECT.value = SAVEDSTATE["background_color"];
  DICE_COLOR_SELECT.value = SAVEDSTATE["dice_color"];
  DICE_COUNT_SELECT.value = SAVEDSTATE["dice_count"];
  SLIDER.value = SAVEDSTATE["dice_size"];

  initSlider();
  initMainBGC();
  const diceCollection = initDice();

  //set change behavior for all select options
  BGC_SELECT.onchange = () => {
    resetClasslist(MAIN_ELEMENT);
    MAIN_ELEMENT.classList.add(BGC_SELECT.value);
    diceCollection.setBGC(BGC_SELECT.value);
    SAVEDSTATE["background_color"] = BGC_SELECT.value;
    // STORAGE.setItem(STORAGE_KEY, JSON.stringify(SAVEDSTATE));
    setToStorage(SAVEDSTATE);
    changeBGC(BGC_SELECT.value);
  }
  DICE_COLOR_SELECT.onchange = () => {
    diceCollection.setDiceColor(DICE_COLOR_SELECT.value);
    SAVEDSTATE["dice_color"] = DICE_COLOR_SELECT.value;
    // STORAGE.setItem(STORAGE_KEY, JSON.stringify(SAVEDSTATE));
    setToStorage(SAVEDSTATE);
  }
  DICE_COUNT_SELECT.onchange = () => {
    diceCollection.setDiceCount(DICE_COUNT_SELECT.value);
    SAVEDSTATE["dice_count"] = DICE_COUNT_SELECT.value;
    // STORAGE.setItem(STORAGE_KEY, JSON.stringify(SAVEDSTATE));
    setToStorage(SAVEDSTATE);
  }
}

window.onload = init;