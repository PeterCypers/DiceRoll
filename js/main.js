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
  selected = false; // aka yahtzee-frozen

  constructor(eyes, color) {
    this.eyes = eyes;
    
    this.setColor(color);
    this.setImage(eyes, color)
  }

  setColor(color) {
    this.color = color;
  }

  // class toggling and boolean toggling work, but are too opaque
  // toggleSelected() {
  //   this.selected = !this.selected;
  // }
  selectDie() {
    this.selected = true;
  }

  unselectDie() {
    this.selected = false;
  }

  setImage(eyes, color) {
    this.image = this.#imageList.get(color)[eyes-1]; //convert eyes to array-index-position with -1
  }

  roll() {
    if(!this.selected){
      let newEyes = Math.floor(Math.random() * 6 + 1);
      this.eyes = newEyes;
      this.setImage(newEyes, this.color);
    }
  }
}

class DiceCollection {
  dice = [];
  diceCount;
  diceColor;
  bgc;
  diceSize;
  diceArea = document.getElementById("dice_container");
  yahtzeeModeCheckbox = document.getElementById("yz_cb");
  history = [];

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

  rollDice() {
    this.dice.forEach((die) => {
      die.roll();
    });
    this.toHtml();
    this.toHistory();
  }

  rollDiceAnimated() {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        this.dice.forEach((die) => {
          die.roll();
        });
        this.toHtml();
      }, i * 200)
    }
    // after all reroll for visual effect, the final result to the history:
    this.toHistory();
  }

  toHistory() {
    if(this.history.length >= 5) {
      this.history.shift();
    }
    this.history.push(this.dice.map(((die) => die.eyes)));
  }

  historyToString() {
    let retStr = "";
    for (let i = 0; i < this.history.length; i++) {
      retStr += `Roll #${i+1} = ${this.history[i]}\n`;
    }
    return retStr;
  }

  showHistory() {
    if(this.history.length == 0) {
      alert("No Rolls to display...")
    }else{
      alert(this.historyToString());
    }
  }

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

  //we need to redraw the dice when yahtzee mode toggles -> see cb onchange
  yahtzeeModeDiceRedraw() {
    this.toHtml();
  }

  // attribute aria-selected for accessibility (screen readers)
  toHtml() {
    /* redefined as object-field:
    const DICE_AREA = document.getElementById("dice_container");
    DICE_AREA.innerHTML = ""; */
    this.diceArea.innerHTML = "";
    const yahtzeeMode = this.yahtzeeModeCheckbox.checked;

    this.dice.forEach(die => {
      // when not in yahtzee mode make sure dice start unselected
      if (!yahtzeeMode) {
        die.unselectDie();
      }
      const dieContainer = document.createElement("div");
      dieContainer.classList.add("die_container");
      dieContainer.classList.add(this.bgc);
      const dieElement = document.createElement("img");
      dieElement.src = `${die.image}`;
      dieElement.alt = `a ${die.color} die with ${die.eyes} eye(s)`;
      dieElement.classList.add(`${this.diceSize}`);
      //init-selected-state
      if(die.selected){
        dieElement.classList.add("die_selected");
        dieElement.setAttribute('aria-selected', 'true');
      } else {
        dieElement.classList.remove("die_selected");
        dieElement.setAttribute('aria-selected', 'false');
      }
      //toggle-selected-state
      dieElement.onclick = () => {
        if(yahtzeeMode) {
          // general note: if-else structure necesary over multiple if's -> that would cause 2nd if to eval differently after 1st if has modified the eval-values
          // if die is not selected: select die (set selected: true and add selected to classlist)
          if(!die.selected) {
            // dieElement.classList.toggle("die_selected"); // works, but too opaque
            die.selectDie();
            dieElement.classList.add("die_selected");
            dieElement.setAttribute('aria-selected', 'true');
            //if die is selected: unselect die (set selected: false and remove selected from classlist)
          } else { 
            die.unselectDie();
            dieElement.classList.remove("die_selected");
            dieElement.setAttribute('aria-selected', 'false');
          }
        }
      };
      
      // innerHTML is insufficient since the addition of an on-click we prefer an 'element' as target to call on-click
      // dieContainer.innerHTML = `<img src="${die.image}" alt="a ${die.color} die with ${die.eyes} eye(s)" class="${this.diceSize}">`;
      dieContainer.insertAdjacentElement('beforeend', dieElement);
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
    resizeDiceImages(slider.value); // immediate change when manipulating slider (immediate UI update)
    diceCollection.setDiceSize(this.value); // update the object values for toHtml() (long term change future UI update)
  }
}

function toggleYZ_ResetBtn_confirmCbContainer_Visibility(selected) {
  const diceContainer = document.getElementById("dice_container");
  const yahtzeeConfirmResetCheckboxContainer = document.getElementById("yz_confirm_cb_container");
  const yahtzeeExtrasHideableOuterContainer = document.getElementById("hideable_yahtzee_extras_outercontainer");
  if (selected) {
    yahtzeeExtrasHideableOuterContainer.classList.remove("hidden");
    yahtzeeConfirmResetCheckboxContainer.classList.remove("hidden");
    diceContainer.classList.replace("mt-30", "mt-15");
  }
  if (!selected) {
    yahtzeeExtrasHideableOuterContainer.classList.add("hidden");
    yahtzeeConfirmResetCheckboxContainer.classList.add("hidden");
    diceContainer.classList.replace("mt-15", "mt-30");
  }
}

function getFromStorage() {
  const STORAGE_KEY = "dice_roll";
  const STORAGE = localStorage;
  return JSON.parse(STORAGE.getItem(STORAGE_KEY));
}

function setToStorage(savestate) {
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
  const rollBtn = document.getElementById("roll_btn");
  const animationCheckbox = document.getElementById("animate_cb");
  const showHistoryBtn = document.getElementById("showhistory_btn");
  const yahtzeeCheckbox = document.getElementById("yz_cb");
  const yahtzeeConfirmResetCheckbox = document.getElementById("yz_confirm_cb");
  const yahtzeeSelectResetBtn = document.getElementById("reset_yahtzee_dice_selection_btn");
  const rollCounter = document.getElementById("roll_counter");
  // https://stackoverflow.com/questions/1933969/sound-effects-in-javascript-html5
  // requires special path: from host github's root(projectname)
  // like project Reminders App: savebase64.js ln.49: "url(/RemindersApp/images/default_background.jpg)"
  const sfx_roll = new Audio("/DiceRoll/sfx/Dice Rolling Sound Effect.mp3");

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
    STORAGE_OBJECT["animation"] = animationCheckbox.checked;
    STORAGE_OBJECT["yahtzee"] = yahtzeeCheckbox.checked;
    STORAGE_OBJECT["yahtzee_safe_reset"] = yahtzeeConfirmResetCheckbox.checked;

    setToStorage(STORAGE_OBJECT);
  }
  // populate the UI with correct values when the page loads
  const savedState = getFromStorage();
  bgcSelect.value = savedState["background_color"];
  diceColorSelect.value = savedState["dice_color"];
  diceCountSelect.value = savedState["dice_count"];
  slider.value = savedState["dice_size"];
  sfxCheckbox.checked = savedState["sound_effect"];
  animationCheckbox.checked = savedState["animation"];
  yahtzeeCheckbox.checked = savedState["yahtzee"];
  yahtzeeConfirmResetCheckbox.checked = savedState["yahtzee_safe_reset"];

  // initial setup of the dice(container)
  const diceCollection = initDice();

  initSlider(diceCollection);
  initMainBGC();
  toggleYZ_ResetBtn_confirmCbContainer_Visibility(yahtzeeCheckbox.checked);

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
      <p>Options</p>
      ${downBtnImg}
      `
    }else{
      optionBtn.innerHTML = `
      <p>Options</p>
      ${upBtnImg}
      `
    }
  };
  rollBtn.onclick = () => {
    // a list of rollable(not frozen for yahtzee mode) dice
    const rollableDiceCollection = document.querySelectorAll('img[aria-selected="false"]');

    // play sound effect when SFX-option turned on AND there are dice that can roll
    if(sfxCheckbox.checked && rollableDiceCollection.length > 0) {
      sfx_roll.play();
    }
    // keep count when we're in yahtzee mode (add one to the current counter)
    // we also add to the roll-counter only if dice were rolled (not all frozen + click roll dice)
    if(yahtzeeCheckbox.checked && rollableDiceCollection.length > 0) {
      let plusOne = parseInt(rollCounter.innerText) + 1;
      rollCounter.innerText = String(plusOne);
    }
    if (animationCheckbox.checked) {
      rollBtn.disabled = true;
      setTimeout(() => {
        rollBtn.disabled = false;
      }, 1600)
      diceCollection.rollDiceAnimated();
    } else {
      rollBtn.disabled = false;
      diceCollection.rollDice();
    }
  };
  animationCheckbox.onchange = () => {
    const currentState = getFromStorage();
    currentState["animation"] = animationCheckbox.checked;
    setToStorage(currentState);
  };
  yahtzeeCheckbox.onchange = () => {
    const currentState = getFromStorage();
    diceCollection.yahtzeeModeDiceRedraw(); //we need to trigger a toHTML to repopulate dice after mode-toggle
    toggleYZ_ResetBtn_confirmCbContainer_Visibility(yahtzeeCheckbox.checked);
    currentState["yahtzee"] = yahtzeeCheckbox.checked;
    setToStorage(currentState);
  };
  yahtzeeConfirmResetCheckbox.onchange = () => {
    const currentState = getFromStorage();
    currentState["yahtzee_safe_reset"] = yahtzeeConfirmResetCheckbox.checked;
    setToStorage(currentState);
  };
  showHistoryBtn.onclick = () => {
    diceCollection.showHistory();
  };
  yahtzeeSelectResetBtn.onclick = () => {
    const lockedDiceCollection = document.querySelectorAll('img[aria-selected="true"]');

    if (yahtzeeConfirmResetCheckbox.checked && lockedDiceCollection.length > 0){
      if (confirm("Reset selection?")) {
        rollCounter.innerText = "0";
        lockedDiceCollection.forEach(el => el.click());
      }
    } else {
      rollCounter.innerText = "0";
      lockedDiceCollection.forEach(el => el.click());
    }
  };
}

window.onload = init;