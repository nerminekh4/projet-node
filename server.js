const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

mongoose.connect("mongodb+srv://nerminekh:nermine321@tpnode.3xapw.mongodb.net/TPnode?retryWrites=true&w=majority", {
})
  .then(() => console.log(" Connexion à MongoDB réussie !"))
  .catch((err) => console.error(" Connexion à MongoDB échouée !", err));


const MessageSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: String,
  message: String,
  date: String,
  heure: String,
},
{ _id: false } 
);

const CounterSchema = new mongoose.Schema({
    _id: String,
    seq: Number,
  });
  const Counter = mongoose.model("Counter", CounterSchema);  

async function getNextSequence(name) {
    const counter = await Counter.findOneAndUpdate(
      { _id: name },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return counter.seq;
  }

const Message = mongoose.model("Message", MessageSchema);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


app.get('/logs', async (req, res) => {
  try {
    
    const messages = await Message.find();
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des logs" });
  }
});

// Route pour supprimer un message par ID ; soufiane

// Gestion des connexions WebSocket: mustapha
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

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});

