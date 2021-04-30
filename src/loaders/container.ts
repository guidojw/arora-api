import { ContainerBuilder, YamlFileLoader } from 'node-dependency-injection'
import path from 'path'

export default function init (): ContainerBuilder {
  const container = new ContainerBuilder(false, path.join(__dirname, '../..'))
  const loader = new YamlFileLoader(container)
  try { // eslint-disable-line no-useless-catch
    loader.load('./config/container.yml')
  } catch (err) {
    throw err
  }
  return container
}
