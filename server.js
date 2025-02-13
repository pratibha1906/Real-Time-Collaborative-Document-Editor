const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
});

// ✅ Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/realtime_editor", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ Define Schema & Model
const DocumentSchema = new mongoose.Schema({
  title: String,
  content: String,
  bold: Boolean,
  italic: Boolean,
  underline: Boolean,
  fontSize: String,
  fontFamily: String,
  textColor: String,
  bgColor: String,
  textAlign: String,
});

const Document = mongoose.model("Document", DocumentSchema);

io.on("connection", (socket) => {
  console.log("New client connected");

  // ✅ Handle real-time updates
  socket.on("updateContent", (content) => io.emit("updateContent", content));
  socket.on("updateBold", (bold) => io.emit("updateBold", bold));
  socket.on("updateItalic", (italic) => io.emit("updateItalic", italic));
  socket.on("updateUnderline", (underline) => io.emit("updateUnderline", underline));
  socket.on("updateFontSize", (size) => io.emit("updateFontSize", size));
  socket.on("updateFontFamily", (family) => io.emit("updateFontFamily", family));
  socket.on("updateTextColor", (color) => io.emit("updateTextColor", color));
  socket.on("updateBgColor", (color) => io.emit("updateBgColor", color));
  socket.on("updateTextAlign", (align) => io.emit("updateTextAlign", align));

  // ✅ Save document
  socket.on("saveDocument", async (docData) => {
    const { title } = docData;
    if (!title) return socket.emit("error", "Title is required");

    await Document.findOneAndUpdate({ title }, docData, { upsert: true, new: true });
    socket.emit("documentSaved", "Document saved successfully!");
  });

  // ✅ Load document
  socket.on("loadDocument", async (title) => {
    if (!title) return socket.emit("error", "Title is required");

    const doc = await Document.findOne({ title });
    if (doc) {
      socket.emit("documentLoaded", doc);
    } else {
      socket.emit("error", "Document not found");
    }
  });

  socket.on("disconnect", () => console.log("Client disconnected"));
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
