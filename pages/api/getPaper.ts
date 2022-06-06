import type {MetadataPub} from '@prisma/client';
import type {NextApiRequest, NextApiResponse} from 'next';
import {convertToFloatOrDefault} from '../../lib/helpers';
import {prisma} from '../../lib/prisma';
import type {FullTaxonomicData, PaperProbabilityReturn,} from '../../lib/types';

export async function getPaper(pmid: number): Promise<MetadataPub|null> {
  try {
    const paper = await prisma.metadataPub.findFirst({
      where: {
        pmid,
      },
    });

    return paper;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NotFoundError') {
        throw error;
      }
      throw new Error('Unknown error occurred.', {cause: error});
    }
    throw error;
  }
}

export async function getPaperProbability(pmid: number):
    Promise<PaperProbabilityReturn> {
  try {
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

    if (paperProbability1stLay && paperProbability2ndLay) {
      return {
        probability1stLay: convertToFloatOrDefault(
            paperProbability1stLay?.probability, 0, 100, 0),
        probability2ndLay: convertToFloatOrDefault(
            paperProbability2ndLay?.probability, 0, 100, 0),
      };
    } else {
      throw new Error(
          `Something went wrong when searching for the probabilities of paper ${
              pmid}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NotFoundError') {
        throw error;
      }
      throw new Error('Unknown error occurred.', {cause: error});
    }
    throw error;
  }
}

export async function getPaperTaxonomicData(pmid: number):
    Promise<FullTaxonomicData[]> {
  try {
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

    const wideTaxonData = taxonData.map(({geneID, taxIDsAccNumb}) => ({
                                          geneIDs: [geneID],
                                          ...taxIDsAccNumb,
                                        }));

    let finalTaxonData = new Array<FullTaxonomicData>();

    for (const taxon of wideTaxonData) {
      const currentIndex =
          finalTaxonData.findIndex((value) => value.taxID === taxon.taxID);

      if (currentIndex >= 0) {
        let currentTaxon = finalTaxonData[currentIndex];
        currentTaxon.geneIDs.push(taxon.geneIDs[0]);

        if (taxon.accNumb) {
          if (currentTaxon.accNumb === 'NaN' || !currentTaxon.accNumb) {
            currentTaxon.accNumb = taxon.accNumb;
          } else {
            currentTaxon.accNumb.concat(`; ${taxon.accNumb}`);
          }
        }
      } else {
        finalTaxonData.push(taxon);
      }
    }

    return finalTaxonData;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NotFoundError') {
        throw error;
      }
      throw new Error('Unknown error occurred.', {cause: error});
    }
    throw error;
  }
}

async function handler(
    req: NextApiRequest, res: NextApiResponse<MetadataPub|Error>) {
  if (req.method !== 'GET') {
    res.status(405).send(Error(`Method ${req.method} is not allowed.`));
  }

  if (!req.query.pmid.length) {
    res.status(400).send(
        Error('Query must include the required parameter "pmid"'));
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
