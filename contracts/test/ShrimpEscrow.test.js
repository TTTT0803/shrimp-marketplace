const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShrimpEscrow", function () {
  let escrow, farmer, buyer, other;
  const lotId = 1;
  const cid = "QmTestCID123";
  const quantity = 10000;
  const price = ethers.parseEther("1");

  beforeEach(async function () {
    [farmer, buyer, other] = await ethers.getSigners();
    const ShrimpEscrow = await ethers.getContractFactory("ShrimpEscrow");
    escrow = await ShrimpEscrow.deploy();
  });

  it("Farmer tao listing thanh cong", async function () {
    await escrow.connect(farmer).createListing(lotId, cid, quantity, price);
    const lot = await escrow.getLot(lotId);
    expect(lot.farmer).to.equal(farmer.address);
    expect(lot.status).to.equal(0);
  });

  it("Buyer dat coc thanh cong", async function () {
    await escrow.connect(farmer).createListing(lotId, cid, quantity, price);
    await escrow.connect(buyer).deposit(lotId, { value: price });

    const lot = await escrow.getLot(lotId);
    expect(lot.buyer).to.equal(buyer.address);
    expect(lot.status).to.equal(1);
  });

  it("Tu choi dat coc neu sai so tien", async function () {
    await escrow.connect(farmer).createListing(lotId, cid, quantity, price);
    await expect(
      escrow.connect(buyer).deposit(lotId, { value: ethers.parseEther("0.5") })
    ).to.be.revertedWith("So tien gui khong dung gia niem yet");
  });

  it("Buyer xac nhan -> Farmer nhan duoc tien", async function () {
    await escrow.connect(farmer).createListing(lotId, cid, quantity, price);
    await escrow.connect(buyer).deposit(lotId, { value: price });

    const farmerBalanceBefore = await ethers.provider.getBalance(farmer.address);
    await escrow.connect(buyer).confirmReceived(lotId);
    const farmerBalanceAfter = await ethers.provider.getBalance(farmer.address);

    expect(farmerBalanceAfter).to.be.gt(farmerBalanceBefore);

    const lot = await escrow.getLot(lotId);
    expect(lot.status).to.equal(2);
  });

  it("Tu choi confirmReceived neu khong phai Buyer", async function () {
    await escrow.connect(farmer).createListing(lotId, cid, quantity, price);
    await escrow.connect(buyer).deposit(lotId, { value: price });

    await expect(
      escrow.connect(other).confirmReceived(lotId)
    ).to.be.revertedWith("Chi Buyer cua lo nay moi duoc goi");
  });

  it("Farmer khong the withdraw truoc khi het time-lock", async function () {
    await escrow.connect(farmer).createListing(lotId, cid, quantity, price);
    await escrow.connect(buyer).deposit(lotId, { value: price });

    await expect(
      escrow.connect(farmer).withdraw(lotId)
    ).to.be.revertedWith("Chua het thoi han time-lock");
  });

  it("Farmer withdraw thanh cong sau 14 ngay", async function () {
    await escrow.connect(farmer).createListing(lotId, cid, quantity, price);
    await escrow.connect(buyer).deposit(lotId, { value: price });

    await ethers.provider.send("evm_increaseTime", [14 * 24 * 60 * 60 + 3600]);
    await ethers.provider.send("evm_mine");

    await escrow.connect(farmer).withdraw(lotId);
    const lot = await escrow.getLot(lotId);
    expect(lot.status).to.equal(2);
  });
});