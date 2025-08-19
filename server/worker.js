import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { config } from "dotenv";
config();

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    console.log(`📥 New Job:`, job.data);
    const data = JSON.parse(job.data);

    // 1. Load the PDF
    const loader = new PDFLoader(data.path);
    const rawDocs = await loader.load();

    // 2. Split into smaller chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,   // characters per chunk
      chunkOverlap: 200, // overlap helps preserve context
    });
    
    

    const docs = await splitter.splitDocuments(rawDocs);
    console.log(`📄 Loaded ${rawDocs.length} docs, split into ${docs.length} chunks`);
      console.log(docs);

    // 3. Create Gemini Embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "embedding-001", // Gemini embeddings
      apiKey: process.env.GOOGLE_API_KEY,
    });

    

    // 4. Store in Qdrant
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "langchainjs-testing",
      }
    );

    await vectorStore.addDocuments(docs);

    console.log(`✅ ${docs.length} chunks stored in Qdrant`);
  },
  {
    concurrency: 100,
    connection: {
      host: "localhost",
      port: "6379",
    },
  }
);
