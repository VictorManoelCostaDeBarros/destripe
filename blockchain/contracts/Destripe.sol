// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {INFTCollection} from "./INFTCollection.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract Destripe is ERC721Holder, Ownable {
  INFTCollection public nftCollection;
  IERC20 public acceptedToken;

  uint public monthlyAmount  = 0.001 ether;
  uint private constant THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60; // 30 days;

  struct Customer {
    uint tokenId;
    uint nextPayment;
    uint index;
  }

  mapping(address => Customer) public payments; // customer address -> payment info
  address[] public customers;

  event Paid(address indexed customer, uint date, uint amount);
  event Granted(address indexed customer, uint tokenId, uint date);
  event Revoked(address indexed customer, uint tokenId, uint date);
  event Removed(address indexed customer, uint tokenId, uint date);

  constructor(address _acceptedToken, address _nftCollection, address initialOwner) Ownable(initialOwner) {
    acceptedToken = IERC20(_acceptedToken);
    nftCollection = INFTCollection(_nftCollection);
  }   

  function getCustomers() external view returns (address[] memory) {
    return customers;
  }

  function setMonthlyAmount(uint _monthlyAmount) external onlyOwner {
    monthlyAmount = _monthlyAmount;
  }

  function removeCustomer(address customer) external onlyOwner {
    Customer memory customerInfo = payments[customer];
    nftCollection.burn(customerInfo.tokenId);

    delete customers[customerInfo.index];
    delete payments[customer];

    emit Removed(customer, customerInfo.tokenId, block.timestamp);
  }

  function pay(address customer) external onlyOwner {
    bool thirtyDaysPassed = payments[customer].nextPayment <= block.timestamp;
    bool firstPayment = payments[customer].nextPayment == 0;
    bool hasAmount = acceptedToken.balanceOf(customer) >= monthlyAmount;
    bool hasAllowance = acceptedToken.allowance(customer, address(this)) >= monthlyAmount;

    if ((thirtyDaysPassed || firstPayment) && (!hasAmount || !hasAllowance)) {
      if (!firstPayment) {
        nftCollection.safeTransferFrom(customer, address(this), payments[customer].tokenId);

        emit Revoked(customer, payments[customer].tokenId, block.timestamp);
        return;
      } else {
        revert("Insufficient balance and/or allowance");
      }
    }

    if (firstPayment) {
      uint mintedTokenId = nftCollection.mint(customer);
      payments[customer].tokenId = mintedTokenId;
      payments[customer].index = customers.length;
      customers.push(customer);

      emit Granted(customer, payments[customer].tokenId, block.timestamp);
    }

    if (thirtyDaysPassed || firstPayment) {
      acceptedToken.transferFrom(customer, address(this), monthlyAmount);

      if (firstPayment) {
        payments[customer].nextPayment = block.timestamp + THIRTY_DAYS_IN_SECONDS;
      } else {
        payments[customer].nextPayment += THIRTY_DAYS_IN_SECONDS;
      }

      emit Paid(customer, block.timestamp, monthlyAmount);

      if (payments[customer].nextPayment > block.timestamp && nftCollection.ownerOf(payments[customer].tokenId) != customer) {
        nftCollection.safeTransferFrom(address(this), customer, payments[customer].tokenId);

        emit Granted(customer, payments[customer].tokenId, block.timestamp);
      }
    }
  }
}
