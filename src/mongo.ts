import { AuditLogs } from './model/auditLogs'
import { generateEmbeddings, getOpenAiSummary, getOpenAiSummaryv3 } from './openai'
import { Document, MongoClient } from 'mongodb'
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

async function queryLogsv3(query: string) {
  try {
    await client.connect()
    const db = client.db('genai')
    const collection = db.collection('audit_logs_v3')
    const vectorizedQuery = await generateEmbeddings(query)

    const results = await collection
      .aggregate([
        {
          $vectorSearch: {
            index: 'vector_index',
            queryVector: vectorizedQuery,
            path: 'notes_embedding',
            limit: 10,
            numCandidates: 100
          },
        },
        {
          $project: {
            _id: 0,
            user: 1,
            template_id: 1,
            audit_category: 1,
            additional_details: 1,
            attributes_map: 1,
            time: 1,
            score: {
              '$meta': 'vectorSearchScore'
            }
          }
        }
      ])
      .toArray()
    const orderNumber = query.replace(/[^0-9]/g, '')
    if(orderNumber != ''){
      const numbersArray: Document[] = []
      results.map(item=> {
        if(item.additional_details.Notes.indexOf(orderNumber) > 0)
        numbersArray.push(item)
      })
      return numbersArray
    } else {
      return results
    }
  } finally {
    console.log('Closing connection.')
    await client.close()
  }
}

async function generateResultv3(query:string) {
  const results = await queryLogsv3(query)
  const summary = await getOpenAiSummaryv3(results)
  return summary
}

export { queryLogs, generateResult, generateResultv3, queryLogsv3 }
