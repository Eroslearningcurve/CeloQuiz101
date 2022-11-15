// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

/** @title SpeedQuiz
 *  @notice Contract that controls the speed quiz application.
 */
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
        uint256 quizPool;
        bytes32 rewardPhrase;
    }

    struct Scores {
        uint256 quizId;
        uint256 dateTaken;
        uint256 score;
    }

    struct PlayerQuizInfo {
        uint256 highScore;
        uint256 attempts;
        uint256 lastDateTaken;
        QuizState state;
    }

    // quiz information
    // mapping of quiz ids to their respective quiz information
    mapping(uint256 => QuizCategory) private quizzes;
    // mapping of quiz
    mapping(uint256 => bool) private quizExists;

    // player information
    mapping(address => mapping(uint256 => PlayerQuizInfo)) private playerInfo;
    mapping(address => uint256[]) private attemptedQuizzes;
    mapping(address => mapping(uint256 => bool)) private attemptedQuizzesStatus;
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
        string memory _title,
        uint256 _timePerQuestion,
        bytes32 _rewardPhrase
    ) public payable {
        require(bytes(_title).length > 0, "Empty title");
        require(
            _timePerQuestion > 0 && _timePerQuestion <= 120,
            "Invalid time set for each question"
        );
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
        _newQuiz.quizPool = 0;
        _newQuiz.rewardPhrase = _rewardPhrase;

        playerQuizzes[msg.sender].push(quizIndex);
        quizExists[quizIndex] = true;

        quizIndex++;
    }

    /**
     * @dev allow quiz owners to fund their quizzes
     */
    function fundQuiz(uint256 _quizId) public payable checkIfCreator(_quizId) {
        require(msg.value >= 1 ether, "Amount too small");
        QuizCategory storage _quiz = quizzes[_quizId];
        _quiz.quizPool += msg.value;
    }

    /**
     * @dev allow quiz owners to withdraw from their quizzes
     */
    function withdrawFunds(uint256 _quizId, uint256 _amount)
        public
        checkIfCreator(_quizId)
    {
        QuizCategory storage _quiz = quizzes[_quizId];
        require(_amount >= 1 ether, "Amount too small");
        require(_amount <= _quiz.quizPool, "Insufficient amount in quiz");

        // transfer amount
        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "Transfer failed");

        _quiz.quizPool -= _amount;
    }

    /**
     * @dev allow users to add questions to their quizzes
     */
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
        QuizCategory memory _quiz = quizzes[_quizId];

        return (
            QuizCategory(
                _quiz.creator,
                _quiz.title,
                _quiz.questions,
                _quiz.createdAt,
                _quiz.timePerQuestion,
                _quiz.totalTime,
                _quiz.successfulAttempts,
                _quiz.noOfQuizAttempts,
                _quiz.quizPool,
                keccak256(abi.encodePacked(block.number, _quiz.rewardPhrase))
            )
        );
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
        notCreator(_quizId)
        ensureState(_quizId, QuizState.NOT_STARTED)
    {
        require(msg.value >= gameFee, "amount not up to game fee");
        require(quizzes[_quizId].totalTime > 0, "Quiz is not valid yet");
        require(quizzes[_quizId].quizPool >= 5 ether, "Quiz balance is empty");

        if (!isPlayer[msg.sender]) {
            addPlayer();
        }

        PlayerQuizInfo storage _player = playerInfo[msg.sender][_quizId];
        _player.attempts++;
        _player.lastDateTaken = block.timestamp;
        _player.state = QuizState.IN_PLAY;

        quizzes[_quizId].noOfQuizAttempts++;
        quizzes[_quizId].quizPool += gameFee;

        if (!attemptedQuizzesStatus[msg.sender][_quizId]) {
            attemptedQuizzes[msg.sender].push(_quizId);
            attemptedQuizzesStatus[msg.sender][_quizId] = true;
        }
    }

    /**
     * @dev allow users participating in a quiz to end their participation
     * @param _quizId the quiz id
     * @param _score the total score of user for the quiz
     * @param _rewardPhrase the reward phrase required to receive the reward if the participation was a success
     */
    function endQuiz(
        uint256 _quizId,
        uint256 _score,
        bytes32 _rewardPhrase
    ) public ensureState(_quizId, QuizState.IN_PLAY) {
        require(_score > 0 && _score <= 100, "Invalid Score");

        QuizCategory storage quiz = quizzes[_quizId];

        uint256 reward = gameFee * 2;

        require(
            quiz.quizPool >= reward,
            "Cannot end quiz now, please try again later"
        );

        PlayerQuizInfo storage _player = playerInfo[msg.sender][_quizId];

        if (_score >= benchMarkPercent) {
            require(_rewardPhrase == quiz.rewardPhrase, "Invalid phrase");

            // transfer amount
            (bool success, ) = payable(msg.sender).call{value: reward}("");
            require(success, "Transfer failed");

            quiz.successfulAttempts++;
            quiz.quizPool -= reward;
        }

        if (_score > _player.highScore) {
            _player.highScore = _score;
        }

        _player.state = QuizState.NOT_STARTED;
    }

    function getPlayerAttemptedQuizzes(address _player)
        public
        view
        returns (uint256[] memory)
    {
        return attemptedQuizzes[_player];
    }

    function getPlayerQuizInfo(address _player, uint256 _quizId)
        public
        view
        returns (PlayerQuizInfo memory)
    {
        return playerInfo[_player][_quizId];
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

    modifier notCreator(uint256 _quizId) {
        require(
            quizzes[_quizId].creator != msg.sender,
            "Creator can't take quiz"
        );
        _;
    }

    modifier checkIfQuizExists(uint256 _quizId) {
        require(quizExists[_quizId], "Invalid quiz ID");
        _;
    }

    modifier ensureState(uint256 _quizId, QuizState _state) {
        require(playerInfo[msg.sender][_quizId].state == _state);
        _;
    }
}
