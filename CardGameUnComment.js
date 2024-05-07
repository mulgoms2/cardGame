function CardGame(board, hideBtn, restartBtn) {
  const BOARD = board;
  const HINT_BTN = hideBtn;
  const RESTART_BTN = restartBtn;

  const CARDS_NUM = 52;
  const CARD_LIST = board.children;
  const HIDE_CARD = "./src/hide.png";

  const SHOW_ALL_TIME = 5000;
  const SHOW_HINT_TIME = 2000;

  let randNumArr = [];
  let twoCards = [];
  let pairArr = [];

  function initRandNumArr() {
    randNumArr = [...Array(CARDS_NUM)].map((e, i) => i).sort((a, b) => Math.random() - 0.5);
  }

  function makeImgTag() {
    BOARD.innerHTML = randNumArr.reduce((prev, num, index) => {
      prev += `<img data-index='${index}' draggable='false'>`;
      return prev;
    }, "");
  }

  function showAllCards() {
    [...CARD_LIST].forEach(flipFront);
  }

  function hint() {
    toggleCardListener(false);
    toggleBtnListener(false);

    showAllCards();

    setTimeout(() => {
      hideAllCards();
      toggleBtnListener(true);
      toggleCardListener(true);
    }, SHOW_HINT_TIME);
  }

  function hideAllCards() {
    [...CARD_LIST].filter((e) => pairArr.indexOf(e.getAttribute("data-index")) === -1).forEach((e) => hideCard(e));
  }

  function clickCard(e) {
    const card = e.target;

    flipFront(card);

    toggleBtnListener(false);

    if (!twoCards.length) {
      twoCards.push(card);
    } else if (twoCards.includes(card)) {
      hideCard(card);
      twoCards.pop();
      toggleBtnListener(true);
    } else {
      twoCards.push(card);
    }

    if (!(twoCards.length === 2)) return;

    toggleCardListener(false);
    toggleBtnListener(false);

    const CARD1 = twoCards.shift();
    const CARD2 = twoCards.shift();

    if (!isSameCards(CARD1, CARD2)) {
      setTimeout(() => {
        hideCard(CARD1, CARD2);
        toggleCardListener(true);
        toggleBtnListener(true);
      }, 800);
      return;
    } else {
      CARD1.classList.remove("clickAble");
      CARD2.classList.remove("clickAble");

      pairArr.push(CARD1.getAttribute("data-index"));
      pairArr.push(CARD2.getAttribute("data-index"));

      setScore(pairArr.length * 100);

      setTimeout(() => {
        toggleCardListener(true);
        toggleBtnListener(true);
      }, 500);

      if (isAllPair()) {
        window.alert("축하합니다");
      }
      return;
    }
  }

  function setScore(num) {
    const scoreBoard = document.getElementById("score");
    if (typeof num === "number") scoreBoard.innerText = `score : ${num}`;
  }

  function isAllPair() {
    return pairArr.length === CARDS_NUM;
  }

  function flipFront(card) {
    const realNumber = randNumArr[card.getAttribute("data-index")];

    flipAnimation(card, false);

    card.src = `./src/${realNumber}.png`;
  }

  function hideCard(card1, card2) {
    flipAnimation(card1, true);
    if (card2) flipAnimation(card2, true);

    card1.src = HIDE_CARD;
    if (card2) card2.src = HIDE_CARD;
  }

  function isSameCards(card1, card2) {
    const a = randNumArr[card1.getAttribute("data-index")];
    const b = randNumArr[card2.getAttribute("data-index")];

    return a === parseInt((b + 26) % 52);
  }

  function toggleCardListener(flag) {
    [...CARD_LIST].forEach((card) => {
      if (flag) {
        if (pairArr.indexOf(card.getAttribute("data-index")) === -1) {
          card.classList.add("clickAble");

          card.onclick = clickCard;
        }
      } else {
        card.classList.remove("clickAble");
        card.onclick = null;
      }
    });
  }

  function flipAnimation(card, flag) {
    if (flag) card.classList.add("flip");
    else card.classList.remove("flip");
  }

  function toggleBtnListener(flag) {
    RESTART_BTN.onclick = flag ? gameStart : null;
    HINT_BTN.onclick = flag ? hint : null;
  }

  function gameStart() {
    initRandNumArr();

    makeImgTag();

    pairArr = [];
    twoCards = [];

    setScore(0);

    toggleBtnListener(false);

    showAllCards();

    setTimeout(() => {
      hideAllCards();
      toggleBtnListener(true);
      toggleCardListener(true);
    }, SHOW_ALL_TIME);
  }

  this.gameStart = () => {
    gameStart();
  };
}
