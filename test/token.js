const { expectRevert } = require("@openzeppelin/test-helpers");
const CryptionNetworkToken = artifacts.require("CryptionNetworkToken");

contract("CryptionNetworkToken", ([alice, bob, carol]) => {
  beforeEach(async () => {
    this.cnt = await CryptionNetworkToken.new({ from: alice });
  });

  it("should have correct name and symbol and decimal", async () => {
    const name = await this.cnt.name();
    const symbol = await this.cnt.symbol();
    const decimals = await this.cnt.decimals();
    assert.equal(name.valueOf(), "CryptionNetworkToken");
    assert.equal(symbol.valueOf(), "CNT");
    assert.equal(decimals.valueOf(), "18");
  });

  it("should only allow owner to mint token", async () => {
    await this.cnt.mint(alice, "100", { from: alice });
    await this.cnt.mint(bob, "1000", { from: alice });
    await expectRevert(
      this.cnt.mint(carol, "1000", { from: bob }),
      "Ownable: caller is not the owner"
    );
    const totalSupply = await this.cnt.totalSupply();
    const aliceBal = await this.cnt.balanceOf(alice);
    const bobBal = await this.cnt.balanceOf(bob);
    const carolBal = await this.cnt.balanceOf(carol);
    assert.equal(totalSupply.valueOf(), "1100");
    assert.equal(aliceBal.valueOf(), "100");
    assert.equal(bobBal.valueOf(), "1000");
    assert.equal(carolBal.valueOf(), "0");
  });

  it("should allow users to burn the token", async () => {
    await this.cnt.mint(alice, "100", { from: alice });
    await this.cnt.mint(bob, "1000", { from: alice });

    const preBurnTotalSupply = await this.cnt.totalSupply();
    const preBurnAliceBal = await this.cnt.balanceOf(alice);
    const preBurnBobBal = await this.cnt.balanceOf(bob);

    await this.cnt.burn("100", { from: alice });
    await this.cnt.burn("1000", { from: bob });

    const totalSupply = await this.cnt.totalSupply();
    const aliceBal = await this.cnt.balanceOf(alice);
    const bobBal = await this.cnt.balanceOf(bob);
    assert.equal(preBurnTotalSupply.valueOf() - totalSupply.valueOf(), "1100");
    assert.equal(preBurnAliceBal.valueOf() - aliceBal.valueOf(), "100");
    assert.equal(preBurnBobBal.valueOf() - bobBal.valueOf(), "1000");
  });

  it("should supply token transfers properly", async () => {
    await this.cnt.mint(alice, "100", { from: alice });
    await this.cnt.mint(bob, "1000", { from: alice });
    await this.cnt.transfer(carol, "10", { from: alice });
    await this.cnt.transfer(carol, "100", { from: bob });
    const totalSupply = await this.cnt.totalSupply();
    const aliceBal = await this.cnt.balanceOf(alice);
    const bobBal = await this.cnt.balanceOf(bob);
    const carolBal = await this.cnt.balanceOf(carol);
    assert.equal(totalSupply.valueOf(), "1100");
    assert.equal(aliceBal.valueOf(), "90");
    assert.equal(bobBal.valueOf(), "900");
    assert.equal(carolBal.valueOf(), "110");
  });

  it("should fail if you try to do bad transfers", async () => {
    await this.cnt.mint(alice, "100", { from: alice });
    await expectRevert(
      this.cnt.transfer(carol, "110", { from: alice }),
      "ERC20: transfer amount exceeds balance"
    );
    await expectRevert(
      this.cnt.transfer(carol, "1", { from: bob }),
      "ERC20: transfer amount exceeds balance"
    );
  });
});
