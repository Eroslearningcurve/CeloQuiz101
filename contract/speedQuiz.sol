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
        bytes32 rewardPhrase;
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
    mapping(uint256 => QuizCategory) private quizzes;
    mapping(uint256 => bool) private quizExists;

    // player information
    mapping(address => mapping(uint256 => QuizState)) playerGameState;
    mapping(address => Scores[]) private playerHistory;
    mapping(address => uint256[]) private playerQuizzes;
    mapping(address => bool) private isPlayer;

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

    /**
     * @dev allow users to add their own quiz to the platform
     * @notice A fee needs to be paid in order to add the quiz
     */
    function createNewQuiz(
        string calldata _title,
        uint256 _timePerQuestion,
        bytes32 _rewardPhrase
    ) public payable {
        require(bytes(_title).length > 0, "Empty title");
        require(
            _timePerQuestion > 0 && _timePerQuestion <= 120,
            "Invalid time set for each question"
        );
        require(msg.value == addFee, "amount not up to add fee");

        if (!isPlayer[msg.sender]) {
            addPlayer();
        }
        uint256 index = quizIndex;
        quizIndex++;
        QuizCategory storage _newQuiz = quizzes[index];
        _newQuiz.creator = msg.sender;
        _newQuiz.rewardPhrase = _rewardPhrase;
        _newQuiz.title = _title;
        _newQuiz.createdAt = block.timestamp;
        _newQuiz.timePerQuestion = _timePerQuestion;
        playerQuizzes[msg.sender].push(index);
        quizExists[index] = true;
    }

    /**
     * @dev allow users to add questions to their quizzes
     */
    function addQuestion(
        uint256 _quizId,
        string calldata _question,
        string[] calldata _options,
        string calldata _answer
    ) public checkIfQuizExists(_quizId) {
        require(quizzes[_quizId].creator == msg.sender, "Only Creator");
        QuizCategory storage quiz = quizzes[_quizId];
        quiz.totalTime += quiz.timePerQuestion;
        quiz.questions.push(Question(_question, _options, _answer));
    }

    function getQuiz(uint256 _quizId)
        public
        view
        checkIfQuizExists(_quizId)
        returns (QuizCategory memory)
    {
        return quizzes[_quizId];
    }

    // adds sender as a player
    function addPlayer() internal {
        isPlayer[msg.sender] = true;
    }

    /**
     * @dev allow users to participate into quizzes and potentially win a reward
     * @notice a fee needs to be paid to participate in the quiz
     */
    function startQuiz(uint256 _quizId)
        public
        payable
        ensureState(_quizId, QuizState.NOT_STARTED)
    {
        QuizCategory storage currentQuiz = quizzes[_quizId];
        require(
            currentQuiz.creator != msg.sender,
            "You can't participate in your quizzes"
        );
        require(msg.value == gameFee, "amount not up to game fee");
        require(currentQuiz.totalTime > 0, "Quiz is not valid yet");

        if (!isPlayer[msg.sender]) {
            addPlayer();
        }

        playerGameState[msg.sender][_quizId] = QuizState.IN_PLAY;

        currentQuiz.noOfQuizAttempts++;
    }

    /**
     * @dev allow users participating in a quiz to end their participation
     * @param _score the total score of user for the quiz
     * @param rewardphrase the reward phrase required to receive the reward if the participation was a success
     */
    function endQuiz(
        uint256 _quizId,
        uint256 _score,
        bytes32 rewardphrase
    ) public payable ensureState(_quizId, QuizState.IN_PLAY) {
        QuizCategory memory quiz = quizzes[_quizId];
        playerHistory[msg.sender].push(
            Scores(_quizId, block.timestamp, _score)
        );

        playerGameState[msg.sender][_quizId] = QuizState.NOT_STARTED;
        if (_score >= benchMarkPercent) {
            require(rewardphrase == quiz.rewardPhrase);
            uint256 reward = gameFee * 2;
            // transfer amount
            (bool success, ) = payable(msg.sender).call{value: reward}("");
            require(success, "Transfer failed");
            quiz.successfulAttempts++;
        }
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

    function checkQuiz(uint256 _quizId) public view returns (bool) {
        return quizExists[_quizId];
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
