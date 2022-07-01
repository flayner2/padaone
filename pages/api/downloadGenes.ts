import type {NextApiRequest, NextApiResponse} from 'next';
import {Readable} from 'stream';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Disposition': 'attachment; filename=accessionlist.txt',
  });
  const readStream = Readable.from(req.body.accessions);

  readStream.pipe(res);
}
export default handler;
