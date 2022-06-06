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

async function handler(
    req: NextApiRequest, res: NextApiResponse<Journal[]|Error>) {
  if (req.method !== 'GET') {
    res.status(405).send(new Error(`Method ${req.method} is not allowed.`));
  }

  if (!req.query.journalName.length) {
    res.status(400).send(
        new Error('Query parameter "journalName" is required.'));
  }

  if (Array.isArray(req.query.journalName)) {
    res.status(400).send(
        new Error('Query parameter "journalName" may contain only one value.'));
  } else {
    if (Array.isArray(req.query.offset)) {
      res.status(400).send(
          new Error('Query parameter "offset" may contain only one value.'));
    } else {
      const journal = req.query.journalName;
      const offset = parseInt(req.query.offset);

      if (!offset && req.query.offset.length) {
        res.status(400).send(new Error(
            'Query parameter "offset" must be either empty or a numeric value.'));
      }

      try {
        const data = await getJournalsByName(journal, offset ? offset : 0);

        res.status(200).send(data);
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'NotFoundError') {
            res.status(400).send({
              ...error,
              message:
                  `The requested journal with title ${journal} was not found.`,
            });
          } else {
            res.status(500).send(error);
          }
        }
      }
    }
  }
}

export default handler;
