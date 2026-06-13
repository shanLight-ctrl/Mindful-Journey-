import { trainModel } from '../../server/mlHandlers.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    res.json(await trainModel())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
