import type {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../lib/prisma';
import type {TaxonNameAndID} from '../../lib/types';

export async function getPapersByTitle(
    query: string, offset: number = 0): Promise<TaxonNameAndID[]> {
  const isID = !isNaN(parseInt(query));

  const data = await prisma.taxIDToAccNumb.findMany({
    distinct: ['taxID'],
    where: {
      OR: [
        {orgTaxName: {contains: query}},
        {taxID: isID ? parseInt(query) : -1},
      ],
    },
    take: 20,
    skip: offset,
    select: {
      orgTaxName: true,
      taxID: true,
    },
  });

  return data;
}

function parseTaxa(foundTaxa: TaxonNameAndID[]): TaxonNameAndID[] {
  return foundTaxa.map(
      (taxonObject) => ({
        orgTaxName: `${taxonObject.orgTaxName} (${taxonObject.taxID})`,
        taxID: taxonObject.taxID,
      }));
}

async function handler(
    req: NextApiRequest, res: NextApiResponse<TaxonNameAndID[]>) {
  if (req.method !== 'GET') {
    res.status(405).send(Error(`Method ${req.method} is not allowed.`));
  }
  const taxonName = Array.isArray(req.query.taxonName) ?
      req.query.taxonName[0] :
      req.query.taxonName;
  const offset = parseInt(
      Array.isArray(req.query.offset) ? req.query.offset[0] : req.query.offset);

  const data = await getPapersByTitle(taxonName, offset ? offset : 0);

  const taxaWithPrettyNames = parseTaxa(data);

  res.status(200).send(taxaWithPrettyNames);
}

export default handler;
