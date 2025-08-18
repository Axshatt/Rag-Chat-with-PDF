import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from '@langchain/qdrant';
import { GoogleGenAI } from "@google/genai";
import {config} from "dotenv";
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
  const userQuery = "how to make a new branch";

  const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "embedding-001", // Gemini embeddings
      apiKey: "AIzaSyCdLSH1034TkLnDIllSV24UZQrrJyu3tzA",
    });
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: 'http://localhost:6333',
      collectionName: 'langchainjs-testing',
    }
  );
  const ret = vectorStore.asRetriever({
    k: 2,
  });
  const result = await ret.invoke(userQuery);
  const client = new GoogleGenAI({apiKey:"AIzaSyCdLSH1034TkLnDIllSV24UZQrrJyu3tzA"});
  const SYSTEM_PROMPT = `
  You are helfull AI Assistant who answeres the user query based on the available context from PDF File.
  Context:
  ${JSON.stringify(result)}
  `;

  const chatResult = await client.models.generateContent({
  model: "gemini-1.5-flash", // or gemini-1.5-pro
  contents: [
    { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + userQuery }] }
  ]
});

  console.log(chatResult);
  
  return res.json({
    msg:chatResult.text
    
  });
});

app.listen(8000, () => console.log(`Server started on PORT:${8000}`));