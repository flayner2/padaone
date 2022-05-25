import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Box, Heading } from '@chakra-ui/react';
import { createCalendar } from '@internationalized/date';
import { useRangeCalendar } from '@react-aria/calendar';
import { useLocale } from '@react-aria/i18n';
import type { RangeCalendarStateOptions } from '@react-stately/calendar';
import { useRangeCalendarState } from '@react-stately/calendar';
import { useRef } from 'react';
import { CalendarButton } from './Button';
import { CalendarGrid } from './CalendarGrid';

export function RangeCalendar(props: RangeCalendarStateOptions) {
  let { locale } = useLocale();
  let state = useRangeCalendarState({
    ...props,
    visibleDuration: { months: 2 },
    locale,
    createCalendar,
  });

  let ref = useRef<HTMLDivElement>(null);
  let { calendarProps, prevButtonProps, nextButtonProps, title } =
    useRangeCalendar(props, state, ref);

  return (
    <div
      {...calendarProps}
      ref={ref}
    >
      <Box
        display="flex"
        alignItems="center"
        paddingBottom="4"
      >
        <CalendarButton {...prevButtonProps}>
          <ChevronLeftIcon
            w={6}
            h={6}
          />
        </CalendarButton>
        <Heading
          as="h2"
          size="md"
          flex="1"
          textAlign="center"
        >
          {title}
        </Heading>
        <CalendarButton {...nextButtonProps}>
          <ChevronRightIcon
            w={6}
            h={6}
          />
        </CalendarButton>
      </Box>
      <Box
        display="flex"
        gap="8"
      >
        <CalendarGrid state={state} />
        <CalendarGrid
          state={state}
          offset={{ months: 1 }}
        />
      </Box>
    </div>
  );
}
