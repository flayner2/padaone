import type {TaxIDToTaxName} from '@prisma/client';
import type {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../lib/prisma';

export async function getTaxon(query: number): Promise<TaxIDToTaxName> {
  const taxon = await prisma.taxIDToTaxName.findFirst({
    where: {taxID: query},
    select: {
      taxName: true,
      taxID: true,
    },
  });

  if (!taxon) {
    throw new Error(
        `Something went wrong when searching for taxon with TaxonID ${query}`);
  }

  return taxon;
}

async function handler(
    req: NextApiRequest, res: NextApiResponse<TaxIDToTaxName|Error>) {
  if (req.method !== 'GET') {
    res.status(405).send(new Error(`Method ${req.method} is not allowed.`));
  } else if (Array.isArray(req.query.taxonID)) {
    res.status(400).send(
        new Error('Query parameter "taxonID" may contain only one value.'));
  } else {
    const taxonID = parseInt(req.query.taxonID);

    if (isNaN(taxonID)) {
      res.status(400).send(
          new Error('Query parameter "taxonID" must be a numeric value.'));
    }

    try {
      const taxon = await getTaxon(taxonID);

      res.status(200).send(taxon);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotFoundError') {
          res.status(404).send({
            ...error,
            message: `The requested taxon with id ${taxonID} was not found.`,
          });
        } else {
          res.status(500).send(error);
        }
      }
    }
  }
}

export default handler;
