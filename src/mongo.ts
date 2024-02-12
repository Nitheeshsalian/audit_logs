import { AuditLogs } from './model/auditLogs'
import { generateEmbeddings, getOpenAiSummary } from './openai'
import { MongoClient } from 'mongodb'
const client = new MongoClient(
  'mongodb+srv://admin:admin@cluster0.ls5ezu2.mongodb.net/',
)

async function queryEmbeddings(query: string) {
  try {
    await client.connect()
    const db = client.db('genai')
    const collection = db.collection('audit_logs')
    const vectorizedQuery = await generateEmbeddings(query)

    const results = await collection
      .aggregate([
        {
          $vectorSearch: {
            index: 'vector_index_notes',
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

    const summary = await getOpenAiSummary(results)
    return summary
  } finally {
    console.log('Closing connection.')
    await client.close()
  }
}

export { queryEmbeddings }
