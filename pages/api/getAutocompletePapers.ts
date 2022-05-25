import type {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../lib/prisma';
import type {PaperTitlePMID} from '../../lib/types';

export async function getPapersByTitle(
    query: string, offset: number = 0): Promise<PaperTitlePMID[]> {
  const data = await prisma.metadataPub.findMany({
    where: {title: {contains: query}},
    take: 20,
    skip: offset,
    select: {
      title: true,
      pmid: true,
    },
  });

  return data;
}

async function handler(
    req: NextApiRequest, res: NextApiResponse<PaperTitlePMID[]>) {
  const title = Array.isArray(req.query.paperTitle) ? req.query.paperTitle[0] :
                                                      req.query.paperTitle;
  const offset = parseInt(
      Array.isArray(req.query.offset) ? req.query.offset[0] : req.query.offset);

  const data = await getPapersByTitle(title, offset ? offset : 0);

  res.status(200).send(data);
}

export default handler;
