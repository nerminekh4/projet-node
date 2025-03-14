const express = require('express'); 
const mongoose = require('mongoose');
const ChatLog = require('./models/chatLog'); 

const app = express();
const PORT = 5002;


//Connexion à la base de données Mongodb
mongoose.connect('mongodb://localhost:27017/chatdb')
  .then(() => console.log("MongoDB connecté"))
  .catch(err => console.error("Erreur de connexion à MongoDB :", err));


// Middleware pour traiter les requêtes JSON
app.use(express.json());

// ROUTE DELETE pour Supprimer un message par ID
app.delete('/logs/:id', async (req, res) => {
  try {
    const log = await ChatLog.findByIdAndDelete(req.params.id);
    if (!log)
     {
      return res.status(404).json({ error: "Log non trouvé" });  // Si aucun log n'est trouvé avec l'ID donné, renvoie une erreur 404
    }
    res.json({ message: "Log supprimé avec succès" }); // Si la suppression est réussie, envoie une réponse de succès
  } 
  // En cas d'erreur interne, renvoie une erreur 500
  catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression du log" });
  }
});

// Démarrage du serveur sur le port défini (ici 5002)
app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
});
