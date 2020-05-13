'use strict'
const { execFile } = require('child_process')
const path = require('path')
const discordMessageJob = require('../jobs/discord-message')
const fs = require('fs')
const fileHelper = require('../helpers/file')

const databaseConfig = require('../../config/database')[process.env.NODE_ENV || 'development']

const KEEP = 7 * 60 * 60 * 24 * 1000 // keep backups 7 days

module.exports = () => {
    const date = new Date()
    const backupName = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date
        .getMinutes()}`
    const backupFile = `export_${backupName}.tar`
    const backupScript = `pg_dump -Ft --username=${databaseConfig.username} -h ${databaseConfig.host} ${databaseConfig
        .database}`

    execFile(
        path.resolve(__dirname, '../../bin/backup.sh'),
        [backupScript, backupFile, databaseConfig.password],
        error => {
            if (error) throw error
            discordMessageJob('backupNotification', {
                embeds: [{
                    title: `${databaseConfig.database}-backup successful`,
                    description: `${databaseConfig.database}-backup has been executed successfully!`,
                    color: 65313
                }]
            })
        }
    )

    fs.readdir('~/storage/backups', (err, files) => {
        if (err) throw err
        for (let file of files) {
            const date = fileHelper.getBackupDate(file)
            if (date.getTime() < Date.now() - KEEP) {
                fs.unlink(`~/storage/backups/${file}`, err => {
                    if (err) throw err
                })
            }
        }
    })
}
