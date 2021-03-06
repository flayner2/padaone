import type {TaxIDToTaxName} from '@prisma/client';
import type {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../lib/prisma';

export async function getTaxa(
    query: string|undefined, offset: number = 0): Promise<TaxIDToTaxName[]> {
  const data = await prisma.taxIDToTaxName.findMany({
    where: {
      AND: [{taxName: {contains: query}}, {NOT: {taxName: 'Nan'}}],
    },
    take: 20,
    skip: offset,
    select: {
      taxName: true,
      taxID: true,
    },
  });

  return data;
}

function parseTaxa(foundTaxa: TaxIDToTaxName[]): TaxIDToTaxName[] {
  return foundTaxa.map(
      (taxonObject) => ({
        taxName: `${taxonObject.taxName} (${taxonObject.taxID})`,
        taxID: taxonObject.taxID,
      }));
}

async function handler(
    req: NextApiRequest, res: NextApiResponse<TaxIDToTaxName[]|Error>) {
  if (req.method !== 'GET') {
    res.status(405).send(new Error(`Method ${req.method} is not allowed.`));
  } else if (Array.isArray(req.query.taxonName)) {
    res.status(400).send(
        new Error('Query parameter "taxonName" may contain only one value.'));
  } else {
    if (Array.isArray(req.query.offset)) {
      res.status(400).send(
          new Error('Query parameter "offset" may contain only one value.'));
    } else {
      const taxonName = req.query.taxonName;
      const offset = parseInt(req.query.offset ? req.query.offset : '0');

      if (isNaN(offset) && req.query.offset) {
        res.status(400).send(new Error(
            'Query parameter "offset" must be either empty or a numeric value.'));
      } else {
        try {
          const data = await getTaxa(taxonName, offset ? offset : 0);

          const taxaWithPrettyNames = parseTaxa(data);

          res.status(200).send(taxaWithPrettyNames);
        } catch (error) {
          if (error instanceof Error) {
            if (error.name === 'NotFoundError') {
              res.status(404).send({
                ...error,
                message: `The requested taxon with name or ID ${
                    taxonName} was not found.`,
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
