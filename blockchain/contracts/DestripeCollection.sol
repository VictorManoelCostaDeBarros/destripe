// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {INFTCollection} from "./INFTCollection.sol";

contract DestripeCollection is INFTCollection, ERC721, Ownable {
    uint256 private tokenIds;

    address public authorizedContract;
    string public baseURI = "http://localhost:3000/nfts/";

    constructor(address initialOwner)
        ERC721("DestripeCollection", "DSP")
        Ownable(initialOwner)
    {}

    function setAuthorizedContract(address _authorizedContract) external onlyOwner {
      authorizedContract = _authorizedContract;
    }

    function setBaseURI(string memory _baseURI) external onlyOwner {
      baseURI = _baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
      return baseURI;
    }

    function getLastTokenId() external view returns (uint) {
      return tokenIds;
    }

    function burn(uint tokenId) external {
      require(msg.sender == authorizedContract || msg.sender == owner(), "Only the owner or authorized contract can burn");
      _burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
      return string.concat(baseURI, Strings.toString(tokenId), ".json");
    }

    function setApprovalForAll(address operator, bool approved) public virtual override(IERC721, ERC721) onlyOwner {
      _setApprovalForAll(operator, authorizedContract, approved);
    }

    function mint(address customer) external returns (uint) {
      require(msg.sender == authorizedContract || msg.sender == owner(), "Only the owner or authorized contract can mint");

      uint256 tokenId = tokenIds++;
      _safeMint(customer, tokenId);
      _setApprovalForAll(customer, authorizedContract, true);

      return tokenId;
    }
}