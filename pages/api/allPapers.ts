import type {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../lib/prisma';
import type {TablePaperInfo} from '../../lib/types';
import {includeTaxonNames} from './papers';

export async function getAllPapers(offset: number): Promise<TablePaperInfo[]> {
  const papers = prisma.metadataPub.findMany({
    distinct: ['pmid'],
    take: 20,
    skip: offset,
    select: {
      pmid: true,
      title: true,
      yearPub: true,
      lastAuthor: true,
      citations: true,
      classification1stLay: {
        select: {
          probability: true,
        },
      },
      classification2ndLay: {
        select: {
          probability: true,
        },
      },
    },
    orderBy: [
      {classification2ndLay: {probability: 'desc'}},
      {classification1stLay: {probability: 'desc'}},
    ],
  });

  return papers;
}

async function handler(
    req: NextApiRequest, res: NextApiResponse<TablePaperInfo[]|Error>) {
  if (req.method !== 'GET') {
    res.status(405).send(new Error(`Method ${req.method} is not allowed.`));
  } else {
    const offset = Array.isArray(req.query.offset) ?
        parseInt(req.query.offset[0]) :
        parseInt(req.query.offset);

    try {
      const papers = await getAllPapers(isNaN(offset) ? 0 : offset);
      if (!papers) {
        res.status(404).send(new Error(`No papers were found.`));
      } else {
        try {
          const papersWithIDs = await includeTaxonNames(papers);
          res.status(200).send(papersWithIDs);
        } catch (error) {
          if (error instanceof Error) {
            if (error.name == 'NotFoundError') {
              res.status(404).send({
                ...error,
                message: 'No papers were found.',
              });
            } else {
              res.status(500).send(error);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name == 'NotFoundError') {
          res.status(404).send({
            ...error,
            message: 'No papers were found.',
          });
        } else {
          res.status(500).send(error);
        }
      }
    }
  }
}

export default handler;
