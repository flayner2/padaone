import {Prisma} from '@prisma/client';
import type {NextApiRequest, NextApiResponse} from 'next';
import {parseCitations} from '../../lib/helpers';
import {prisma} from '../../lib/prisma';
import type {PapersFiltersOptions, TablePaperInfoRawQuery, SortDescriptor, TablePaperInfoRawQueryPre,} from '../../lib/types';

export async function getAssociatedTaxNames(pmid: number):
    Promise<string[]|undefined> {
  const queryResult = await prisma.geneIDToTaxInfoAccNumb.findMany({
    where: {geneIDToPMID: {some: {pmid}}},
    select: {orgTaxName: true},
    distinct: ['taxID'],
  });

  if (queryResult.length) {
    const taxNames = queryResult.flatMap(
        ({orgTaxName}) =>
            orgTaxName && orgTaxName !== 'Nan' ? [orgTaxName] : []);

    return taxNames.length ? taxNames.sort((a, b) => (a < b ? -1 : 1)) :
                             undefined;
  }
}

export async function includeTaxonNames(papers: TablePaperInfoRawQuery[]):
    Promise<TablePaperInfoRawQuery[]> {
  const papersWithNames = Promise.all(papers.map(async (paper) => {
    const associatedTaxNames = await getAssociatedTaxNames(paper.pmid);
    return {...paper, taxNames: associatedTaxNames};
  }));

  return papersWithNames;
}

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

function generateQueryString(
    options: PapersFiltersOptions, offset: number): Prisma.Sql {
  const dbName = Prisma.raw(`\`${process.env.DB_NAME}\``);
  const terms = Array.isArray(options.terms) ?
      options.terms
          .flatMap(
              (term) => term ?
                  [
                    `(\`i0\`.\`Titles\` LIKE ('%${
                        term}%') OR \`i0\`.\`Abstract\` LIKE ('%${term}%'))`,
                  ] :
                  [])
          .join(' OR ') :
      options.terms != null ?
      `\`i0\`.\`Titles\` LIKE ('%${
          options.terms}%') OR \`i0\`.\`Abstract\` LIKE ('%${
          options.terms}%')` :
      null;

  const authors = Array.isArray(options.lastAuthor) ?
      options.lastAuthor
          .flatMap(
              (author) =>
                  author ? [`\`i0\`.\`LastAuthor\` LIKE ('%${author}%')`] : [])
          .join(' OR ') :
      options.lastAuthor != null ?
      `\`i0\`.\`LastAuthor\` LIKE ('%${options.lastAuthor}%')` :
      null;

  const geneIDs = Array.isArray(options.geneIDs) ?
      options.geneIDs
          .flatMap(
              (geneID) => !isNaN(parseInt(geneID.toString())) ?
                  [`\`m0\`.\`geneIDs\` = ${geneID}`] :
                  [
                    `(\`m0\`.\`AccNumb\` LIKE ('${
                        geneID},%') OR \`m0\`.\`AccNumb\` LIKE ('%,${
                        geneID},%') OR \`m0\`.\`AccNumb\` LIKE ('%,${
                        geneID}'))`,
                  ])
          .join(' OR ') :
      options.geneIDs != null ?
      !isNaN(parseInt(options.geneIDs.toString())) ?
      `\`m0\`.\`geneIDs\` = ${options.geneIDs}` :
      `\`m0\`.\`AccNumb\` LIKE ('${
          options.geneIDs},%') OR \`m0\`.\`AccNumb\` LIKE ('%,${
          options.geneIDs},%') OR \`m0\`.\`AccNumb\` LIKE ('%,${
          options.geneIDs}')` :
      null;

  const citations = options.citations != null ?
      options.citations
          .flatMap(
              (citationRange) => citationRange.length > 1 ?
                  [
                    `(\`i0\`.\`Citations\` >= ${
                        citationRange[0]} AND \`i0\`.\`Citations\` <= ${
                        citationRange[1]})`,
                  ] :
                  [`(\`i0\`.\`Citations\` >= ${citationRange[0]})`])
          .join(' OR ') :
      null;

  const sortColumn = getSortColumn(options.sortDescriptor);

  return Prisma.sql`SELECT \`i0\`.\`PMID\` AS 'pmid',
                \`i0\`.\`Titles\` AS 'title',
                \`i0\`.\`YearPub\` AS 'yearPub',
                \`i0\`.\`LastAuthor\` AS 'lastAuthor',
                \`i0\`.\`Citations\` AS 'citations',
                \`j0\`.\`probability\` AS 'probability1stLay',
                \`k0\`.\`probability\` AS 'probability2ndLay',
                GROUP_CONCAT(DISTINCT \`m0\`.\`OrgTaxName\` ORDER BY \`m0\`.\`OrgTaxName\` SEPARATOR ',') AS 'taxNames'
               FROM ${dbName}.\`metadataPub\` AS \`i0\`
               INNER JOIN ${dbName}.\`classifications_1stLay\` AS \`j0\`
                ON (\`j0\`.\`PMID\`) = (\`i0\`.\`PMID\`)
               INNER JOIN ${dbName}.\`classification_2ndLay\` AS \`k0\`
                ON (\`k0\`.\`PMID\`) = (\`j0\`.\`PMID\`)\
              ${
      options.filters?.forceGeneIDs ? Prisma.sql`RIGHT` :
                                      Prisma.sql`LEFT`} JOIN ${
      dbName}.\`geneIDs_PMIDs\` AS \`l0\` ON (\`l0\`.\`PMID\`) = (\`i0\`.\`PMID\`)\
      LEFT JOIN ${dbName}.\`geneIDs_taxInfo_AccNumb\` AS \`m0\`
        ON (\`l0\`.\`geneIDs\`) = (\`m0\`.\`geneIDs\`)
      ${
      options.filters?.excludeHosts || options.taxonID != null ?
          Prisma.sql`LEFT JOIN ${dbName}.\`taxPath\` AS \`n0\`
        ON (\`m0\`.\`TaxID\`) = (\`n0\`.\`TaxID\`)` :
          Prisma.sql``}\
               ${
      options.filters?.onlyCuratedPositive ?
          Prisma.sql`\n               LEFT JOIN ${
              dbName}.\`curationStatus\` AS \`o0\`
                 ON (\`i0\`.\`PMID\`) = (\`o0\`.\`PMID\`)` :
          Prisma.sql``}\ 

          WHERE (\
               ${
      options.filters?.excludeHosts ?
          Prisma.raw(`\n                 (\`n0\`.\`LineagePath\` NOT LIKE ('${
              process.env.HOST_TAXID}-%') AND
                  \`n0\`.\`LineagePath\` NOT LIKE ('%-${
              process.env.HOST_TAXID}-%') AND
                  \`n0\`.\`LineagePath\` NOT LIKE ('-%${
              process.env.HOST_TAXID}')) AND`) :
          Prisma.sql``}\
              ${
      options.filters?.onlyCuratedPositive ?
          Prisma.raw(
              `\n                 (\`o0\`.\`curationStatus\` = 'Curated Positive') AND`) :
          Prisma.sql``}\
              ${
      options.taxonID != null ?
          Prisma.raw(`\n                 (\`n0\`.\`LineagePath\` LIKE ('${
              options.taxonID}-%') OR
                  \`n0\`.\`LineagePath\` LIKE ('%-${options.taxonID}-%') OR
                  \`n0\`.\`LineagePath\` LIKE ('-%${options.taxonID}')) AND`) :
          Prisma.sql``}\
             ${
      terms != null ? Prisma.raw(`\n                 (${terms}) AND`) :
                      Prisma.sql``}\
             ${
      authors != null ? Prisma.raw(`\n                 (${authors}) AND`) :
                        Prisma.sql``}\
             ${
      options.language != null ?
          Prisma.raw(`\n           (\`i0\`.\`LanguagePub\` LIKE ('%${
              options.language}%')) AND`) :
          Prisma.sql``}
             ${
      options.journal != null ?
          Prisma.raw(`\n           (\`i0\`.\`Journal\` LIKE ('%${
              options.journal}%')) AND`) :
          Prisma.sql``}
             ${
      geneIDs != null ? Prisma.raw(`\n                 (${geneIDs}) AND`) :
                        Prisma.sql``}\
             ${
  !options.allDates && options.dateRange?.min && options.dateRange?.max ?
      Prisma.raw(`\n                 (\`i0\`.\`YearPub\` >= ${
          options.dateRange?.min} AND \`i0\`.\`YearPub\` <= ${
          options.dateRange?.max}) AND`) :
      Prisma.sql``}\
             ${
      citations !=
      null ? Prisma.raw(`\n                 (${citations}) AND`) :
             Prisma.sql``}\
      
                 (\`j0\`.\`probability\` >= ${
      Prisma.raw(`${options.firstLayerRange.min / 100}`)} AND
                  \`j0\`.\`probability\` <= ${
      Prisma.raw(`${options.firstLayerRange.max / 100}`)}) AND 
                 (\`k0\`.\`probability\` >= ${
      Prisma.raw(`${options.secondLayerRange.min / 100}`)} AND
                  \`k0\`.\`probability\` <= ${
      Prisma.raw(`${options.secondLayerRange.max / 100}`)})
                )
          GROUP BY \`i0\`.\`PMID\` ORDER BY ${sortColumn} LIMIT 20 OFFSET ${
      Prisma.raw(`${offset}`)} `;
}

export async function getPapers(queryString: Prisma.Sql):
    Promise<TablePaperInfoRawQuery[]> {
  const papers: TablePaperInfoRawQueryPre[] =
      await prisma.$queryRaw(queryString);
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
          !isNaN(parseInt(req.query.taxonID[0])) ?
          parseInt(req.query.taxonID[0]) :
          undefined :
          !isNaN(parseInt(req.query.taxonID)) ? parseInt(req.query.taxonID) :
                                                undefined,
      geneIDs: Array.isArray(req.query.geneIDs) ?
          req.query.geneIDs.map(
              (geneID) =>
                  !isNaN(parseInt(geneID)) ? parseInt(geneID) : geneID) :
          !isNaN(parseInt(req.query.geneIDs)) ? parseInt(req.query.geneIDs) :
                                                req.query.geneIDs,
      filters: {
        excludeHosts: Array.isArray(req.query.excludeHosts) ?
            req.query.excludeHosts[0] === 'true' :
            req.query.excludeHosts === 'true',
        forceGeneIDs: Array.isArray(req.query.forceGeneIDs) ?
            req.query.forceGeneIDs[0] === 'true' :
            req.query.forceGeneIDs === 'true',
        onlyCuratedPositive: Array.isArray(req.query.onlyCuratedPositive) ?
            req.query.onlyCuratedPositive[0] === 'true' :
            req.query.onlyCuratedPositive === 'true',
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
        min: Array.isArray(req.query.minYear) ?
            !isNaN(parseInt(req.query.minYear[0])) ?
            parseInt(req.query.minYear[0]) :
            undefined :
            !isNaN(parseInt(req.query.minYear)) ? parseInt(req.query.minYear) :
                                                  undefined,
        max: Array.isArray(req.query.maxYear) ?
            !isNaN(parseInt(req.query.maxYear[0])) ?
            parseInt(req.query.maxYear[0]) :
            undefined :
            !isNaN(parseInt(req.query.maxYear)) ? parseInt(req.query.maxYear) :
                                                  undefined,
      },
      citations: parseCitations(req.query.citations),
      sortDescriptor: {
        column: Array.isArray(req.query.sortColumn) ? req.query.sortColumn[0] :
                                                      req.query.sortColumn,
        direction: Array.isArray(req.query.sortDirection) ?
            req.query.sortDirection[0] :
            req.query.sortDirection,
      },
    };

    const offset = Array.isArray(req.query.offset) ?
        parseInt(req.query.offset[0]) :
        parseInt(req.query.offset);

    try {
      const queryString =
          generateQueryString(options, isNaN(offset) ? 0 : offset);
      const papers = await getPapers(queryString);
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
