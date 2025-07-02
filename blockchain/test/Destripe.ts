import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("Destripe", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployDestripeFixture() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const DestripeCoin = await hre.ethers.getContractFactory("DestripeCoin");
    const destripeCoin = await DestripeCoin.deploy(owner.address);

    await destripeCoin.waitForDeployment();

    const DestripeCollection = await hre.ethers.getContractFactory("DestripeCollection");
    const destripeCollection = await DestripeCollection.deploy(owner.address);

    await destripeCollection.waitForDeployment();

    const Destripe = await hre.ethers.getContractFactory("Destripe");
    const destripe = await Destripe.deploy(destripeCoin.target, destripeCollection.target, owner.address);

    await destripe.waitForDeployment();

    await destripeCollection.setAuthorizedContract(destripe.target);

    await destripeCoin.mint(otherAccount.address, hre.ethers.parseEther("1"));

    return { destripe, destripeCoin, destripeCollection, owner, otherAccount };
  }

  it("Should do first payment", async function () {
    const { destripe, destripeCoin, destripeCollection, owner, otherAccount } = await loadFixture(deployDestripeFixture);

    await destripeCoin.connect(otherAccount).approve(destripe.target, hre.ethers.parseEther("0.01"));

    await expect(destripe.pay(otherAccount.address)).to.emit(destripe, "Granted");
  });

  it("Should not do first payment", async function () {
    const { destripe, destripeCoin, destripeCollection, owner, otherAccount } = await loadFixture(deployDestripeFixture);

    await expect(destripe.pay(otherAccount.address)).to.be.revertedWith("Insufficient balance and/or allowance");
  });

  it("Should do second payment", async function () {
    const { destripe, destripeCoin, destripeCollection, owner, otherAccount } = await loadFixture(deployDestripeFixture);

    await destripeCoin.connect(otherAccount).approve(destripe.target, hre.ethers.parseEther("0.01"));

    await destripe.pay(otherAccount.address)

    await time.increaseTo(Date.now() + 31 * 24 * 60 * 60 * 1000);

    await expect(destripe.pay(otherAccount.address)).to.emit(destripe, "Paid");
  });

  it("Should not do second payment", async function () {
    const { destripe, destripeCoin, destripeCollection, owner, otherAccount } = await loadFixture(deployDestripeFixture);

    await destripeCoin.connect(otherAccount).approve(destripe.target, hre.ethers.parseEther("0.01"));

    await destripe.pay(otherAccount.address)

    await time.increaseTo(Date.now() + 31 * 24 * 60 * 60 * 1000);

    await destripeCoin.connect(otherAccount).approve(destripe.target, hre.ethers.parseEther("0.000001"));

    await expect(destripe.pay(otherAccount.address)).to.emit(destripe, "Revoked");
  });

  it("Should do second payment after revoke", async function () {
    const { destripe, destripeCoin, destripeCollection, owner, otherAccount } = await loadFixture(deployDestripeFixture);

    await destripeCoin.connect(otherAccount).approve(destripe.target, hre.ethers.parseEther("0.01"));

    await destripe.pay(otherAccount.address)

    await time.increase(31 * 24 * 60 * 60);

    await destripeCoin.connect(otherAccount).approve(destripe.target, hre.ethers.parseEther("0.000001"));

    await expect(destripe.pay(otherAccount.address)).to.emit(destripe, "Revoked");

    await destripeCoin.connect(otherAccount).approve(destripe.target, hre.ethers.parseEther("1"));

    await expect(destripe.pay(otherAccount.address)).to.emit(destripe, "Granted");
  });
});
