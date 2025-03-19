const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const validator = require("validator");

initializeApp();
const db = getFirestore();

function generateShortId(length = 8) {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const encurtarUrl = async (req, res, next) => {
  try {
    const originalUrl = req.body.url;

    if (!validator.isURL(originalUrl)) {
      return res.status(400).json({ error: "URL inválida" });
    }

    let shortUrl = req.body.customCode || "";

    if (!shortUrl) {
      let isUnique = false;
      while (!isUnique) {
        shortUrl = generateShortId();
        const existingUrl = await getUrl(shortUrl);
        isUnique = !existingUrl.exists;
      }
    } else {
      const existingUrl = await getUrl(shortUrl);

      if (existingUrl.exists) {
        return res
          .status(409)
          .json({ error: "Este código personalizado já está em uso" });
      }
    }

    await createUrl(shortUrl, originalUrl);

    res.status(201).send(`${process.env.FRONTEND_URL}/${shortUrl}`);
  } catch (error) {
    console.error("Erro ao encurtar URL:", error);
    res.status(500).json({ error: "Erro interno ao processar a solicitação" });
  }
};
const recuperarUrl = async (req, res) => {
  try {
    const shortUrl = req.params.id;
    const link = await getUrl(shortUrl);

    if (!link.exists) {
      return res.status(404).redirect(process.env.FRONTEND_URL);
    }

    const urlData = link.data();

    await updateStats(shortUrl);

    res.redirect(urlData.url_original);
  } catch (error) {
    console.error("Erro ao recuperar URL:", error);
    res.status(500).json({ error: "Erro interno ao processar a solicitação" });
  }
};

async function getUrl(url) {
  return await db.collection("link").doc(url).get();
}

async function createUrl(code, url) {
  return await db.collection("link").doc(code).set({
    url_original: url,
    createdAt: new Date(),
    clicks: 0,
  });
}

async function updateStats(shortUrl) {
  const urlRef = db.collection("link").doc(shortUrl);

  return await db.runTransaction(async (transaction) => {
    const urlDoc = await transaction.get(urlRef);
    if (!urlDoc.exists) return;

    const newClicks = (urlDoc.data().clicks || 0) + 1;

    transaction.update(urlRef, {
      clicks: newClicks,
      updatedAt: new Date(),
    });
  });
}

const getLinkStats = async (req, res) => {
  try {
    const shortUrl = req.params.id;
    const link = await getUrl(shortUrl);

    if (!link.exists) {
      return res.status(404).json({ error: "Link não encontrado" });
    }

    const stats = link.data();

    res.json({
      shortUrl: `${process.env.FRONTEND_URL}/${shortUrl}`,
      originalUrl: stats.url_original,
      clicks: stats.clicks || 0,
      createdAt: stats.createdAt.toDate(),
      expiresAt: stats.expiresAt ? stats.expiresAt.toDate() : null,
      lastAccessed: stats.lastAccessed ? stats.lastAccessed.toDate() : null,
    });
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    res.status(500).json({ error: "Erro interno ao processar a solicitação" });
  }
};

const countLinksToday = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const countQuery = db
      .collection("link")
      .where("createdAt", ">=", startOfDay)
      .where("createdAt", "<=", endOfDay);

    const countSnapshot = await countQuery.count().get();

    res.json({ count: countSnapshot.data().count });
  } catch (error) {
    console.error("Erro ao contar links:", error);
    res.status(500).json({ error: "Erro ao processar a solicitação" });
  }
};

module.exports = {
  encurtarUrl,
  recuperarUrl,
  getLinkStats,
  countLinksToday,
};
