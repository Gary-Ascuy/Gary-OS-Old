import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

type Response<T> = {
  success: boolean
  data: T
  error?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response<Data>>
) {
  res.status(200).json({
    success: true,
    data: { name: 'Gary Ascuy' },
  })
}
