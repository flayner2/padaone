import type {MetadataPub} from '@prisma/client';
import type {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../lib/prisma';
import type {PapersFiltersOptions} from '../../lib/types';
import {parseCitations} from '../../lib/helpers';

export async function getPapers(options: PapersFiltersOptions):
    Promise<(MetadataPub | null)[]> {
  const papers = await prisma.metadataPub.findMany({
    where: {
      classification1stLay: {
        probability: {
          gte: options.firstLayerRange.min / 100,
          lte: options.firstLayerRange.max / 100,
        },
      },
      classification2ndLay: {
        probability: {
          gte: options.secondLayerRange.min / 100,
          lte: options.secondLayerRange.max / 100,
        },
      },
      ...(options.taxonID && {
        geneIDToPMID: {
          some: {geneIDToTaxInfoAccNumb: {taxID: options.taxonID}},
        },
      }),
      ...(options.geneIDs && Array.isArray(options.geneIDs) ?
              {
                OR: options.geneIDs.map((geneID) => ({
                                          geneIDToPMID: {some: {geneID}},
                                        })),
              } :
              {geneIDToPMID: {some: {geneID: options.geneIDs}}}),
    },
  });

  return papers;
}

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<MetadataPub|(MetadataPub | null)[]|Error>) {
  if (req.method !== 'GET') {
    res.status(405).send(new Error(`Method ${req.method} is not allowed.`));
  } else {
    const options: PapersFiltersOptions = {
      firstLayerRange: {
        min: Array.isArray(req.query.firstLayerMin) ?
            parseInt(req.query.firstLayerMin[0]) :
            parseInt(req.query.firstLayerMin),
        max: Array.isArray(req.query.firstLayerMax) ?
            parseInt(req.query.firstLayerMax[0]) :
            parseInt(req.query.firstLayerMax),
      },
      secondLayerRange: {
        min: Array.isArray(req.query.secondLayerMin) ?
            parseInt(req.query.secondLayerMin[0]) :
            parseInt(req.query.secondLayerMin),
        max: Array.isArray(req.query.secondLayerMax) ?
            parseInt(req.query.secondLayerMax[0]) :
            parseInt(req.query.secondLayerMax),
      },
      taxonID: Array.isArray(req.query.taxonID) ?
          parseInt(req.query.taxonID[0]) :
          parseInt(req.query.taxonID),
      geneIDs: Array.isArray(req.query.geneIDs) ?
          req.query.geneIDs.map((geneID) => parseInt(geneID)) :
          parseInt(req.query.geneIDs),
      filters: {
        excludeHosts: Array.isArray(req.query.excludeHosts) ?
            req.query.excludeHosts[0] === 'true' :
            req.query.excludeHosts === 'true',
        forceGeneIDs: Array.isArray(req.query.forceGeneIDs) ?
            req.query.forceGeneIDs[0] === 'true' :
            req.query.forceGeneIDs === 'true',
      },
      terms: req.query.terms,
      lastAuthor: req.query.lastAuthor,
      language: Array.isArray(req.query.language) ? req.query.language[0] :
                                                    req.query.language,
      journal: Array.isArray(req.query.journal) ? req.query.journal[0] :
                                                  req.query.journal,
      allDates: Array.isArray(req.query.allDates) ?
          req.query.allDates[0] === 'true' :
          req.query.allDates === 'true',
      dateRange: {
        min: Array.isArray(req.query.minYear) ? parseInt(req.query.minYear[0]) :
                                                parseInt(req.query.minYear),
        max: Array.isArray(req.query.maxYear) ? parseInt(req.query.maxYear[0]) :
                                                parseInt(req.query.maxYear),
      },
      citations: parseCitations(req.query.citations),
    };

    try {
      const papers = await getPapers(options);
      if (!papers) {
        res.status(404).send(
            new Error(`No papers were found with the selected filters.`));
      } else {
        res.status(200).send(papers);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name == 'NotFoundError') {
          res.status(404).send({
            ...error,
            message: 'No papers were found with the selected filters.',
          });
        } else {
          res.status(500).send(error);
        }
      }
    }
  }
}

export default handler;
