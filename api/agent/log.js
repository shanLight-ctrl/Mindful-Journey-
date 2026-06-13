import { getAgentLog } from '../../server/agent.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    res.json(await getAgentLog(20))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
