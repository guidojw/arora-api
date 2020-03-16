'use strict'
const { execFile } = require('child_process')
const path = require('path')

const databaseConfig = require('../../config/database')[process.env.NODE_ENV]

const backupsPath = '~/storage/backups'

module.exports = () => {
    const date = new Date()
    const backupName = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date
        .getMinutes()}`
    const backupFile = `${backupsPath}/export_${backupName}`
    const backupScript = `pg_dump --username=${databaseConfig.username} ${databaseConfig.database}`

    execFile(
        path.resolve(__dirname, '../../bin/backup.sh'),
        [backupScript, backupFile, databaseConfig.password],
        error => {
            if (error) console.log(`exec error: ${error}`)
            console.log('Backup complete!')
        }
    )
}
