import {Prisma} from '@prisma/client';

import {convertToFloatOrDefault} from './helpers';
import {prisma} from './prisma';

import type {ClassificationRangeReturn, LanguagePub, MinMaxYearPub,} from './types';

export async function getAllUniqueLanguages(): Promise<LanguagePub[]> {
  const data = await prisma.metadataPub.findMany({
    distinct: ['languagePub'],
    select: {languagePub: true},
    where: {
      languagePub: {not: null},
    },
  });

  const languages: LanguagePub[] =
      data.map((languagePub) => languagePub.languagePub);

  return languages;
}

export async function getPubDateRange():
    Promise<Prisma.GetMetadataPubAggregateType<MinMaxYearPub>> {
  const minMaxYear = await prisma.metadataPub.aggregate({
    _max: {
      yearPub: true,
    },
    _min: {
      yearPub: true,
    },
  });

  return minMaxYear;
}

export async function getClassificationLayersRange():
    Promise<ClassificationRangeReturn> {
  const firstLayerRange = await prisma.classification1stLay.aggregate({
    _max: {
      probability: true,
    },
    _min: {
      probability: true,
    },
  });

  const secondLayerRange = await prisma.classification2ndLay.aggregate({
    _max: {
      probability: true,
    },
    _min: {
      probability: true,
    },
  });

  const classificationScores = {
    firstLayer: {
      min: Math.floor(
          convertToFloatOrDefault(firstLayerRange._min.probability, 2, 100, 0)),
      max: Math.ceil(convertToFloatOrDefault(
          firstLayerRange._max.probability, 2, 100, 100)),
    },
    secondLayer: {
      min: Math.floor(convertToFloatOrDefault(
          secondLayerRange._min.probability, 2, 100, 0)),
      max: Math.ceil(convertToFloatOrDefault(
          secondLayerRange._max.probability, 2, 100, 100)),
    },
  };

  return classificationScores;
}
