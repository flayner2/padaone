import {prisma} from './prisma';
import type {LanguagePub} from './types';

export async function getAllUniqueLanguages(): Promise<LanguagePub[]> {
  const data = await prisma.metadataPub.findMany({
    distinct: ['languagePub'],
    select: {languagePub: true},
    where: {
      NOT: [{languagePub: null}],
    },
  });

  const languages: LanguagePub[] =
      data.map((languagePub) => languagePub.languagePub);

  return languages;
}

export async function getPubDateRange() {
  const data = await prisma.metadataPub.findMany({
    select: {pubDate: true, yearPub: true},
  });
}
