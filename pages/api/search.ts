import type {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../lib/prisma';

// type Data = {
// name: string
//}

export async function getData(query: string) {
  const data = await prisma.metadataPub.findMany({
    where: {title: {contains: query}},
  });

  return data;
}

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const title = Array.isArray(req.query.paperTitle) ? req.query.paperTitle[0] :
                                                      req.query.paperTitle;
  const data = await getData(title);

  res.status(200).send(data);
}

export default handler;
