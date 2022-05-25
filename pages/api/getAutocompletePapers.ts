import type {MetadataPub} from '@prisma/client';
import type {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../lib/prisma';

export async function getPapersByTitle(
    query: string, offset: number = 0): Promise<MetadataPub[]> {
  const data = await prisma.metadataPub.findMany({
    where: {title: {contains: query}},
    take: 20,
    skip: offset,
  });

  return data;
}

async function handler(
    req: NextApiRequest, res: NextApiResponse<MetadataPub[]>) {
  const title = Array.isArray(req.query.paperTitle) ? req.query.paperTitle[0] :
                                                      req.query.paperTitle;
  const offset = parseInt(
      Array.isArray(req.query.offset) ? req.query.offset[0] : req.query.offset);

  const data = await getPapersByTitle(title, offset ? offset : 0);

  res.status(200).send(data);
}

export default handler;
