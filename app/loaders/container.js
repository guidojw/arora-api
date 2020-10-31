'use strict'
const path = require('path')
const { ContainerBuilder, YamlFileLoader } = require('node-dependency-injection')

module.exports = function() {
    const container = new ContainerBuilder(false, path.join(__dirname, '../..'))
    const loader = new YamlFileLoader(container)
    loader.load('./config/application.yml')
    return container
}
