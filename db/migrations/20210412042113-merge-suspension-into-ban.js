'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      await queryInterface.createTable('ban_extensions', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        author_id: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        ban_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'bans',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        duration: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        reason: {
          type: Sequelize.STRING,
          allowNull: false
        }
      }, { transaction: t })
      await queryInterface.addColumn('bans', 'duration', {
        type: Sequelize.INTEGER
      }, { transaction: t })

      const suspensions = (await queryInterface.sequelize.query(
        'SELECT id, author_id, reason, date, user_id, duration, role_id, group_id FROM suspensions'
      )).shift()

      if (suspensions.length > 0) {
        const suspensionCancellations = (await queryInterface.sequelize.query(
          'SELECT author_id, reason, suspension_id FROM suspension_cancellations'
        )).shift()
        const suspensionExtensions = (await queryInterface.sequelize.query(
          'SELECT author_id, reason, duration, suspension_id FROM suspension_extensions'
        )).shift()

        const insertedBans = await queryInterface.bulkInsert(
          'bans',
          suspensions.map(suspension => (
            {
              author_id: suspension.author_id,
              date: suspension.date,
              duration: suspension.duration,
              group_id: suspension.group_id,
              reason: suspension.reason,
              role_id: suspension.role_id,
              user_id: suspension.user_id
            }
          )),
          { returning: true, transaction: t }
        )

        const banCancellations = getCancellations(insertedBans, suspensions, suspensionCancellations, 'ban')
        const banExtensions = getExtensions(insertedBans, suspensions, suspensionExtensions, 'ban')
        if (banCancellations.length > 0) {
          await queryInterface.bulkInsert('ban_cancellations', banCancellations, { transaction: t })
        }
        if (banExtensions.length > 0) {
          await queryInterface.bulkInsert('ban_extensions', banExtensions, { transaction: t })
        }
      }

      return Promise.all([
        queryInterface.dropTable('suspension_cancellations', { transaction: t }),
        queryInterface.dropTable('suspension_extensions', { transaction: t }),
        queryInterface.dropTable('suspensions', { transaction: t })
      ])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      await Promise.all([
        queryInterface.createTable('suspensions', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          author_id: Sequelize.BIGINT,
          date: {
            type: Sequelize.DATE,
            allowNull: false
          },
          duration: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          group_id: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          reason: {
            type: Sequelize.STRING,
            allowNull: false
          },
          role_back: {
            type: Sequelize.BOOLEAN,
            allowNull: false
          },
          role_id: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          user_id: Sequelize.BIGINT
        }, { transaction: t }),
        queryInterface.createTable('suspension_cancellations', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          author_id: Sequelize.BIGINT,
          reason: {
            type: Sequelize.STRING,
            allowNull: false
          },
          suspension_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'suspensions',
              key: 'id'
            },
            onDelete: 'CASCADE'
          }
        }, { transaction: t }),
        queryInterface.createTable('suspension_extensions', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          author_id: Sequelize.BIGINT,
          duration: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          reason: {
            type: Sequelize.STRING,
            allowNull: false
          },
          suspension_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'suspensions',
              key: 'id'
            },
            onDelete: 'CASCADE'
          }
        }, { transaction: t })
      ])

      const bans = (await queryInterface.sequelize.query(
        'SELECT id, author_id, reason, date, user_id, duration, role_id, group_id FROM bans WHERE duration IS NOT NULL'
      )).shift()
      if (bans.length > 0) {
        const banCancellations = (await queryInterface.sequelize.query(
          'SELECT author_id, reason, ban_id FROM ban_cancellations'
        )).shift()
        const banExtensions = (await queryInterface.sequelize.query(
          'SELECT author_id, reason, duration, ban_id FROM ban_extensions'
        )).shift()

        const insertedSuspensions = await queryInterface.bulkInsert(
          'suspensions',
          bans.map(ban => (
            {
              author_id: ban.author_id,
              date: ban.date,
              duration: ban.duration,
              group_id: ban.group_id,
              reason: ban.reason,
              role_id: ban.role_id,
              role_back: false,
              user_id: ban.user_id
            }
          )),
          { returning: true, transaction: t }
        )

        const suspensionCancellations = getCancellations(insertedSuspensions, bans, banCancellations, 'suspension')
        const suspensionExtensions = getExtensions(insertedSuspensions, bans, banExtensions, 'suspension')
        if (suspensionCancellations.length > 0) {
          await queryInterface.bulkInsert('suspension_cancellations', suspensionCancellations, { transaction: t })
        }
        if (suspensionExtensions.length > 0) {
          await queryInterface.bulkInsert('suspension_extensions', suspensionExtensions, { transaction: t })
        }

        await queryInterface.bulkDelete(
          'bans',
          { id: { [Sequelize.Op.in]: bans.map(ban => ban.id) } },
          { transaction: t }
        )
      }

      await queryInterface.removeColumn('bans', 'duration', { transaction: t })
      return queryInterface.dropTable('ban_extensions', { transaction: t })
    })
  }
}

function getCancellations (targetRows, sourceRows, cancellations, type) {
  const result = []
  for (let i = 0; i < targetRows.length; i++) {
    const targetRow = targetRows[i]
    const sourceRow = sourceRows[i]
    const cancellation = cancellations.find(cancellation => (
      (type === 'ban' ? cancellation.suspension_id : cancellation.ban_id) === sourceRow.id
    ))
    if (cancellation) {
      result.push({
        [type === 'ban' ? 'ban_id' : 'suspension_id']: targetRow.id,
        author_id: cancellation.author_id,
        reason: cancellation.reason
      })
    }
  }
  return result
}

function getExtensions (targetRows, sourceRows, extensions, type) {
  const result = []
  for (let i = 0; i < targetRows.length; i++) {
    const targetRow = targetRows[i]
    const sourceRow = sourceRows[i]
    result.push(...extensions
      .filter(extension => (type === 'ban' ? extension.suspension_id : extension.ban_id) === sourceRow.id)
      .map(extension => (
        {
          [type === 'ban' ? 'ban_id' : 'suspension_id']: targetRow.id,
          author_id: extension.author_id,
          duration: extension.duration,
          reason: extension.reason
        }
      ))
    )
  }
  return result
}
