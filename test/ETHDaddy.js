const { ethers } = require('hardhat');
const { expect } = require("chai")
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("ETHDaddy", () => {
  let ethDaddy;
  let deployer, owner1;
  const NAME = 'ETH Daddy';
  const SYMBOL = "ETHD";
  let totalSupply = 0;
  beforeEach(async () => {
    [deployer, owner1] = await ethers.getSigners();


    const EthDaddy = await ethers.getContractFactory("ETHDaddy");
    ethDaddy = await EthDaddy.deploy("ETH Daddy", "ETHD");

    // list a domain
    const transaction = await ethDaddy.connect(deployer).list("prat.eth", tokens(10));
    await transaction.wait();
  })

  describe("deployment", () => {
    it("has a name", async () => {
      const res = await ethDaddy.name();
      expect(res).to.be.equal(NAME);
    })

    it("has a symbol", async () => {
      const res = await ethDaddy.symbol();
      expect(res).to.be.equal(SYMBOL);
    })

    it("sets the owner", async () => {
      const res = await ethDaddy.owner();
      expect(res).to.be.equal(deployer.address);
    })

    it("returns max supply", async () => {
      const res = await ethDaddy.maxSupply();
      expect(res).to.be.equal(1);
    })
    it("returns total supply", async () => {
      const res = await ethDaddy.totalSupply();
      expect(res).to.be.equal(0);
    })
  })

  describe('Domain', () => {
    it("Returns domain attribute", async () => {
      let domain = await ethDaddy.getDomain(1);
      expect(domain.name).to.be.equal("prat.eth");
      expect(domain.cost).to.be.equal(tokens(10));
      expect(domain.isOwned).to.be.equal(false);
    })
  })

  describe('Minting', () => {
    const ID = 1;
    const amt = ethers.utils.parseUnits("10","ether");
    totalSupply++;

    beforeEach(async() => {
      const transcation = await ethDaddy.connect(owner1).mint(ID,{value:amt});
      await transcation.wait();

    })
    it("Updates the owner", async () => {
      let owner = await ethDaddy.ownerOf(ID);
      expect(owner).to.be.equal(owner1.address);
    })
    it("Updates the domain status", async () => {
      let domain = await ethDaddy.getDomain(ID);
      expect(domain.isOwned).to.be.equal(true);
    })

    it("Updates the contract balance ", async () => {
      let res = await ethDaddy.getBalance();
      expect(res).to.be.equal(amt);
    })
    it("Updates the totalSupply", async () => {
      let res = await ethDaddy.totalSupply();
      expect(res).to.be.equal(totalSupply);
    })
  })

  describe("Withdrawn", () => {
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("10", 'ether')
    let balanceBefore

    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      let transaction = await ethDaddy.connect(owner1).mint(ID, { value: AMOUNT })
      await transaction.wait()

      transaction = await ethDaddy.connect(deployer).withdraw()
      await transaction.wait()
    })

    it('Updates the owner balance', async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it('Updates the contract balance', async () => {
      const result = await ethDaddy.getBalance()
      expect(result).to.equal(0)
    })
  })

})
