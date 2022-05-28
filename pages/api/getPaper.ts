import type {MetadataPub} from '@prisma/client';
import type {NextApiRequest, NextApiResponse} from 'next';
import {convertToFloatOrDefault} from '../../lib/helpers';
import {prisma} from '../../lib/prisma';
import type {PaperProbabilityReturn} from '../../lib/types';

export async function getPaper(pmid: number): Promise<MetadataPub|null> {
  const paper = await prisma.metadataPub.findFirst({
    where: {
      pmid,
    },
  });

  return paper;
}

export async function getPaperProbability(pmid: number):
    Promise<PaperProbabilityReturn> {
  const paperProbability1stLay = await prisma.classification1stLay.findFirst({
    where: {
      pmid,
    },
    select: {
      probability: true,
    },
  });

  const paperProbability2ndLay = await prisma.classification2ndLay.findFirst({
    where: {
      pmid,
    },
    select: {
      probability: true,
    },
  });

  return {
    probability1stLay:
        convertToFloatOrDefault(paperProbability1stLay?.probability, 0, 100, 0),
    probability2ndLay:
        convertToFloatOrDefault(paperProbability2ndLay?.probability, 0, 100, 0),
  };
}

async function handler(
    req: NextApiRequest, res: NextApiResponse<MetadataPub|null>) {
  const pmid = parseInt(
      Array.isArray(req.query.pmid) ? req.query.pmid[0] : req.query.pmid);

  const paper = await getPaper(pmid);

  res.status(200).send(paper);
}

export default handler;
