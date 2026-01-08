import {Pinecone} from "@pinecone-database/pinecone";
import "dotenv/config";

export const pinecone  = new Pinecone({
    apiKey:process.env.PINECONE_API_KEY!,
    
})

export const pineconeIndex = pinecone.index("githawk-embeddings");


// async function testPinecone() {
//   const stats = await pineconeIndex.describeIndexStats();
//   console.log(stats);
// }

// testPinecone();