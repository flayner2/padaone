-- AlterTable
ALTER TABLE `geneIDs_PMIDs` ADD PRIMARY KEY (`PMID`, `geneIDs`);

-- AlterTable
ALTER TABLE `metadataPub` ADD PRIMARY KEY (`PMID`);
