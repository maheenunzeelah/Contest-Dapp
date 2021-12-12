var Contests = artifacts.require("./Contests");

module.exports = function (deployer) {
    deployer.deploy(Contests);
};
