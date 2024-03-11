import { AuditLogs } from './model/auditLogs'
import { generateEmbeddings, getOpenAiSummary } from './openai'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv';
dotenv.config();
const mongoUrl: any = process.env.mongoUrl;
const client = new MongoClient(mongoUrl)

async function queryLogs(query: string) {
  try {
    await client.connect()
    const db = client.db('genai')
    const collection = db.collection('audit_logs_v2')
    const vectorizedQuery = await generateEmbeddings(query)

    const results = await collection
      .aggregate([
        {
          $vectorSearch: {
            index: 'vector_index',
            queryVector: vectorizedQuery,
            path: 'notes_embedding',
            limit: 4,
            numCandidates: 100,
          },
        },
        {
          $project: {
            _id: 0,
            user: 1,
            template_id: 1,
            audit_category: 1,
            additional_details: 1,
          },
        },
      ])
      .toArray()
    return results
  } finally {
    console.log('Closing connection.')
    await client.close()
  }
}

async function generateResult(query:string) {
  const results = await queryLogs(query)
  const summary = await getOpenAiSummary(results)
  return summary
}

export { queryLogs, generateResult }
