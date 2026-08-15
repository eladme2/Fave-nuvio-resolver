import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

const FAVE_SEARCH_URL = "https://www.favez0ne.net/search.php";

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Fave Nuvio Resolver is running"
  });
});

app.get("/manifest.json", (req, res) => {
  res.json({
    id: "com.elad.fave.nuvio.resolver",
    version: "1.1.0",
    name: "Fave Nuvio Resolver",
    description: "Fave search resolver for Nuvio",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"]
  });
});

app.get("/stream/:type/:id.json", async (req, res) => {
  try {
    const { type, id } = req.params;

    /*
      בשלב הזה אנחנו מקבלים את מזהה הסרט/סדרה מנוביו.
      עדיין לא מבצעים חיפוש אוטומטי לפי שם,
      כי צריך לקבל את שם הסרט בעברית מהמטא-דאטה של נוביו.
    */

    console.log("Nuvio request:", {
      type,
      id
    });

    res.json({
      streams: []
    });

  } catch (error) {
    console.error("Resolver error:", error);

    res.status(500).json({
      streams: [],
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Fave Nuvio Resolver running on port ${PORT}`);
});
