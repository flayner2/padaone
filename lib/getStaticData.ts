import {Prisma} from '@prisma/client';
import {prisma} from './prisma';
import type {LanguagePub, MinMaxYearPub} from './types';

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
