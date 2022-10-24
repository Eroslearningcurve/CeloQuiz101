// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

contract SpeedQuiz {
    uint256 internal quizIndex;
    uint256 internal gameFee;
    uint256 internal addFee;
    uint256 internal benchMarkPercent;

    enum QuizState {
        NOT_STARTED,
        IN_PLAY
    }

    struct Question {
        string question;
        string[] options;
        string answer;
    }

    struct QuizCategory {
        address creator;
        string title;
        Question[] questions;
        uint256 createdAt;
        uint256 timePerQuestion;
        uint256 totalTime;
        uint256 successfulAttempts;
        uint256 noOfQuizAttempts;
    }

    struct Scores {
        uint256 quizId;
        uint256 dateTaken;
        uint256 score;
    }

    // quiz information
    mapping(uint256 => QuizCategory) internal quizzes;
    mapping(uint256 => bool) internal quizExists;

    // player information
    mapping(address => mapping(uint256 => QuizState)) playerGameState;
    mapping(address => Scores[]) internal playerHistory;
    mapping(address => uint256[]) internal playerQuizzes;
    mapping(address => bool) internal isPlayer;

    constructor(
        uint256 _gameFEE,
        uint256 _addFEE,
        uint256 _benchMarkPercent
    ) {
        require(
            _benchMarkPercent > 0 && _benchMarkPercent <= 100,
            "Invalid percent"
        );

        require(_addFEE > 0 && _gameFEE > 0, "Invalid Fees");

        gameFee = _gameFEE * (10**18);
        addFee = _addFEE * (10**18);
        benchMarkPercent = _benchMarkPercent;
    }

    // pay fee to add category
    function createNewQuiz(string memory _title, uint256 _timePerQuestion)
        public
        payable
    {
        require(msg.value >= addFee, "amount not up to add fee");

        if (!isPlayer[msg.sender]) {
            addPlayer();
        }

        QuizCategory storage _newQuiz = quizzes[quizIndex];
        _newQuiz.creator = msg.sender;
        _newQuiz.title = _title;
        _newQuiz.createdAt = block.timestamp;
        _newQuiz.timePerQuestion = _timePerQuestion;
        _newQuiz.totalTime = 0;
        _newQuiz.noOfQuizAttempts = 0;
        _newQuiz.successfulAttempts = 0;

        playerQuizzes[msg.sender].push(quizIndex);
        quizExists[quizIndex] = true;

        quizIndex++;
    }

    function addQuestion(
        uint256 _quizId,
        string memory _question,
        string[] memory _options,
        string memory _answer
    ) public checkIfQuizExists(_quizId) checkIfCreator(_quizId) {
        QuizCategory storage quiz = quizzes[_quizId];
        quiz.totalTime += quiz.timePerQuestion;
        quiz.questions.push(Question(_question, _options, _answer));
    }

    function getQuiz(uint256 _quizId)
        public
        view
        returns (QuizCategory memory)
    {
        return quizzes[_quizId];
    }

    function addPlayer() internal {
        isPlayer[msg.sender] = true;
    }

    function startQuiz(uint256 _quizId)
        public
        payable
        ensureState(_quizId, QuizState.NOT_STARTED)
    {
        require(msg.value >= gameFee, "amount not up to game fee");
        require(quizzes[_quizId].totalTime > 0, "Quiz is not valid yet");

        if (!isPlayer[msg.sender]) {
            addPlayer();
        }

        playerGameState[msg.sender][_quizId] = QuizState.IN_PLAY;

        quizzes[_quizId].noOfQuizAttempts++;
    }

    function endQuiz(uint256 _quizId, uint256 _score)
        public
        ensureState(_quizId, QuizState.IN_PLAY)
    {
        QuizCategory memory quiz = quizzes[_quizId];

        playerHistory[msg.sender].push(
            Scores(_quizId, block.timestamp, _score)
        );

        uint256 benchMark = benchMarkPercent * 100;
        uint256 scoreMark = _score * 100;

        if (scoreMark >= benchMark) {
            uint256 reward = gameFee * 2;
            // transfer amount
            payable(msg.sender).transfer(reward);

            quiz.successfulAttempts++;
        }
        playerGameState[msg.sender][_quizId] = QuizState.NOT_STARTED;
    }

    function getPlayerHistory(address _player)
        public
        view
        returns (Scores[] memory)
    {
        return playerHistory[_player];
    }

    function getPlayerQuizState(address _player, uint256 _quizId)
        public
        view
        returns (QuizState)
    {
        return playerGameState[_player][_quizId];
    }

    function getPlayerQuizzes(address _player)
        public
        view
        returns (uint256[] memory)
    {
        return playerQuizzes[_player];
    }

    function getquizIndex() public view returns (uint256) {
        return quizIndex;
    }

    function getGameFee() public view returns (uint256) {
        return gameFee;
    }

    function getAddFee() public view returns (uint256) {
        return addFee;
    }

    function getQuizBenchMark(uint256 _quizId) public view returns (uint256) {
        return benchMarkPercent * quizzes[_quizId].totalTime;
    }

    function checkQuiz(uint256 _quizId) public view returns (bool) {
        return quizExists[_quizId];
    }

    modifier checkIfCreator(uint256 _quizId) {
        require(quizzes[_quizId].creator == msg.sender, "Only Creator");
        _;
    }

    modifier checkIfQuizExists(uint256 _quizId) {
        require(quizExists[_quizId], "Invalid quiz ID");
        _;
    }

    modifier ensureState(uint256 _quizId, QuizState _state) {
        require(playerGameState[msg.sender][_quizId] == _state);
        _;
    }
}
