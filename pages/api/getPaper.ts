import type {MetadataPub} from '@prisma/client';
import type {NextApiRequest, NextApiResponse} from 'next';
import {convertToFloatOrDefault} from '../../lib/helpers';
import {prisma} from '../../lib/prisma';
import type {PaperProbabilityReturn, FullTaxonomicData,} from '../../lib/types';

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

export async function getPaperTaxonomicData(pmid: number):
    Promise<FullTaxonomicData[]> {
  const taxonData = await prisma.geneIDToPMID.findMany({
    where: {pmid, NOT: [{taxIDsAccNumb: {accNumb: 'NaN'}}]},
    distinct: ['geneID'],
    select: {
      geneID: true,
      taxIDsAccNumb: {
        select: {
          orgTaxName: true,
          taxID: true,
          accNumb: true,
          taxPath: {
            select: {
              orgLineage: true,
            },
          },
        },
      },
    },
  });

  return taxonData.map(({geneID, taxIDsAccNumb}) => ({
                         geneID,
                         ...taxIDsAccNumb,
                       }));
}

async function handler(
    req: NextApiRequest, res: NextApiResponse<MetadataPub|Error>) {
  if (req.method !== 'GET') {
    res.status(405).send(Error(`Method ${req.method} is not allowed.`));
  }

  const pmid = parseInt(
      Array.isArray(req.query.pmid) ? req.query.pmid[0] : req.query.pmid);

  const message = `The requested paper with PMID ${pmid} was not found.`;

  try {
    const paper = await getPaper(pmid);

    if (!paper) {
      res.status(400).send(Error(message));
    } else {
      res.status(200).send(paper);
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name == 'NotFoundError') {
        res.status(400).send({...error, message});
      } else {
        res.status(500).send(error);
      }
    }
  }
}

export default handler;
