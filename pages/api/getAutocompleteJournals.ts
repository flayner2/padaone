import type {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../lib/prisma';
import type {Journal} from '../../lib/types';

export async function getJournalsByName(
    query: string, offset: number = 0): Promise<Journal[]> {
  const data = await prisma.metadataPub.findMany({
    where: {
      journal: {contains: query},
      AND: {
        journal: {not: null},
      },
    },
    take: 20,
    skip: offset,
    select: {
      journal: true,
    },
    distinct: ['journal'],
  });

  return data;
}

async function handler(req: NextApiRequest, res: NextApiResponse<Journal[]>) {
  const journal = Array.isArray(req.query.journalName) ?
      req.query.journalName[0] :
      req.query.journalName;
  const offset = parseInt(
      Array.isArray(req.query.offset) ? req.query.offset[0] : req.query.offset);

  const data = await getJournalsByName(journal, offset ? offset : 0);

  res.status(200).send(data);
}

export default handler;
