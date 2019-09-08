pragma solidity ^0.5.11;

contract Game {
    address[] players;
    enum GameState {
        INITIALIZE,
        COMMIT_MOVE,
        REVEAL_MOVE, // send to taxa
        AWAIT_TAXA_COMPUTATION,
        PAYOUT
    }
    enum Move {
        SHARE,
        STEAL,
        BLOCK
    }
    struct player {
        bool eligible;
        bytes32 move_hash;
        Move move;

    }
    mapping(address => player) player_vars;
    uint public GAME_STATE; // 0 just started, 1 commit move, 2 reveal move, 3 payout, 4 withdrawn
    bool finished;
    mapping(address=>uint256) move;

    constructor() public {
        GAME_STATE = 0;
        finished = false;
    }

    function start() public {
        require(GAME_STATE == 0);
        GAME_STATE = 1; // start committing moves
    }

    function commit_move(bytes32 _move_hash) public {
        require(player_vars[msg.sender].eligible);
        player_vars[msg.sender].move_hash = _move_hash;
    }

    function reveal_move(uint256 _move, uint256 _salt) public{
        require(_move == 0 || _move == 1 || _move == 2);
        uint256 preimage = (_salt << 2) + _move;
        require(keccak256(abi.encodePacked(preimage)) == player_vars[msg.sender].move_hash);
        move[msg.sender] = _move;
    }
}
