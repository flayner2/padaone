-- CreateTable
CREATE TABLE `classification_2ndLay` (
    `PMID` INTEGER NOT NULL,
    `score` DECIMAL(8, 7) NOT NULL,
    `probability` DECIMAL(8, 7) NOT NULL,
    `other__` INTEGER NOT NULL,
    `otherTerms` VARCHAR(2000) NULL,
    `known__` INTEGER NOT NULL,
    `knownTerms` VARCHAR(2000) NULL,
    `coverage` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `PMID`(`PMID`),
    INDEX `probability2nd`(`probability`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classifications_1stLay` (
    `PMID` INTEGER NOT NULL,
    `score` DECIMAL(8, 7) NOT NULL,
    `probability` DECIMAL(8, 7) NOT NULL,
    `other__` INTEGER NOT NULL,
    `otherTerms` VARCHAR(2000) NULL,
    `known__` INTEGER NOT NULL,
    `knownTerms` VARCHAR(2000) NULL,
    `coverage` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `PMID`(`PMID`),
    INDEX `probability`(`probability`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `geneIDs_PMIDs` (
    `PMID` INTEGER NOT NULL,
    `geneIDs` INTEGER NOT NULL,

    INDEX `geneIDs_PMIDs_ibfk_2`(`geneIDs`),
    PRIMARY KEY (`PMID`, `geneIDs`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `geneIDs_taxInfo_AccNumb` (
    `geneIDs` INTEGER NOT NULL,
    `OrgTaxName` VARCHAR(200) NULL,
    `TaxID` INTEGER NULL,
    `AccNumb` VARCHAR(2000) NULL,

    INDEX `taxIDsAccNumb_ibfk_1`(`TaxID`),
    PRIMARY KEY (`geneIDs`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metadataPub` (
    `PMID` INTEGER NOT NULL,
    `Titles` VARCHAR(2000) NOT NULL,
    `Abstract` VARCHAR(10000) NULL,
    `PubDate` VARCHAR(15) NULL,
    `YearPub` INTEGER NULL,
    `LastAuthor` VARCHAR(30) NULL,
    `Journal_Abbrev` VARCHAR(70) NULL,
    `Journal` VARCHAR(100) NULL,
    `Volume` VARCHAR(30) NULL,
    `Issue` VARCHAR(30) NULL,
    `Pages` VARCHAR(30) NULL,
    `LanguagePub` VARCHAR(30) NULL,
    `Citations` INTEGER NULL,

    INDEX `citations`(`Citations`),
    INDEX `yearPub`(`YearPub`),
    PRIMARY KEY (`PMID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taxPath` (
    `TaxID` INTEGER NOT NULL,
    `OrgLineage` VARCHAR(3000) NULL,
    `LineagePath` VARCHAR(3000) NULL,

    PRIMARY KEY (`TaxID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curationStatus` (
    `PMID` INTEGER NOT NULL,
    `curationStatus` ENUM('Created', 'Curated Negative', 'Curated Positive') NULL,

    UNIQUE INDEX `PMID`(`PMID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taxID_taxName` (
    `TaxID` INTEGER NOT NULL,
    `TaxName` VARCHAR(200) NOT NULL,

    UNIQUE INDEX `TaxID`(`TaxID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `classification_2ndLay` ADD CONSTRAINT `fkMetadataPubPMID2ndLay` FOREIGN KEY (`PMID`) REFERENCES `metadataPub`(`PMID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classifications_1stLay` ADD CONSTRAINT `fkMetadataPubPMID1stLay` FOREIGN KEY (`PMID`) REFERENCES `metadataPub`(`PMID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `geneIDs_PMIDs` ADD CONSTRAINT `geneIDs_PMIDs_ibfk_2` FOREIGN KEY (`geneIDs`) REFERENCES `geneIDs_taxInfo_AccNumb`(`geneIDs`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `geneIDs_PMIDs` ADD CONSTRAINT `fkMetadataPubPMIDgeneIDs` FOREIGN KEY (`PMID`) REFERENCES `metadataPub`(`PMID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `geneIDs_taxInfo_AccNumb` ADD CONSTRAINT `taxIDsAccNumb_ibfk_1` FOREIGN KEY (`TaxID`) REFERENCES `taxPath`(`TaxID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curationStatus` ADD CONSTRAINT `fkMetadataPubPMIDcur` FOREIGN KEY (`PMID`) REFERENCES `metadataPub`(`PMID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `taxID_taxName` ADD CONSTRAINT `taxIDsSplit_ibfk_1` FOREIGN KEY (`TaxID`) REFERENCES `taxPath`(`TaxID`) ON DELETE CASCADE ON UPDATE CASCADE;

