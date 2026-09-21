import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize SQLite Database
const db = new Database('secrets.db');

// Create connections table
db.exec(`
  CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    appId TEXT NOT NULL,
    name TEXT NOT NULL,
    encryptedKey TEXT NOT NULL,
    iv TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`);

// Encryption setup
// In production, this should be a 32-byte key set via environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

// Use a robust Key Derivation Function (KDF) to derive a 32-byte key from the ENCRYPTION_KEY.
// We use scrypt with a fixed salt to ensure the same key is derived across restarts.
// In a more complex setup, the salt could also be managed as an environment variable.
const KEY_BUFFER = crypto.scryptSync(ENCRYPTION_KEY, 'static-salt-for-key-derivation', 32);

function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY_BUFFER, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted
  };
}

function decrypt(encryptedData: string, ivHex: string) {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY_BUFFER, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// API Routes for Connections
app.get('/api/connections', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const stmt = db.prepare('SELECT id, userId, appId, name, createdAt FROM connections WHERE userId = ?');
    const connections = stmt.all(userId);
    res.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

app.post('/api/connections', (req, res) => {
  const { userId, appId, name, apiKey } = req.body;
  
  if (!userId || !appId || !name || !apiKey) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const id = crypto.randomUUID();
    const { iv, encryptedData } = encrypt(apiKey);
    const createdAt = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO connections (id, userId, appId, name, encryptedKey, iv, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, userId, appId, name, encryptedData, iv, createdAt);
    
    res.status(201).json({
      id,
      userId,
      appId,
      name,
      createdAt
    });
  } catch (error) {
    console.error('Error saving connection:', error);
    res.status(500).json({ error: 'Failed to save connection' });
  }
});

app.delete('/api/connections/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const stmt = db.prepare('DELETE FROM connections WHERE id = ? AND userId = ?');
    const result = stmt.run(id, userId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Connection not found or unauthorized' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting connection:', error);
    res.status(500).json({ error: 'Failed to delete connection' });
  }
});

// Endpoint to securely use a connection (example)
app.post('/api/execute-action', (req, res) => {
  const { connectionId, userId, action, payload } = req.body;
  
  try {
    const stmt = db.prepare('SELECT encryptedKey, iv FROM connections WHERE id = ? AND userId = ?');
    const connection = stmt.get(connectionId, userId) as any;
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    const apiKey = decrypt(connection.encryptedKey, connection.iv);
    
    // Here you would use the decrypted apiKey to make the actual API call
    // For now, we just return success to simulate it
    res.json({ success: true, message: 'Action executed securely using decrypted key' });
  } catch (error) {
    console.error('Error executing action:', error);
    res.status(500).json({ error: 'Failed to execute action' });
  }
});

app.post('/api/research', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        systemInstruction: `You are a world-class Research and Automation Assistant for a no-code platform.
        Your goal is to suggest platform connections and automations that benefit the user.
        Use your deep thinking capabilities to provide tailored, personalized suggestions.
        Always include:
        1. Suggested platform connections (e.g., Gmail + Notion + Slack).
        2. Specific automation strategies with step-by-step instructions.
        3. Efficiency gains the user can expect.
        Use Markdown for formatting.`,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        tools: [{ googleSearch: {} }]
      }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'Failed to process research request' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
