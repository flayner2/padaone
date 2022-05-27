import {Prisma} from '@prisma/client';

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
      min: firstLayerRange._min.probability ?
          parseFloat(
              (Number(firstLayerRange._min.probability) * 100).toFixed(2)) :
          0,
      max: firstLayerRange._max.probability ?
          parseFloat(
              (Number(firstLayerRange._max.probability) * 100).toFixed(2)) :
          100,
    },
    secondLayer: {
      min: secondLayerRange._min.probability ?
          parseFloat(
              (Number(secondLayerRange._min.probability) * 100).toFixed(2)) :
          0,
      max: secondLayerRange._max.probability ?
          parseFloat(
              (Number(secondLayerRange._max.probability) * 100).toFixed(2)) :
          100,
    },
  };

  return classificationScores;
}
