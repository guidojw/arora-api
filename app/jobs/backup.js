'use strict'
const path = require('path')
const fs = require('fs')
const { execFile } = require('child_process')
const fileHelper = require('../helpers/file')

const databaseConfig = require('../../config/database')[process.env.NODE_ENV || 'development']

const home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE

const KEEP = 7 * 60 * 60 * 24 * 1000 // keep backups 7 days

class BackupJob {
    constructor(discordMessageJob) {
        this._discordMessageJob = discordMessageJob
    }

    run() {
        const date = new Date()
        const backupScript = `pg_dump -Ft --username=${databaseConfig.username} -h ${databaseConfig.host} ${databaseConfig.database}`
        const backupName = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`
        const backupFile = `export_${backupName}.tar`

        execFile(
            path.resolve(__dirname, '../../bin/backup.sh'),
            [backupScript, backupFile, databaseConfig.password],
            error => {
                if (error) {
                    throw error
                }

                this._discordMessageJob.run('backupNotification', {
                    embeds: [{
                        title: `${databaseConfig.database}-backup successful`,
                        description: `${databaseConfig.database}-backup has been executed successfully!`,
                        color: 65313
                    }]
                })
            }
        )

        fs.readdir(path.resolve(home, 'storage/backups'), (err, files) => {
            if (err) {
                throw err
            }

            for (const file of files) {
                const date = fileHelper.getBackupDate(file)

                if (date.getTime() < Date.now() - KEEP) {
                    fs.unlink(path.resolve(home, 'storage/backups', file), err => {
                        if (err) {
                            throw err
                        }
                    })
                }
            }
        })
    }
}

module.exports = BackupJob
