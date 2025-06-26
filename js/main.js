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
    const diceArea = document.getElementById("dice_container");
    diceArea.innerHTML = "";

    this.dice.forEach(die => {
      const dieContainer = document.createElement("div");
      dieContainer.classList.add("die_container");
      dieContainer.classList.add(this.bgc);
      dieContainer.innerHTML = `<img src="${die.image}" alt="a ${die.color} die with ${die.eyes} eye(s)">`;

      diceArea.append(dieContainer);
    });
  }
}

// happens initially, and every time the color is chosen
function initDice() {
  let testColor = "red"; // get color from the select option
  let testDiceCount = 2; // get dice-count from the select option
  let bgc = "white";

  return new DiceCollection(testDiceCount, testColor, bgc);
}

// when any change happens (color/dicecount)
function reloadDice() {

}

function resetClasslist(element) {
  element.classList.remove(...element.classList); //remove all existing colors with spread operator to access all elements in classlist
}

function initMainBGC() {
  // TODO get bgc from localstorage
  const color = "white";
  const mainElement = document.getElementsByTagName("main")[0];
  resetClasslist(mainElement); //remove all existing colors with spread operator to access all elements in classlist
  mainElement.classList.add(color);
}

function changeBGC() {
  // TODO get bgc from localstorage
}

function init() {
  const mainElement = document.getElementsByTagName("main")[0];
  initMainBGC();
  console.log("testloading");
  // colors: aliceblue, darkorchid
  // TODO get color & dicecount from localstorage
  // TODO elegant use of localstorage with nested fields under "diceroll"
  const diceCollection = initDice();

  const bgcSelect = document.getElementById("bgc_select");
  bgcSelect.onchange = () => {
    resetClasslist(mainElement);
    mainElement.classList.add(bgcSelect.value);
    diceCollection.setBGC(bgcSelect.value);
  }

  const diceColorSelect = document.getElementById("dicecolor_select");
  diceColorSelect.onchange = () => {
    diceCollection.setDiceColor(diceColorSelect.value);
  }

  const diceCountSelect = document.getElementById("dicecount_select");
  diceCountSelect.onchange = () => {
    diceCollection.setDiceCount(diceCountSelect.value);
  }
}

window.onload = init;