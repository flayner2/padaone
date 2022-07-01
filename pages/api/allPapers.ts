import {Prisma} from '@prisma/client';
import type {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../lib/prisma';
import type {SortDescriptor, TablePaperInfoRawQuery, TablePaperInfoRawQueryPre,} from '../../lib/types';

function getSortColumn(sortDescriptor: SortDescriptor|undefined): Prisma.Sql {
  const direction = sortDescriptor?.direction === 'ascending' ? 'ASC' : 'DESC';
  const defaultSort = Prisma.raw(`\`k0\`.\`probability\` DESC`);

  if (sortDescriptor?.column != null) {
    switch (sortDescriptor.column) {
      case 'pmid':
        return Prisma.raw(`\`i0\`.\`PMID\` ${direction}`);
      case 'title':
        return Prisma.raw(`\`i0\`.\`Titles\` ${direction}`);
      case 'yearPub':
        return Prisma.raw(`\`i0\`.\`YearPub\` ${direction}`);
      case 'lastAuthor':
        return Prisma.raw(`\`i0\`.\`LastAuthor\` ${direction}`);
      case 'citations':
        return Prisma.raw(`\`i0\`.\`Citations\` ${direction}`);
      case 'probability1stLay':
        return Prisma.raw(`\`j0\`.\`probability\` ${direction}`);
      case 'taxNames':
        return Prisma.raw(`\`taxNames\` IS NULL, \`taxNames\` ${direction}`);
      default:
        return defaultSort;
    }
  }

  return defaultSort;
}

export async function getAllPapers(
    offset: number,
    sortDescriptor: SortDescriptor): Promise<TablePaperInfoRawQuery[]> {
  const sortColumn = getSortColumn(sortDescriptor);
  const dbName = Prisma.raw(`\`${process.env.DB_NAME}\``);

  const papers: TablePaperInfoRawQueryPre[] =
      await prisma.$queryRaw`SELECT \`i0\`.\`PMID\` AS 'pmid', \`i0\`.\`Titles\` AS 'title', \`i0\`.\`YearPub\` AS 'yearPub', \`i0\`.\`LastAuthor\` AS 'lastAuthor', \`i0\`.\`Citations\` AS 'citations', \`j0\`.\`probability\` AS 'probability1stLay', \`k0\`.\`probability\` AS 'probability2ndLay', GROUP_CONCAT(DISTINCT \`m0\`.\`OrgTaxName\` ORDER BY \`m0\`.\`OrgTaxName\` SEPARATOR ',') AS taxNames FROM ${
          dbName}.\`metadataPub\` AS \`i0\` INNER JOIN ${
          dbName}.\`classifications_1stLay\` AS \`j0\` ON (\`j0\`.\`PMID\`) = (\`i0\`.\`PMID\`) INNER JOIN ${
          dbName}.\`classification_2ndLay\` AS \`k0\` ON (\`k0\`.\`PMID\`) = (\`j0\`.\`PMID\`) LEFT JOIN ${
          dbName}.\`geneIDs_PMIDs\` AS \`l0\` ON (\`l0\`.\`PMID\`) = (\`i0\`.\`PMID\`) LEFT JOIN ${
          dbName}.\`geneIDs_taxInfo_AccNumb\` AS \`m0\` ON (\`l0\`.\`geneIDs\`) = (\`m0\`.\`geneIDs\`) GROUP BY \`i0\`.\`PMID\` ORDER BY ${
          sortColumn} LIMIT 20 OFFSET ${Prisma.raw(`${offset}`)}`;

  const processedPapers = papers.map((paper) => ({
                                       ...paper,
                                       taxNames: paper.taxNames?.split(','),
                                     }));

  return processedPapers;
}

async function handler(
    req: NextApiRequest, res: NextApiResponse<TablePaperInfoRawQuery[]|Error>) {
  if (req.method !== 'GET') {
    res.status(405).send(new Error(`Method ${req.method} is not allowed.`));
  } else {
    const offset = Array.isArray(req.query.offset) ?
        parseInt(req.query.offset[0]) :
        parseInt(req.query.offset);
    const sortDescriptor = {
      column: Array.isArray(req.query.sortColumn) ? req.query.sortColumn[0] :
                                                    req.query.sortColumn,
      direction: Array.isArray(req.query.sortDirection) ?
          req.query.sortDirection[0] :
          req.query.sortDirection,
    };
    try {
      const papers =
          await getAllPapers(isNaN(offset) ? 0 : offset, sortDescriptor);
      if (!papers) {
        res.status(404).send(new Error(`No papers were found.`));
      } else {
        res.status(200).send(papers);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name == 'NotFoundError') {
          res.status(404).send({
            ...error,
            message: 'No papers were found.',
          });
        } else {
          res.status(500).send(error);
        }
      }
    }
  }
}

export default handler;
