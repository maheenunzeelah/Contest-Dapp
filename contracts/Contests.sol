pragma solidity >=0.4.20;

contract Contests {
    struct Contestant {
        uint256 _id;
        string _name;
        uint256 voteCount;
    }
    mapping(uint256 => Contestant) public contestant;
    mapping(address => bool) public voters;
    uint256 public contestantCount;
    event votedEvent(uint256 indexed _contestantId);

    constructor() public {
        addContestants("Maheen");
        addContestants("Rabiya");
    }

    function addContestants(string memory _name) internal {
        contestantCount++;
        contestant[contestantCount] = Contestant(contestantCount, _name, 0);
    }

    modifier onlyNewVoter() {
        require(!voters[msg.sender]);
        _;
    }

    function vote(uint256 _contestantId) public onlyNewVoter {
        require(_contestantId > 0 && _contestantId <= contestantCount);
        contestant[_contestantId].voteCount++;
        voters[msg.sender] = true;
        emit votedEvent(_contestantId);
    }
}
