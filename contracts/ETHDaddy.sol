// SPDX-License-Identifier: UNLICENSED

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

pragma solidity ^0.8.9;

contract ETHDaddy is ERC721 {

    address public owner;
    uint256 public maxSupply;
    uint256 public totalSupply;
    mapping (uint256 => Domain) public domains;

    struct Domain{
        string name;
        uint256 cost;
        bool isOwned;
    }

    constructor(string memory _name,string memory _symbol) ERC721(_name,_symbol){
        owner = msg.sender;
    }

    modifier onlyOwner(){
        require(msg.sender == owner, "only owner can call this function");
        _;
    }

    function list(string memory _name,uint256 _cost) public  onlyOwner{
        maxSupply++;
        domains[1] = Domain(_name,_cost,false);
    }

    function mint(uint _id) public payable{
        require(_id !=0);
        require(_id <=maxSupply);
        require(domains[_id].isOwned == false);
        require(msg.value >= domains[_id].cost);

        domains[_id].isOwned = true;
        totalSupply++;
        _safeMint(msg.sender,_id);
    }

    function getDomain(uint _id) public view returns(Domain memory){
        return domains[_id];
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }

    function withdraw() public onlyOwner(){
        (bool success,) = owner.call{value:address(this).balance}("");
        require(success);
    }


}
