/* eslint-disable */
const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

initializeApp()

const db = getFirestore()

const encurtarUrl = async (req, res, next) => {
  const originalUrl = req.body.url
  const shortUrl = gerarShortUrl(originalUrl)
  const link = await createUrl(shortUrl, originalUrl)

  res.send(`${process.env.FRONTEND_URL}/${shortUrl}`)
}

const recuperarUrl = async (req, res) => {
  const shortUrl = req.params.id
  const link = await getUrl(shortUrl)
  if (link.exists) {
    const url = link.data()
    res.redirect(url.url_original)
  } else {
    res.sendStatus(404).redirect(process.env.FRONTEND_URL)
  }
}

function gerarShortUrl(url) {
  const caracteres = btoa(url)
  const tamanho = 6
  let shortUrl = ''

  for (let i = 0; i < tamanho; i++) {
    const randomIndex = Math.floor(Math.random() * (caracteres.length - 1)) + 1
    shortUrl += caracteres[randomIndex]
  }

  return shortUrl
}

async function getUrl(url) {
  return await db.collection('link').doc(url).get()
}

async function createUrl(code, url) {
  const links = await db.collection('link').doc(code).set({
    url_original: url,
  })
}

module.exports = {
  encurtarUrl,
  recuperarUrl,
}
