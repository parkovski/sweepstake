var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var Game = artifacts.require("./Game.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(Game);
};
