// Import des modules
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Initialisation de l'application
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Connexion à MongoDB
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

// WebSocket
io.on("connection", (socket) => {
  console.log("Un utilisateur connecté");

  socket.on("message", async (data) => {
    const nextId = await getNextSequence("messages");
    const newMessage = new Message({ ...data, id: nextId });
  
    await newMessage.save();
    io.emit("message", newMessage);
  });
  
  socket.on("disconnect", () => {
    console.log("Un utilisateur déconnecté");
  });
});

// Routes API
app.get("/logs", async (req, res) => {
    const messages = await Message.find({}, { _id: 0, __v: 0 }); // Exclut _id et __v
    res.json(messages);
  });

app.delete("/logs/:id", async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ message: "Log supprimé" });
});

// Lancement du serveur
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});

