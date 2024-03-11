import { AuditLogs } from './model/auditLogs'
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();
const apiKey = process.env.apiKey;
const openai = new OpenAI({
  apiKey: apiKey
})

async function generateEmbeddings(text: string) {
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  })
  const [{ embedding }] = embeddingResponse.data
  return embedding
}

async function getOpenAiSummary(results: any) {
  const notes = results.map(
    (item: { additional_details: { Notes: string } }) =>
      item.additional_details && item.additional_details
        ? item.additional_details
        : '',
  )
  const toSummary = notes.filter(
    (item: string, index: number) => notes.indexOf(item) === index,
  )

  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: 'Break sentance and summarise' + toSummary }],
    model: 'gpt-3.5-turbo-1106',
  })

  return completion.choices[0]
}

export { generateEmbeddings, getOpenAiSummary }
