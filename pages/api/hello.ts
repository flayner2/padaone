import type {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../lib/prisma';

// type Data = {
// name: string
//}

export default async function handler(
    req: NextApiRequest, res: NextApiResponse<any>) {
  const data = await prisma.geneIDToPMID.findMany({
    where: {
      pmid: 1393606,
    },
  });

  res.status(200).json(data);
}
