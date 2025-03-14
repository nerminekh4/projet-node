const mongoose = require('mongoose');

// Définition du schéma pour le chat
const chatLogSchema = new mongoose.Schema({
  name: String,
  message: String,
  date: String,
  heure: String
});

// Création du modèle
const ChatLog = mongoose.model('ChatLog', chatLogSchema);

module.exports = ChatLog;

