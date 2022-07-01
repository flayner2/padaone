import type {NextApiRequest, NextApiResponse} from 'next';
import * as Fs from 'node:fs/promises';
import path from 'path';
import {prisma} from '../../lib/prisma';
import type {TablePaperInfo} from '../../lib/types';
import {includeTaxonNames} from './papers';

export async function getCurationPapers(offset: number):
    Promise<TablePaperInfo[]> {
  const curatedPapers =
      (await findCuratedPapers()).map((file) => parseInt(file));

  const papers = await prisma.metadataPub.findMany({
    where: {
      AND: [
        {
          classification1stLay: {
            probability: {
              gte: 0.8,
              lte: 1,
            },
          },
        },
        {
          classification2ndLay: {
            probability: {
              gte: 0.9,
              lte: 1,
            },
          },
        },
      ],
      NOT: {
        pmid: {in : curatedPapers},
      },
    },
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
    take: 20,
    skip: offset,
  });
  return papers;
}

export async function findCuratedPapers(): Promise<string[]> {
  const dirPath = path.resolve(path.join(process.cwd(), '../curation'));
  let files: string[] = [];

  try {
    const foundPositive =
        await Fs.readdir(path.resolve(path.join(dirPath, 'positive')));
    const foundNegative =
        await Fs.readdir(path.resolve(path.join(dirPath, 'negative')));

    files.push(...foundPositive, ...foundNegative);
    files = files.map((file) => file.replace('.sql', ''));
  } catch {
    return [];
  }

  return files;
}

async function handler(
    req: NextApiRequest, res: NextApiResponse<TablePaperInfo[]|Error>) {
  if (req.method !== 'GET') {
    res.status(405).send(new Error(`Method ${req.method} is not allowed.`));
  } else {
    const offset = Array.isArray(req.query.offset) ?
        parseInt(req.query.offset[0]) :
        parseInt(req.query.offset ? req.query.offset : '0');

    try {
      const papers = await getCurationPapers(isNaN(offset) ? 0 : offset);
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
