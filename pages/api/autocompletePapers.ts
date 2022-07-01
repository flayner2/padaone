import type {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../lib/prisma';
import type {PaperTitlePMID} from '../../lib/types';

export async function getPapersByTitle(
    query: string|undefined, offset: number = 0): Promise<PaperTitlePMID[]> {
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
    req: NextApiRequest, res: NextApiResponse<PaperTitlePMID[]|Error>) {
  if (req.method !== 'GET') {
    res.status(405).send(new Error(`Method ${req.method} is not allowed.`));
  } else if (Array.isArray(req.query.paperTitle)) {
    res.status(400).send(
        new Error('Query parameter "paperTitle" may contain only one value.'));
  } else {
    if (Array.isArray(req.query.offset)) {
      res.status(400).send(
          new Error('Query parameter "offset" may contain only one value.'));
    } else {
      const paper = req.query.paperTitle;
      const offset = parseInt(req.query.offset ? req.query.offset : '0');

      if (isNaN(offset) && req.query.offset) {
        res.status(400).send(new Error(
            'Query parameter "offset" must be either empty or a numeric value.'));
      } else {
        try {
          const data = await getPapersByTitle(paper, offset ? offset : 0);

          res.status(200).send(data);
        } catch (error) {
          if (error instanceof Error) {
            if (error.name === 'NotFoundError') {
              res.status(404).send({
                ...error,
                message:
                    `The requested paper with title ${paper} was not found.`,
              });
            } else {
              res.status(500).send(error);
            }
          }
        }
      }
    }
  }
}

export default handler;
