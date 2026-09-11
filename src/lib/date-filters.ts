import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns';

export type DatePreset = 'this_month' | 'last_month' | 'last_3_months' | 'custom' | 'all_time';

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Returns a { from, to } Date object for a given preset, or null for 'all_time'.
 * Uses date-fns for robust date math.
 */
export function getPaymentDateRange(
  preset: DatePreset | string,
  customFrom?: string | Date | null,
  customTo?: string | Date | null,
  referenceDate: Date = new Date()
): DateRange | null {
  switch (preset) {
    case 'this_month': {
      return {
        from: startOfMonth(referenceDate),
        to: endOfMonth(referenceDate),
      };
    }
    case 'last_month': {
      const lastMonth = subMonths(referenceDate, 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    }
    case 'last_3_months': {
      // 3 calendar months including current month (e.g. Sept, Aug, July)
      const threeMonthsAgo = subMonths(referenceDate, 2);
      return {
        from: startOfMonth(threeMonthsAgo),
        to: endOfMonth(referenceDate),
      };
    }
    case 'custom': {
      if (!customFrom || !customTo) return null;
      const fromDate = typeof customFrom === 'string' ? new Date(customFrom) : customFrom;
      const toDate = typeof customTo === 'string' ? new Date(customTo) : customTo;

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return null;

      return {
        from: startOfDay(fromDate),
        to: endOfDay(toDate),
      };
    }
    case 'all_time':
    default:
      return null;
  }
}

/**
 * Helper to return human readable label for date range presets.
 */
export function getPresetLabel(preset: DatePreset | string): string {
  switch (preset) {
    case 'this_month':
      return 'This Month';
    case 'last_month':
      return 'Last Month';
    case 'last_3_months':
      return 'Last 3 Months';
    case 'custom':
      return 'Custom Range';
    case 'all_time':
    default:
      return 'All Time';
  }
}
