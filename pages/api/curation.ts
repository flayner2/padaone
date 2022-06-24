import * as Fs from 'node:fs/promises';
import path from 'path';
import type {NextApiRequest, NextApiResponse} from 'next';

const ROOT_PATH: string = '../curation';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const pmid = req.body.pmid;
  const statusName = req.body.statusName;

  if (statusName !== 'positive' && statusName !== 'negative') {
    res.status(400).send(new Error(
        'The "statusName" parameter only accepts "positive" or "negative" as its values.'));
    return;
  }

  const filePath = path.resolve(
      path.join(process.cwd(), `${ROOT_PATH}/${statusName}/${pmid}.sql`));

  try {
    const handle = await Fs.open(filePath, 'r');

    res.status(200).json(
        {message: 'The file already exists and it was not modified.'});

    handle.close();

    return;
  } catch {
    try {
      const alternatePath = path.resolve(path.join(
          process.cwd(),
          `${ROOT_PATH}/${
              statusName === 'positive' ? 'negative' :
                                          statusName}/${pmid}.sql`));
      const handle = await Fs.open(alternatePath, 'r');

      res.status(200).json({
        message:
            'The file already exists, but with another status, and it was not modified.',
      });

      handle.close();

      return;
    } catch {
      try {
        await Fs.writeFile(
            filePath,
            `UPDATE paperStatus\nSET status = ${
                statusName === 'positive' ?
                    'curated positive' :
                    'curated negative'}\nWHERE PMID = ${pmid};`,
            {flag: 'wx'});

        res.status(200).json({
          message: `The file ${pmid}.sql with status ${
              statusName} was created successfuly and was written to.`,
        });

        return;
      } catch (error) {
        res.status(500).send(error);
      }
    }
  }
}

export default handler;
