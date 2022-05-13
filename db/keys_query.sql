-- Add composite key to geneIDs_PMIDs
ALTER TABLE `geneIDs_PMIDs` ADD PRIMARY KEY (`PMID`, `geneIDs`);

-- Make PMID on metadataPub a primary key
ALTER TABLE `metadataPub` ADD PRIMARY KEY (`PMID`);

-- Drop all FKs that reference PMID from classifications_1stLay
ALTER TABLE `classification_2ndLay` DROP FOREIGN KEY `classification_2ndLay_ibfk_1`;
ALTER TABLE `geneIDs_PMIDs` DROP FOREIGN KEY `geneIDs_PMIDs_ibfk_1`;
ALTER TABLE `metadataPub` DROP FOREIGN KEY `metadataPub_ibfk_1`;

-- Drop existing PK in classifications_1stLay
ALTER TABLE `classifications_1stLay` DROP PRIMARY KEY;

-- Make all previous PMID FKs reference metadataPub's PMID PK, and make sure they're unique
ALTER TABLE `classifications_1stLay` ADD CONSTRAINT `fkMetadataPubPMID1stLay` FOREIGN KEY (`PMID`) REFERENCES metadataPub(PMID);
ALTER TABLE `classifications_1stLay` ADD UNIQUE (`PMID`);

ALTER TABLE `classification_2ndLay` ADD CONSTRAINT `fkMetadataPubPMID2ndLay` FOREIGN KEY (`PMID`) REFERENCES metadataPub(PMID);
ALTER TABLE `classification_2ndLay` ADD UNIQUE (`PMID`);

-- This one can't be unique but that's fine, the PK is a unique set of composite keys
ALTER TABLE `geneIDs_PMIDs` ADD CONSTRAINT `fkMetadataPubPMIDgeneIDs` FOREIGN KEY (`PMID`) REFERENCES metadataPub(PMID);
