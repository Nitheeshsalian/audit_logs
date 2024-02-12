import { Router, Request, Response } from 'express'
import { queryLogs, generateResult } from '../mongo'
import Joi from 'joi'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const validator = require('express-joi-validation').createValidator({})

const router = Router()

const bodySchema = Joi.object({
  question: Joi.string().required(),
})

router.post(
  '/',
  validator.body(bodySchema),
  async (req: Request, res: Response) => {
    const result = await generateResult(req.body.question)
    res.status(200).json(result)
  },
)

router.post(
  '/queryLogs',
  validator.body(bodySchema),
  async (req: Request, res: Response) => {
    const result = await queryLogs(req.body.question)
    res.status(200).json(result)
  },
)

export default router
