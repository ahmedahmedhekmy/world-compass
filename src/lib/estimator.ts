import type { CostTier } from "@/data/countries";

export interface EstimatorInput {
  tier: CostTier;
  nights: number;
  adults: number;
  children: number;
  accommodation: "budget" | "comfort" | "premium";
  style: "economy" | "balanced" | "rich";
  longHaul: boolean;
  visaNeeded: boolean;
}

export interface EstimateBreakdown {
  flights: number;
  accommodation: number;
  visa: number;
  localTransport: number;
  food: number;
  daily: number;
  activities: number;
  misc: number;
}

const dailyFood: Record<CostTier, number> = { low: 18, mid: 35, high: 60 };
const nightlyRoom: Record<CostTier, number> = { low: 35, mid: 80, high: 160 };
const transportDay: Record<CostTier, number> = { low: 6, mid: 12, high: 22 };
const activityDay: Record<CostTier, number> = { low: 10, mid: 20, high: 38 };

const accomFactor = { budget: 0.7, comfort: 1, premium: 1.9 } as const;
const styleFactor = { economy: 0.8, balanced: 1, rich: 1.55 } as const;

/**
 * Deterministic, transparent estimate. Values are assumptions, never live prices;
 * every surface that renders them must label them as تقديري.
 */
export function estimate(input: EstimatorInput): {
  breakdown: EstimateBreakdown;
  tripTotal: number;
  perPerson: number;
} {
  const nights = Math.max(1, input.nights);
  const travellers = Math.max(1, input.adults) + input.children * 0.7;
  const af = accomFactor[input.accommodation];
  const sf = styleFactor[input.style];

  const rooms = Math.ceil((input.adults + input.children) / 2);
  const flightBase = input.longHaul ? 780 : 260;
  const flights = flightBase * (input.adults + input.children * 0.8) * (input.style === "rich" ? 1.5 : 1);
  const accommodation = nightlyRoom[input.tier] * af * rooms * nights;
  const food = dailyFood[input.tier] * sf * travellers * (nights + 1);
  const localTransport = transportDay[input.tier] * travellers * nights;
  const activities = activityDay[input.tier] * sf * travellers * nights;
  const visa = input.visaNeeded ? 85 * (input.adults + input.children) : 0;
  const daily = 12 * sf * travellers * nights;
  const subtotal = flights + accommodation + food + localTransport + activities + visa + daily;
  const misc = subtotal * 0.07;

  const breakdown: EstimateBreakdown = {
    flights,
    accommodation,
    visa,
    localTransport,
    food,
    daily,
    activities,
    misc,
  };
  const tripTotal = subtotal + misc;
  return { breakdown, tripTotal, perPerson: tripTotal / Math.max(1, input.adults + input.children) };
}

export const breakdownLabels: Record<keyof EstimateBreakdown, string> = {
  flights: "الطيران",
  accommodation: "الإقامة",
  visa: "التأشيرة",
  localTransport: "المواصلات الداخلية",
  food: "الطعام",
  daily: "المصاريف اليومية",
  activities: "الأنشطة والجولات",
  misc: "مصاريف متنوعة",
};

export const DISCLAIMER_MAIN =
  "الأسعار المعروضة تقديرية وليست نهائية، وقد تكون الرحلة الفعلية أقل أو أعلى حسب تاريخ السفر، وتوافر الطيران والفنادق، والعروض والأسعار وقت الحجز، وطريقة إنفاقك أثناء الرحلة.";

export const DISCLAIMER_SCOPE =
  "نحسب لك صورة تقريبية عن ميزانية الرحلة كاملة، وليس الطيران والإقامة فقط، بل أيضًا التأشيرة، المواصلات، الطعام، المصاريف اليومية، والأنشطة والمصاريف المتوقعة حسب وجهتك.";

export const DISCLAIMER_RANGE = "قد تكون رحلتك الفعلية أرخص من التقدير الظاهر أو أعلى منه.";

export const INSURANCE_NOTE =
  "يُحسب بشكل منفصل حسب شركة التأمين والتغطية المطلوبة.";
