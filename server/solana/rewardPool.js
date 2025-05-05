const { transferTokens, connection, rewardPool } = require('./token');

const contributeToPool = async (wallet, amount) => {
  const transaction = await transferTokens(wallet, rewardPool.toString(), amount);
  return transaction;
};

const withdrawFromPool = async (wallet, amount) => {
  const transaction = await transferTokens(rewardPool.toString(), wallet, amount);
  return transaction;
};

module.exports = { contributeToPool, withdrawFromPool };
