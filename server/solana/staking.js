const { transferTokens, connection } = require('./token');

const stakeTokens = async (wallet, amount) => {
  const stakingAccount = new PublicKey('STAKING_ACCOUNT_ADDRESS');
  const transaction = await transferTokens(wallet, stakingAccount.toString(), amount);
  return transaction;
};

module.exports = { stakeTokens };
