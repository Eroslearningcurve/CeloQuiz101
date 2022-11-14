import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import speedQuizAbi from "../contract/speedQuiz.abi.json";
const ERC20_DECIMALS = 18;
const quizHubCA = "0xBb16Ce837af6601612A2eE9F647829F514691be9";

let contract;
let kit;
let playerQuizzes;
let playerHistory;

let id = (id) => document.getElementById(id);
let classes = (classes) => document.getElementsByClassName(classes);
let query = (query) => document.querySelector(query);

function notification(_text) {
  document.querySelector(".alert").style.display = "block";
  document.querySelector("#notification").textContent = _text;
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none";
}

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.");
    try {
      await window.celo.enable();
      notificationOff();

      const web3 = new Web3(window.celo);
      kit = newKitFromWeb3(web3);

      const accounts = await kit.web3.eth.getAccounts();
      kit.defaultAccount = accounts[0];

      contract = new kit.web3.eth.Contract(speedQuizAbi, quizHubCA);
      await getBalance();
      await getplayerQuizzes();
      getPlayerHistory();

      id("find-quiz").removeAttribute("disabled");
    } catch (error) {
      notification(`⚠️ ${error}.`);
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.");
  }
};

const getBalance = async function () {
  notification("⌛ Getting Balance...");
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount);
  const cUSDBalance = totalBalance.CELO.shiftedBy(-ERC20_DECIMALS).toFixed(2);
  document.querySelector("#balance").textContent = cUSDBalance;
  notificationOff();
};

const getplayerQuizzes = async function () {
  notification("⌛ Getting Your Quizzes...");
  const _playerQuizzes = await contract.methods
    .getPlayerQuizzes(kit.defaultAccount)
    .call();
  const _quizzes = [];
  for (let i = 0; i < _playerQuizzes.length; i++) {
    let _quiz = new Promise(async (resolve, reject) => {
      let p = await contract.methods.getQuiz(_playerQuizzes[i]).call();
      resolve({
        id: _playerQuizzes[i],
        title: p.title,
        noOfQuestions: p.questions.length,
        createdAt: p.createdAt,
        noOfQuizAttempts: p.noOfQuizAttempts,
        successfulAttempts: p.successfulAttempts,
      });
    });
    _quizzes.push(_quiz);
  }
  playerQuizzes = await Promise.all(_quizzes);
  renderQuizzes();
  notificationOff();
};

const renderQuizzes = function () {
  $("#playerQuizzesRow").html("");
  for (let i = 0; i < playerQuizzes.length; i++) {
    let quiz = playerQuizzes[i];
    let date = new Date(quiz.createdAt * 1000);
    $("#playerQuizzesRow").append(
      `<tr>
          <td id="sn"> ${i + 1}</td>
          <td id="quizid">Quiz-${quiz.id}</td>
          <td id="title">${quiz.title}</td>
          <td id="createdOn">${date}</td>
          <td id="questions">${quiz.noOfQuestions}</td>
          <td id="successAttempts">${quiz.successfulAttempts}</td>
          <td id="totalAttempts">${quiz.noOfQuizAttempts}</td>
        </tr>`
    );
  }
};

const getPlayerHistory = async function () {
  playerHistory = await contract.methods
    .getPlayerHistory(kit.defaultAccount)
    .call();

  renderHistory();
};

const renderHistory = function () {
  $("#playerHistoryRow").html("");
  for (let i = 0; i < playerHistory.length; i++) {
    let history = playerHistory[i];
    let date = new Date(history.dateTaken * 1000);
    $("#playerHistoryRow").append(
      `<tr>
          <td id="sn"> ${i + 1}</td>
          <td id="quizid">Quiz-${history.quizId}</td>
          <td id="createdOn">${date}</td>
          <td id="questions">${history.score}</td>
        </tr>`
    );
  }
};
let quizSelected = classes("find-quiz");
let quizValue = classes("input-quiz-value");

quizSelected[0].addEventListener("click", async (e) => {
  e.preventDefault();

  notification(`⌛ Looking For "${quizValue[0].value}"...`);
  const quizId = quizValue[0].value.match(/(\d+)/);

  let exists = await contract.methods.checkQuiz(quizId[0]).call();

  if (exists) {
    window.location = `quiz.html?quiz=${quizId[0]}`;
  } else {
    notification("⚠️ Invalid Quiz ID");
  }

  id("quizID").value = "";
});

query("#newQuizBtn").addEventListener("click", async (e) => {
  let fee = await contract.methods.getAddFee().call();
  const params = [id("quizTitle").value, id("timePerQuestion").value];
  notification(`⌛ Adding "${params[0]}"...`);
  try {
    await contract.methods
      .createNewQuiz(...params)
      .send({ from: kit.defaultAccount, value: fee });
    notification(`🎉 You successfully added "${params[0]}".`);
    setTimeout(getplayerQuizzes(), 2000);
    getBalance();
  } catch (error) {
    notification(`⚠️ ${error}.`);
  }
});

window.addEventListener("load", async () => {
  notification("⌛ Loading...");
  await connectCeloWallet();
});
