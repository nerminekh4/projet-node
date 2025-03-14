const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

// Créer une application Express
const app = express();

// Créer un serveur HTTP et l'intégrer avec Socket.io
const server = http.createServer(app);
const io = socketIo(server);

// Connexion à MongoDB
mongoose.connect('mongodb://localhost/tchat', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connecté à MongoDB"))
  .catch(err => console.log("Erreur de connexion à MongoDB:", err));

// Schéma pour les messages de tchat
const messageSchema = new mongoose.Schema({
  name: String,
  message: String,
  date: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Middleware pour servir le fichier index.html
app.use(express.static('public'));

// Route pour récupérer les logs
app.get('/logs', async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    res.status(500).send("Erreur lors de la récupération des logs");
  }
});

// Route pour supprimer un log par ID
app.delete('/logs/:id', async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.send("Message supprimé");
  } catch (err) {
    res.status(500).send("Erreur lors de la suppression du message");
  }
});

// Gérer la connexion WebSocket
io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté');

  // Écouter les messages envoyés par l'utilisateur
  socket.on('chat_message', async (data) => {
    // Sauvegarder le message dans MongoDB
    const message = new Message(data);
    await message.save();

    // Diffuser le message à tous les clients connectés
    io.emit('chat_message', data);
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log('Un utilisateur est déconnecté');
  });
});

// Démarrer le serveur sur le port 3000
server.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});
