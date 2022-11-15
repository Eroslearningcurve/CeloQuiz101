import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import BigNumber from "bignumber.js";
import { sha3_256 } from "js-sha3";
import speedQuizAbi from "../contract/speedQuiz.abi.json";
const ERC20_DECIMALS = 18;
const quizHubCA = "0xeD9Ee3cCc95f685AD366ca86358C72817Db9C192";

// defining variables
let contract;
let kit;
let playerQuizState = 0;

let id = (id) => document.getElementById(id);
let classes = (classes) => document.getElementsByClassName(classes);
let query = (query) => document.querySelector(query);

let questionNumber = 0,
  quiztimer,
  questionTimer;
let questionAnswersGiven = 0;
let remainingtimeForQuiz = 0;

function notification(_text) {
  query(".alert").style.display = "block";
  query("#notification").textContent = _text;
}

function notificationOff() {
  query(".alert").style.display = "none";
}

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount);
  const cUSDBalance = totalBalance.CELO.shiftedBy(-ERC20_DECIMALS).toFixed(2);
  query("#balance").textContent = cUSDBalance;
  notificationOff();
};

const reconnect = async function () {
  if (window.celo) {
    try {
      await window.celo.enable();

      const web3 = new Web3(window.celo);
      kit = newKitFromWeb3(web3);

      const accounts = await kit.web3.eth.getAccounts();
      kit.defaultAccount = accounts[0];

      contract = new kit.web3.eth.Contract(speedQuizAbi, quizHubCA);
      getBalance();
    } catch (error) {
      notification(`⚠️ ${error}.`);
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.");
  }
};

async function loadQuestions(quizId) {
  const quiz = await getQuiz(quizId);
  displayInitialData(quiz);
}

const getPlayerQuizState = async function (quizId) {
  try {
    const player = kit.defaultAccount;
    let playerInfo = await contract.methods
      .getPlayerQuizInfo(player, quizId)
      .call();
    playerQuizState = playerInfo.state;
  } catch (e) {
    console.log(e);
  }
};

// for converting b64 to utf8
export const base64ToUTF8String = (base64String) => {
  return Buffer.from(base64String, "base64").toString("utf-8");
};

// for converting utf8 to b64
export const utf8ToBase64String = (utf8String) => {
  return Buffer.from(utf8String, "utf8").toString("base64");
};

// to get quiz information
async function getQuiz(quizId) {
  let _quiz = new Promise(async (resolve, reject) => {
    let p = await contract.methods.getQuiz(quizId).call();
    resolve({
      id: quizId,
      title: p.title,
      creator: p.creator,
      questions: p.questions,
      createdAt: p.createdAt,
      timePerQuestion: p.timePerQuestion,
      totalTime: p.totalTime,
      quizPool: p.quizPool,
    });
  });

  return _quiz;
}

// function to start quiz
async function startQuiz(quizId) {
  try {
    let fee = await contract.methods.getGameFee().call();
    const result = await contract.methods
      .startQuiz(quizId)
      .send({ from: kit.defaultAccount, value: fee });

    return true;
  } catch (error) {
    notification(`⚠️ ${error}.`);
    return false;
  }
}

// function to end quiz
async function endQuiz(quizTitle, quizId, score) {
  const rewardPhrase = sha3_256(utf8ToBase64String(quizTitle.toUpperCase()));
  try {
    if (!score || score < 0) score = 5;
    const params = [quizId, score, `0x${rewardPhrase}`];
    console.log(params);
    const result = await contract.methods
      .endQuiz(...params)
      .send({ from: kit.defaultAccount });
    return true;
  } catch (error) {
    console.log(error);
    notification(`⚠️ ${error}.`);
    return false;
  }
}

// function to calculate player score
function calcScore(
  totalTime,
  remainingtimeForQuiz,
  noOfQuestions,
  questionAnswersGiven
) {
  let score;
  if (sessionStorage.getItem("userScore") !== null) {
    score = sessionStorage.getItem("userScore");
  } else {
    // weight given to correct answers is 10% and speed is 90%
    score =
      (questionAnswersGiven / noOfQuestions) * 10 +
      (remainingtimeForQuiz / totalTime) * 90;

    sessionStorage.setItem("userScore", Math.round(score));
  }
  return score;
}

// to check answer
let checkAnswer = (answerGiven, rightAnswer, options) => {
  if (answerGiven === base64ToUTF8String(rightAnswer)) {
    id(answerGiven).style.background = "#228B22";
    id(answerGiven).style.color = "#fff";
    questionAnswersGiven++;
  } else {
    if (answerGiven) {
      id(answerGiven).style.background = "#FA8072";
      id(answerGiven).style.color = "#fff";
    }
    //lose 10 seconds for every wrong answer
    remainingtimeForQuiz -= 10;
  }
};

// redering data of question
let renderQuestion = (questionDetail) => {
  id("question").innerHTML = questionDetail.question;
  let radioOption = id("radio-options");
  radioOption.innerHTML = "";

  // rendering radio option
  questionDetail.options.map((option) => {
    let Div = document.createElement("div");
    Div.setAttribute("id", option);
    let RadioButton = document.createElement("input");
    RadioButton.setAttribute("type", "radio");
    RadioButton.setAttribute("name", "answer");
    RadioButton.setAttribute("value", option);
    RadioButton.setAttribute("class", "form-check-input");

    let Label = document.createElement("label");
    Label.innerHTML = option;
    Label.setAttribute("class", "form-check-label");

    Div.appendChild(RadioButton);
    Div.appendChild(Label);
    radioOption.appendChild(Div);
  });
};

// displaying initial data
let displayInitialData = (quizChosen) => {
  id("quiz-title").innerHTML = quizChosen.title;
  let date = new Date(quizChosen.createdAt * 1000);
  let noOfQuestions = quizChosen.questions.length;
  date = new Date(date.getTime());

  id("created-at").innerHTML = date;
  id(
    "quiz-time"
  ).innerHTML = `1. Max time to solve quiz is ${quizChosen.totalTime} sec`;
  id(
    "drop-down-quiz-time"
  ).innerHTML = `1. Max time to solve quiz is ${quizChosen.totalTime} sec`;
  id(
    "question-time"
  ).innerHTML = `2. Max time to solve one question is ${quizChosen.timePerQuestion} sec`;
  id(
    "drop-down-question-time"
  ).innerHTML = `2. Max time to solve one question is ${quizChosen.timePerQuestion} sec`;

  classes("container-box")[0].style.display = "flex";

  if (
    new BigNumber(quizChosen.quizPool) <
      new BigNumber(5).shiftedBy(ERC20_DECIMALS) ||
    noOfQuestions < 5
  ) {
    id("rules-box").style.display = "none";
    id("info-box").style.display = "flex";
  } else {
    id("rules-box").style.display = "flex";
    id("info-box").style.display = "none";
  }

  let quizBalances = classes("quizBalance");

  quizBalances[0].textContent = new BigNumber(quizChosen.quizPool)
    .shiftedBy(-ERC20_DECIMALS)
    .toFixed(2);

  quizBalances[1].textContent = new BigNumber(quizChosen.quizPool)
    .shiftedBy(-ERC20_DECIMALS)
    .toFixed(2);

  let questionTags = classes("noOfQuestions");

  questionTags[0].textContent = noOfQuestions;
  questionTags[1].textContent = noOfQuestions;

  if (playerQuizState == 1) {
    id("rules-box").style.display = "none";
    id("end-quiz-box").style.display = "flex";
  }

  if (kit.defaultAccount != quizChosen.creator) {
    let adminbtns = classes("adminBtns");
    for (let i = 0; i < adminbtns.length; i++) {
      adminbtns[i].style.display = "none";
    }
  } else {
    id("startBtn").style.display = "none";
  }

  remainingtimeForQuiz = quizChosen.totalTime;

  // timmer for quiz
  let checkTimeForQuiz = () => {
    if (remainingtimeForQuiz === 0) {
      if (questionNumber < quizChosen.questions.length) {
        let answerGiven = query("input[name='answer']:checked");
        if (answerGiven) {
          answerGiven = answerGiven.value;
        }
        checkAnswer(
          answerGiven,
          quizChosen.questions[questionNumber].answer,
          quizChosen.questions[questionNumber].options
        );
      }
      id("question-box").style.display = "none";
      id("end-quiz-box").style.display = "flex";
    } else {
      remainingtimeForQuiz--;
      id("quiz-time-left").innerHTML = remainingtimeForQuiz;
      quiztimer = setTimeout(checkTimeForQuiz, 1000);
    }
  };

  let remainingTimeForQuestion = quizChosen.timePerQuestion;

  // timmer for question
  let checkTimeforQuestion = () => {
    if (remainingTimeForQuestion === 1) {
      let answerGiven = query("input[name='answer']:checked");
      if (answerGiven) {
        answerGiven = answerGiven.value;
      }
      if (questionNumber < quizChosen.questions.length - 1) {
        remainingTimeForQuestion = quizChosen.timePerQuestion;
      }

      checkAnswer(
        answerGiven,
        quizChosen.questions[questionNumber].answer,
        quizChosen.questions[questionNumber].options
      );
      classes("submit")[0].classList.add("disabled");
      classes("next")[0].classList.remove("disabled");
      questionNumber++;
      nextQuestion();
    } else {
      id("question-time-left").innerHTML = remainingTimeForQuestion;
      remainingTimeForQuestion--;
      id("question-time-left").innerHTML = remainingTimeForQuestion;
      questionTimer = setTimeout(checkTimeforQuestion, 1000);
    }
  };

  // start quiz sequence
  classes("start-quiz")[0].addEventListener(
    "click",
    async () => {
      notification(`⌛ Starting Quiz...`);
      if (quizChosen.creator == kit.defaultAccount) {
        notification(`⚠️ You can't participate in your quiz.`);
        return;
      }
      let successful = await startQuiz(quizChosen.id);
      if (successful) {
        renderQuestion(quizChosen.questions[questionNumber]);
        id("rules-box").style.display = "none";
        id("question-box").style.display = "block";

        id("quiz-time-left").innerHTML = remainingtimeForQuiz;
        quiztimer = setTimeout(checkTimeForQuiz, 1000);

        id("question-time-left").innerHTML = remainingTimeForQuestion;
        questionTimer = setTimeout(checkTimeforQuestion, 1000);
      }
      setTimeout(notificationOff(), 5000);
    },
    { once: true }
  );

  // next question sequence
  let nextQuestion = async () => {
    if (questionNumber >= quizChosen.questions.length) {
      clearInterval(quiztimer);

      let noOfQuestions = quizChosen.questions.length;

      if (!questionAnswersGiven) {
        remainingtimeForQuiz = 0;
      }
      notification(`⌛ Ending Quiz...`);

      const userScore = calcScore(
        quizChosen.totalTime,
        remainingtimeForQuiz,
        noOfQuestions,
        questionAnswersGiven
      );

      const successful = await endQuiz(
        quizChosen.title,
        quizChosen.id,
        Math.round(userScore)
      );

      if (successful) {
        sessionStorage.setItem("userScore", Math.round(userScore));
        window.location = "result.html";
      }
    } else if (questionNumber === quizChosen.questions.length - 1) {
      classes("next")[0].innerHTML = "Show Result";
      renderQuestion(quizChosen.questions[questionNumber]);
      id("question-time-left").innerHTML = remainingTimeForQuestion;
      quiztimer = setTimeout(checkTimeforQuestion, 1000);
      classes("next")[0].classList.add("disabled");
      classes("submit")[0].classList.remove("disabled");
    } else {
      renderQuestion(quizChosen.questions[questionNumber]);
      id("question-time-left").innerHTML = remainingTimeForQuestion;
      quiztimer = setTimeout(checkTimeforQuestion, 1000);
      classes("next")[0].classList.add("disabled");
      classes("submit")[0].classList.remove("disabled");
    }
  };

  // next sequence sequence
  classes("next")[0].addEventListener("click", () => {
    nextQuestion();
  });

  // submit sequence
  classes("submit")[0].addEventListener("click", () => {
    let answerGiven = query("input[name='answer']:checked");

    if (answerGiven) {
      answerGiven = answerGiven.value;
    }

    clearInterval(questionTimer);

    remainingTimeForQuestion = quizChosen.timePerQuestion;

    checkAnswer(
      answerGiven,
      quizChosen.questions[questionNumber].answer,
      quizChosen.questions[questionNumber].options
    );

    questionNumber++;

    classes("submit")[0].classList.add("disabled");
    classes("next")[0].classList.remove("disabled");
  });

  // end quiz sequence
  classes("end")[0].addEventListener(
    "click",
    async () => {
      notification(`⌛ Ending Quiz...`);

      let noOfQuestions = quizChosen.questions.length;

      if (!questionAnswersGiven) {
        remainingtimeForQuiz = 0;
      }

      const userScore = calcScore(
        quizChosen.totalTime,
        remainingtimeForQuiz,
        noOfQuestions,
        questionAnswersGiven
      );
      const successful = await endQuiz(quizChosen.id, Math.round(userScore));

      if (successful) {
        window.location = "result.html";
      }
    },
    { once: true }
  );

  // back home sequence
  classes("home")[0].addEventListener("click", async () => {
    window.location = "index.html";
  });
  classes("home")[1].addEventListener("click", async () => {
    window.location = "index.html";
  });

  // add new question sequence
  query("#newQuestionBtn").addEventListener(
    "click",
    async (e) => {
      console.log("fiiii");
      e.preventDefault();
      const params = [
        quizChosen.id,
        id("questionTitle").value,
        [
          id("option1").value,
          id("option2").value,
          id("option3").value,
          id("option4").value,
        ],
        utf8ToBase64String(id("answer").value),
      ];
      notification(`⌛ Adding new Question...`);
      try {
        await contract.methods
          .addQuestion(...params)
          .send({ from: kit.defaultAccount });
        notification(`🎉 Question added successfully".`);
        id("newQuestionForm").reset();
      } catch (error) {
        notification(`⚠️ ${error}.`);
      }
      loadQuestions(quizChosen.id);
      getBalance();
      setTimeout(function () {
        notificationOff();
      }, 5000);
    },
    { once: true }
  );

  query("#fundQuizBtn").addEventListener(
    "click",
    async (e) => {
      e.preventDefault();
      notification(`⌛ Sending funds to Quiz...`);
      try {
        let amount = new BigNumber(id("amountToFund").value)
          .shiftedBy(ERC20_DECIMALS)
          .toString();
        await contract.methods
          .fundQuiz(quizChosen.id)
          .send({ from: kit.defaultAccount, value: amount });
        notification(`🎉 Quiz funded successfully".`);
        id("fundQuizForm").reset();
      } catch (error) {
        notification(`⚠️ ${error}.`);
      }
      loadQuestions(quizChosen.id);
      getBalance();
      setTimeout(function () {
        notificationOff();
      }, 5000);
    },
    { once: true }
  );

  query("#withdrawFundsBtn").addEventListener(
    "click",
    async (e) => {
      e.preventDefault();
      notification(`⌛ Withdrawing funds from Quiz...`);
      try {
        let amount = new BigNumber(id("amountToWithdraw").value)
          .shiftedBy(ERC20_DECIMALS)
          .toString();

        await contract.methods
          .withdrawFunds(quizChosen.id, amount)
          .send({ from: kit.defaultAccount });
        notification(`🎉 Quiz funded successfully".`);
        id("withdrawModalForm").reset();
      } catch (error) {
        notification(`⚠️ ${error}.`);
      }
      loadQuestions(quizChosen.id);
      getBalance();
      setTimeout(function () {
        notificationOff();
      }, 5000);
    },
    { once: true }
  );
};

window.addEventListener("load", async () => {
  await reconnect();
  // reading parameters
  const params = new URL(document.location).searchParams;
  const quizChosen = params.get("quiz");
  await getPlayerQuizState(quizChosen);
  // eval --> converting string to variable
  loadQuestions(quizChosen);
});
