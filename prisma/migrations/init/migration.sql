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

    UNIQUE INDEX `idx_classification_2ndLay_PMID`(`PMID`),
    INDEX `idx_classification_2ndLay_probability`(`probability`)
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

    INDEX `idx_classifications_1stLay_probability`(`probability`),
    PRIMARY KEY (`PMID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `geneIDs_PMIDs` (
    `PMID` INTEGER NOT NULL,
    `geneIDs` INTEGER NOT NULL,

    INDEX `geneIDs`(`geneIDs`),
    INDEX `idx_geneIDs_PMIDs_PMID_geneIDs`(`PMID`, `geneIDs`)
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

    INDEX `PMID`(`PMID`),
    INDEX `idx_metadataPub_YearPub_LastAuthor_Citations`(`YearPub`, `LastAuthor`, `Citations`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taxIDsAccNumb` (
    `geneIDs` INTEGER NOT NULL,
    `OrgTaxName` VARCHAR(200) NULL,
    `TaxID` INTEGER NULL,
    `AccNumb` VARCHAR(2000) NULL,

    INDEX `TaxID`(`TaxID`),
    INDEX `idx_taxIDsAccNumb_OrgTaxName`(`OrgTaxName`),
    PRIMARY KEY (`geneIDs`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taxPath` (
    `TaxID` INTEGER NOT NULL,
    `OrgLineage` VARCHAR(3000) NULL,
    `LineagePath` VARCHAR(3000) NULL,

    PRIMARY KEY (`TaxID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `classification_2ndLay` ADD CONSTRAINT `classification_2ndLay_ibfk_1` FOREIGN KEY (`PMID`) REFERENCES `classifications_1stLay`(`PMID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `geneIDs_PMIDs` ADD CONSTRAINT `geneIDs_PMIDs_ibfk_1` FOREIGN KEY (`PMID`) REFERENCES `classifications_1stLay`(`PMID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `geneIDs_PMIDs` ADD CONSTRAINT `geneIDs_PMIDs_ibfk_2` FOREIGN KEY (`geneIDs`) REFERENCES `taxIDsAccNumb`(`geneIDs`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `metadataPub` ADD CONSTRAINT `metadataPub_ibfk_1` FOREIGN KEY (`PMID`) REFERENCES `classifications_1stLay`(`PMID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `taxIDsAccNumb` ADD CONSTRAINT `taxIDsAccNumb_ibfk_1` FOREIGN KEY (`TaxID`) REFERENCES `taxPath`(`TaxID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

