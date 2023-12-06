function CardGame(board, hideBtn, restartBtn) {
  const BOARD = board;
  const HINT_BTN = hideBtn;
  const RESTART_BTN = restartBtn;

  const CARDS_NUM = 52;
  const CARD_LIST = board.children;
  const HIDE_CARD = "./src/hide.png";

  const SHOW_ALL_TIME = 5000;
  const SHOW_HINT_TIME = 2000;

  // 기존의 카드 초기화를 위한 배열
  let randNumArr = [];
  // 카드의 짝을 확인하기 위한 배열
  let twoCards = [];
  // 정답배열
  let pairArr = [];

  // 랜덤한 숫자로 채워진 배열을 반환합니다.
  function initRandNumArr() {
    randNumArr = Array.from(new Array(CARDS_NUM), (e, i) => i).sort((a, b) => Math.random() - 0.5);
  }

  // 게임 보드에 이미지 태그를 만들어요.
  function makeImgTag() {
    // 섞인 숫자 배열을 통해서 카드를 태그로 만들어내요.
    BOARD.innerHTML = randNumArr.reduce((prev, num, index) => {
      // data-index 속성은 카드의 숫자를 알아내기 위한 배열의 인덱스입니다.
      prev += `<img data-index='${index}' draggable='false'>`;
      return prev;
    }, "");
  }

  // 모든 카드의 앞면을 보여줍니다.
  function showAllCards() {
    for (const card of CARD_LIST) {
      flipFront(card);
    }
  }

  // 힌트 버튼이 눌리면 작동해요.
  function hint() {
    // 카드가 보여지는 동안은 카드가 활성화(클릭, 이벤트) 되지 않아요.
    toggleCardListener(false);
    toggleBtnListener(false);

    // 모든 카드를 보여줍니다.
    showAllCards();

    // 힌트 시간만큼 후에 카드를 뒤집고 비활성화 되었던 버튼과 카드의 클릭 이벤트를 활성화 합니다.
    setTimeout(() => {
      hideAllCards();
      toggleBtnListener(true);
      toggleCardListener(true);
    }, SHOW_HINT_TIME);
  }

  // 모든 카드를 덮는다.(뒷면이 보이게 한다.)
  function hideAllCards() {
    // 이미 맞춘 카드를 제외하고 전부 뒤집어요.
    for (const card of CARD_LIST) {
      if (pairArr.indexOf(card.getAttribute("data-index")) === -1) {
        hideCard(card);
      }
    }
  }

  // 카드를 뒤집어요.
  function clickCard(e) {
    // 동일한 카드를 검증하기 위한 배열에는 실제 선택된 카드 객체가 담겨야해요.
    const card = e.target;

    // 선택된 카드의 앞면을 보여주어요.
    flipFront(card);

    // 한장의 카드가 선택되어있는 상황에서 버튼의 작동을 막아요.
    toggleBtnListener(false);

    // 비교를 위한 배열에 카드를 넣어요.
    if (!twoCards.length) {
      twoCards.push(card);
    } else if (twoCards.includes(card)) {
      // 같은 카드가 눌렸어요.
      hideCard(card);
      // 카드 비교를 위한 배열을 비웁니다.
      twoCards.pop();
      // 다시 막아놨던 힌트버튼과 재시작 버튼을 풀어줘요.
      toggleBtnListener(true);
    } else {
      // 처음과 다른 카드가 눌렸습니다.
      twoCards.push(card);
    }

    // 두장의 카드가 뒤집혀야 다음 단계로 진행할 수 있어요.
    if (!(twoCards.length === 2)) return;

    // 두 카드의 비교가 끝나기 전까지 사용자와의 상호작용을 막습니다.
    toggleCardListener(false);
    toggleBtnListener(false);

    // 두장의 카드에요
    const CARD1 = twoCards.shift();
    const CARD2 = twoCards.shift();

    // 두 카드가 같지 않아요!
    if (!isSameCards(CARD1, CARD2)) {
      // 두 카드가 동일하지 않을때 틀린 카드를 잠시 보여준 후 카드를 뒤집어요
      setTimeout(() => {
        hideCard(CARD1, CARD2);
        toggleCardListener(true);
        toggleBtnListener(true);
      }, 800);
      return;
    } else {
      // 두 카드가 동일하면 클릭 이벤트를 제거해요.
      CARD1.classList.remove("clickAble");
      CARD2.classList.remove("clickAble");

      // 정답 배열에 정답인 카드의 data-index값을 저장합니다.
      pairArr.push(CARD1.getAttribute("data-index"));
      pairArr.push(CARD2.getAttribute("data-index"));

      // 스코어를 수정해요.
      setScore(pairArr.length * 100);

      // 게임을 재개해요. 게임 재개시 버튼도 다시 동작합니다.
      setTimeout(() => {
        toggleCardListener(true);
        toggleBtnListener(true);
      }, 500);

      // 모든 카드를 다 맞췄나요?
      if (isAllPair()) {
        // 모든 카드를 맞췄습니다 게임을 종료해요.
        window.alert("축하합니다");
      }
      return;
    }
  }

  // 점수판을 수정합니다.
  function setScore(num) {
    const scoreBoard = document.getElementById("score");
    if (typeof num === "number") scoreBoard.innerText = `score : ${num}`;
  }

  // 모든 카드의 짝이 맞았는지 검증하는 함수입니다.
  function isAllPair() {
    return pairArr.length === CARDS_NUM;
  }

  // 선택 된 카드의 앞면을 보여주는 함수입니다.
  function flipFront(card) {
    // 선택된 카드의 진짜 숫자는 해당 카드 이미지 태그의 data-index의 값을 통해 알 수 있어요.
    const realNumber = randNumArr[card.getAttribute("data-index")];

    // 카드가 앞면이 보여질때는 뒤집혀있으면 안되어요.
    flipAnimation(card, false);

    // 카드의 원래 모습을 보여줍니다.
    card.src = `./src/${realNumber}.png`;
  }

  // 카드를 다시 뒷면으로 돌려놓습니다.
  function hideCard(card1, card2) {
    // 다시 카드가 뒤집히는 애니메이션을 부여합니다.
    flipAnimation(card1, true);
    if (card2) flipAnimation(card2, true);

    // 이 메서드는 인자가 한개만 호출될 때가 있어서 코드를 작성할때 예외상황을 대비해야 합니다.
    card1.src = HIDE_CARD;
    if (card2) card2.src = HIDE_CARD;
  }

  // 두 카드가 동일한지를 비교하는 함수입니다.
  function isSameCards(card1, card2) {
    // 카드의 data-index 어트리뷰트를 가져와요.
    // 해당 번호로 섞여있는 카드 배열에 접근하면 카드의 진짜 숫자를 알 수 있어요.
    const a = randNumArr[card1.getAttribute("data-index")];
    const b = randNumArr[card2.getAttribute("data-index")];

    // 두 카드의 동일 여부는 카드번호가 26번 떨어져있는가 입니다.
    return a === parseInt((b + 26) % 52);
  }

  // 카드의 클릭 이벤트를 켜고 끌 수 있습니다.
  function toggleCardListener(flag) {
    for (const card of CARD_LIST) {
      // 카드의 선택 효과를 활성화 / 비활성화 합니다.
      if (flag) {
        // 이미 맞춘 카드들은 이벤트리스너를 주면 안돼요.
        if (pairArr.indexOf(card.getAttribute("data-index")) === -1) {
          // 카드들에 css 선택효과(마우스 호버시)를 부여합니다.
          card.classList.add("clickAble");

          // 카드의 클릭 이벤트를 활성화 합니다.
          card.onclick = clickCard;
        }
      } else {
        card.classList.remove("clickAble");
        card.onclick = null;
      }
    }
  }

  // 선택된 카드에 뒤집히는 효과를 주거나, 빼앗습니다.
  function flipAnimation(card, flag) {
    if (flag) card.classList.add("flip");
    else card.classList.remove("flip");
  }

  // 사용자 조작 버튼들을 활성/비활성화 하는 메서드 입니다.
  function toggleBtnListener(flag) {
    RESTART_BTN.onclick = flag ? gameStart : null;
    HINT_BTN.onclick = flag ? hint : null;
  }

  // 게임 시작.
  function gameStart() {
    // 1. 랜덤한 카드 숫자를 배열에 초기화 합니다.
    initRandNumArr();

    // 2. 이미지 태그를 만들어요.
    makeImgTag();

    // 3. 모든 배열을 초기화 해요.
    pairArr = [];
    twoCards = [];

    // 게임 점수를 0점으로 초기화 해요.
    setScore(0);

    // 게임이 시작되기 전까지는 버튼들을 활성화하지 않아요.
    toggleBtnListener(false);

    // 모든 카드의 앞면을 보여주어요.
    showAllCards();

    // 수 초 동안 카드를 보여주고 뒤집어버려요.
    setTimeout(() => {
      hideAllCards();
      // 힌트, 재시작 등의 사용자 버튼의 동작을 허용합니다.
      toggleBtnListener(true);
      toggleCardListener(true);
    }, SHOW_ALL_TIME);
  }

  // 외부에서 게임시작 메서드를 호출하기 위한 public 메서드에요.
  this.gameStart = () => {
    gameStart();
  };
}
