import { globby } from 'globby'
import { default as fs } from 'fs-extra'
import path from 'path'

const cwd = process.cwd()

/**
 * 判断是否存在同名组件
 * @param  name 组件名称
 */
const hasSameComponent = (name: string) => {
  let files;
  try {
    files = fs.readdirSync(path.resolve(__dirname, `../docs/guide/${name}.md`))
  } catch (error) {
    files = []
  }
  return files.length > 0;
}


const getDocsPath = async () => {
  const packagePaths = await globby('../packages/core/src', {
    cwd: __dirname,
    expandDirectories: {
      files: ['*/*.md'],
    },
    deep: 2,
  })
  return packagePaths.map((item: string) => item.replace('../', ''))
}

const start = async () => {
  const docs = await getDocsPath()
  docs.map(v => {
    const fileName = v.split('/')[3] || ''
    const copiedPath = path.join(__dirname, '../' + v)
    const resultPath = path.join(__dirname, `../docs/guide/${fileName}.md`)
    // fs.writeFileSync(resultPath, fs.readFileSync(copiedPath))
    fs.copyFileSync(copiedPath, resultPath)
  })
  // changeDocRoute(docs)
}

export default start
