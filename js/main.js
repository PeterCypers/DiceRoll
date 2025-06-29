const SIZEMAP = new Map([
  ["1", "xxs"],
  ["11", "xs"],
  ["21", "s"],
  ["31", "m"],
  ["41", "l"],
  ["51", "xl"],
  ["61", "xxl"],
]);

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
  diceSize;
  diceArea = document.getElementById("dice_container");

  constructor(diceCount, diceColor, bgc, diceSize) {
    this.diceCount = diceCount;
    this.diceColor = diceColor;
    this.bgc = bgc;
    this.diceSize = diceSize;
    this.initDice();
    this.toHtml();
  }

  /** 
   * Happens every time the color or eyes need to change (or any field in Dice obj changes)
  */
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

  setDiceSize(newDiceSize) {
    const diceSize = SIZEMAP.get(newDiceSize);
    this.diceSize = diceSize;
    this.toHtml();
  }

  toHtml() {
    /* redefined as object-field:
    const DICE_AREA = document.getElementById("dice_container");
    DICE_AREA.innerHTML = ""; */
    this.diceArea.innerHTML = "";

    this.dice.forEach(die => {
      const dieContainer = document.createElement("div");
      dieContainer.classList.add("die_container");
      dieContainer.classList.add(this.bgc);
      dieContainer.innerHTML = `<img src="${die.image}" alt="a ${die.color} die with ${die.eyes} eye(s)" class="${this.diceSize}">`;

      this.diceArea.append(dieContainer);
    });
  }
}

// slider values(also in storage) differ from visible feedback number value
function calculatedVisibleSize(value) {
  if(value.length == 1){
    return value;
  }
  let firstNumber = Number(value[0]);
  let secondNumber = Number(value[1]);
  return String(firstNumber + secondNumber);
}

// should happen only once: webpage onload: called at init()
function initDice() {
  const diceColor = document.getElementById("dicecolor_select").value; // get color from the select option
  const diceCount = document.getElementById("dicecount_select").value; // get dice-count from the select option
  const bgc = document.getElementById("bgc_select").value;
  const sliderValue = document.getElementById("dice_size_slider").value;
  const diceSize = SIZEMAP.get(sliderValue);
  return new DiceCollection(diceCount, diceColor, bgc, diceSize);
}

// when any change happens (color/dicecount) //TODO: will this function get used?
function reloadDice() {

}

function resetClasslist(element) {
  element.classList.remove(...element.classList); //remove all existing colors with spread operator to access all elements in classlist
}

function initMainBGC() {
  const currentState = getFromStorage();
  const color = currentState.background_color;
  const mainElement = document.getElementsByTagName("main")[0];
  resetClasslist(mainElement); //remove all existing colors with spread operator to access all elements in classlist
  mainElement.classList.add(color);
}

function changeBGC(color) {
  const mainElement = document.getElementsByTagName("main")[0];
  resetClasslist(mainElement); //remove all existing colors with spread operator to access all elements in classlist
  mainElement.classList.add(color);
}

/**
 * expect parameter values: ["1", "11", "21", "31", "41", "51", "61"]
 * translates and adds the translation to classlist for styling
 */
function resizeDiceImages(size) {
  const TRANSLATED_SIZE = SIZEMAP.get(size);

  const images = document.querySelectorAll("img");
  images.forEach(image => {
    resetClasslist(image);
    image.classList.add(TRANSLATED_SIZE);
  });
}

function initSlider(diceCollection) {
  // https://www.w3schools.com/howto/howto_js_rangeslider.asp
  var slider = document.getElementById("dice_size_slider");
  var output = document.getElementById("size_feedback");
  output.innerHTML = calculatedVisibleSize(slider.value); // Display the default slider value
  resizeDiceImages(slider.value);

  // Update the current slider value (each time you drag the slider handle)
  slider.oninput = function() {
    const currentState = getFromStorage();
    output.innerHTML = calculatedVisibleSize(this.value);
    currentState["dice_size"] = this.value;
    setToStorage(currentState);
    resizeDiceImages(slider.value); // immediate change when manipulating slider
    diceCollection.setDiceSize(this.value);
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
  const mainElement = document.getElementsByTagName("main")[0];
  const bgcSelect = document.getElementById("bgc_select");
  const diceColorSelect = document.getElementById("dicecolor_select");
  const diceCountSelect = document.getElementById("dicecount_select");
  const slider = document.getElementById("dice_size_slider");
  const sfxCheckbox = document.getElementById("sfx_cb");
  const optionBtn = document.getElementById("option_btn");
  const optionContainer = document.getElementById("dice_options");
  const upBtnImg = `<img src="img/arro-up-3100.svg" alt="open/close options">`;
  const downBtnImg = `<img src="img/arrow-down-3101.svg" alt="open/close options"></img>`;

  /**
   * Saved values: background color / dice-color / dice-count / dice size
   * Not saved: dice eyes
   */
  if(!getFromStorage()) { // Init localstorage
    const STORAGE_OBJECT = {};
    STORAGE_OBJECT["background_color"] = bgcSelect.value;
    STORAGE_OBJECT["dice_color"] = diceColorSelect.value;
    STORAGE_OBJECT["dice_count"] = diceCountSelect.value;
    STORAGE_OBJECT["dice_size"] = slider.value;
    STORAGE_OBJECT["sound_effect"] = sfxCheckbox.checked;

    setToStorage(STORAGE_OBJECT);
  }
  // populate the UI with correct values when the page loads
  const savedState = getFromStorage();
  bgcSelect.value = savedState["background_color"];
  diceColorSelect.value = savedState["dice_color"];
  diceCountSelect.value = savedState["dice_count"];
  slider.value = savedState["dice_size"];
  sfxCheckbox.checked = savedState["sound_effect"];

  // initial setup of the dice(container)
  const diceCollection = initDice();

  initSlider(diceCollection);
  initMainBGC();

  //set change behavior for all select options
  //requestAnimationFrame should solve some issues on mobile (see md-file in docs)
  bgcSelect.onchange = () => {
    requestAnimationFrame(() => {
      const currentState = getFromStorage();
      resetClasslist(mainElement);
      mainElement.classList.add(bgcSelect.value);
      diceCollection.setBGC(bgcSelect.value);
      currentState["background_color"] = bgcSelect.value;
      setToStorage(currentState);
      changeBGC(bgcSelect.value);
    });
  };
  diceColorSelect.onchange = () => {
    requestAnimationFrame(() => {
      const currentState = getFromStorage();
      diceCollection.setDiceColor(diceColorSelect.value);
      currentState["dice_color"] = diceColorSelect.value;
      setToStorage(currentState);
    });
  };
  diceCountSelect.onchange = () => {
    requestAnimationFrame(() => {
      const currentState = getFromStorage();
      diceCollection.setDiceCount(diceCountSelect.value);
      currentState["dice_count"] = diceCountSelect.value;
      setToStorage(currentState);
    });
  };
  sfxCheckbox.onchange = () => {
    const currentState = getFromStorage();
    currentState["sound_effect"] = sfxCheckbox.checked;
    setToStorage(currentState);
  };
  optionBtn.onclick = () => {
    optionContainer.classList.toggle("hidden");
    if(optionContainer.classList.contains("hidden")) {
      optionBtn.innerHTML = `
      <p>Toggle Options</p>
      ${downBtnImg}
      `
    }else{
      optionBtn.innerHTML = `
      <p>Toggle Options</p>
      ${upBtnImg}
      `
    }
  };
}

window.onload = init;