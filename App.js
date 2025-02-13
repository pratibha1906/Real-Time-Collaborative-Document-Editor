import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5000");

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textAlign, setTextAlign] = useState("left");
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on("updateContent", setContent);
    socket.on("updateBold", setBold);
    socket.on("updateItalic", setItalic);
    socket.on("updateUnderline", setUnderline);
    socket.on("updateFontSize", setFontSize);
    socket.on("updateFontFamily", setFontFamily);
    socket.on("updateTextColor", setTextColor);
    socket.on("updateBgColor", setBgColor);
    socket.on("updateTextAlign", setTextAlign);

    socket.on("documentLoaded", (doc) => {
      setTitle(doc.title);
      setContent(doc.content);
      setBold(doc.bold);
      setItalic(doc.italic);
      setUnderline(doc.underline);
      setFontSize(doc.fontSize);
      setFontFamily(doc.fontFamily);
      setTextColor(doc.textColor);
      setBgColor(doc.bgColor);
      setTextAlign(doc.textAlign);
      setMessage("Document loaded successfully!");
    });

    socket.on("documentSaved", (msg) => setMessage(msg));
    socket.on("error", (errMsg) => setMessage(errMsg));

    return () => {
      socket.off("updateContent");
      socket.off("updateBold");
      socket.off("updateItalic");
      socket.off("updateUnderline");
      socket.off("updateFontSize");
      socket.off("updateFontFamily");
      socket.off("updateTextColor");
      socket.off("updateBgColor");
      socket.off("updateTextAlign");
      socket.off("documentLoaded");
      socket.off("documentSaved");
      socket.off("error");
    };
  }, []);

  const handleSave = () => {
    socket.emit("saveDocument", {
      title,
      content,
      bold,
      italic,
      underline,
      fontSize,
      fontFamily,
      textColor,
      bgColor,
      textAlign,
    });
  };

  const handleLoad = () => socket.emit("loadDocument", title);

  return (
    <div className="App">
      <h1>Real-time Document Editor</h1>
      <p style={{ color: "green" }}>{message}</p>

      <div className="controls">
        <input type="text" placeholder="Document Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button onClick={handleSave}>Save</button>
        <button onClick={handleLoad}>Load</button>
      </div>

      <div className="controls">
        <button onClick={() => setBold(!bold)}>B</button>
        <button onClick={() => setItalic(!italic)}>I</button>
        <button onClick={() => setUnderline(!underline)}>U</button>
        <select onChange={(e) => setFontSize(e.target.value)} value={fontSize}>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
        </select>
        <select onChange={(e) => setFontFamily(e.target.value)} value={fontFamily}>
          <option value="Arial">Arial</option>
          <option value="Courier">Courier</option>
          <option value="Georgia">Georgia</option>
        </select>
        <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
        <select onChange={(e) => setTextAlign(e.target.value)} value={textAlign}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ fontWeight: bold ? "bold" : "normal", fontStyle: italic ? "italic" : "normal", textDecoration: underline ? "underline" : "none", fontSize, fontFamily, color: textColor, backgroundColor: bgColor, textAlign }}
      />
    </div>
  );
}

export default App;
