'use strict'

const ranksToRoleIds = {
  0: 6508456,
  1: 6508585,
  2: 6694400,
  3: 7024392,
  4: 6508455,
  5: 6766826
}

module.exports = {
  up: (queryInterface /* , Sequelize */) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        changeColumn(queryInterface, 'bans', true, t),
        changeColumn(queryInterface, 'suspensions', true, t),
        queryInterface.renameColumn(
          'suspensions',
          'rank_back',
          'role_back',
          { transaction: t }
        )
      ])
    })
  },

  down: (queryInterface /* , Sequelize */) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        changeColumn(queryInterface, 'bans', false, t),
        changeColumn(queryInterface, 'suspensions', false, t),
        queryInterface.renameColumn(
          'suspensions',
          'role_back',
          'rank_back',
          { transaction: t }
        )
      ])
    })
  }
}

async function changeColumn (queryInterface, tableName, up, transaction) {
  const promises = []
  for (let [rank, roleId] of Object.entries(ranksToRoleIds)) {
    rank = parseInt(rank)
    promises.push(queryInterface.bulkUpdate(
      tableName,
      up ? { rank: roleId } : { role_id: rank },
      up ? { rank } : { role_id: roleId },
      { transaction }
    ))
  }
  await Promise.all(promises)
  return queryInterface.renameColumn(
    tableName,
    up ? 'rank' : 'role_id',
    up ? 'role_id' : 'rank',
    { transaction }
  )
}
