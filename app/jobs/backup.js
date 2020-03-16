'use strict'
const { execFile } = require('child_process')

const databaseConfig = require('../../config/database')[process.env.NODE_ENV]

module.exports = () => {
    const date = new Date()
    const currentDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date
        .getMinutes()}`
    const backupFile = `~/storage/backups/export_${currentDate}`
    const backupScript = `pg_dump --username=${databaseConfig.username} ${databaseConfig.database}`

    execFile(
        `../../bin/backup.sh`,
        [backupScript, backupFile, databaseConfig.password],
        error => {
            if (error) console.log(`exec error: ${error}`)
            console.log('Backup complete!')
        }
    )
}
