import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Fave Nuvio Resolver is running"
  });
});

app.get("/manifest.json", (req, res) => {
  res.json({
    id: "com.elad.fave.nuvio.resolver",
    version: "1.0.0",
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

    res.json({
      streams: []
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      streams: [],
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Fave Nuvio Resolver running on port ${PORT}`);
});
