import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from '@langchain/qdrant';
import { GoogleGenAI } from "@google/genai";
import {config} from "dotenv";
// import {GOOGLE_API_KEY} from "./../lib/config.ts"
config();




const queue = new Queue('file-upload-queue', {
  connection: {
    host: 'localhost',
    port: "6379",
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  return res.json({ status: 'All Good!' });
});

app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
  await queue.add(
    'file-ready',
    JSON.stringify({
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
    })
  );
  return res.json({ message: 'uploaded' });
});

app.get('/chat', async (req, res) => {
  const userQuery = req.query.message || "how to make a new branch";

  // Initialize embeddings
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "embedding-001",
    apiKey: process.env.GEMINI_API_KEY,
  });

  // Load existing Qdrant collection
  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: 'http://localhost:6333',
    collectionName: 'langchainjs-testing',
  });

  // Retrieve top-k documents
  const retriever = vectorStore.asRetriever({ k: 2 });
  const results = await retriever.invoke(userQuery);

  // Format context for the prompt
  const context = results.map(r => r.pageContent).join("\n\n");

  const SYSTEM_PROMPT = `
You are a helpful AI Assistant. 
Answer the user query based ONLY on the following context from uploaded PDF files. 
If the context is insufficient, say you don’t know.

Context:
${context}
`;

  // Initialize Gemini client
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // ❌ No "system" role → instead, embed system instructions in user message
  const chatResult = await client.models.generateContent({
    model: "gemini-1.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT + "\n\nUser query: " + userQuery }],
      },
    ],
  });

  // Extract safe text
  const answer =
    chatResult.text || "No response";

  return res.json({
    message: answer,
    docs: results,
  });
});



app.listen(8000, () => console.log(`Server started on PORT:${8000}`));