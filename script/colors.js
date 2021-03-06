const fs = require('fs')
const path = require('path')
const getImageColors = require('get-image-colors')
const apps = require('../lib/raw-app-list')()
const colors = {}

console.log('Extracting color palettes from app icons...')

// Prevent superficial diffs in the file by adding sorted keys first
apps.forEach(app => {
  colors[app.slug] = null
})

Promise.all(
  apps
  .filter(app => fs.existsSync(app.iconPath))
  .map(app => {
    return getImageColors(app.iconPath).then(iconColors => {
      colors[app.slug] = iconColors.map(color => color.hex())
      return Promise.resolve(true)
    })
    .catch(error => {
      console.log(`problem with ${app.slug} icon: ${app.iconPath}`)
      console.error(error)
    })
  })
)
.then(apps => {
  fs.writeFileSync(
    path.join(__dirname, '../meta/colors.json'),
    JSON.stringify(colors, null, 2)
  )
})
.catch(error => {
  console.error(error)
})
