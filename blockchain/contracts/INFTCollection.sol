// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.27;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
interface INFTCollection is IERC721 {
    function mint(address customer) external returns (uint);
    function burn(uint tokenId) external;
    function setBaseURI(string memory _baseURI) external;
    function getLastTokenId() external view returns (uint);
    function setAuthorizedContract(address _authorizedContract) external;
}