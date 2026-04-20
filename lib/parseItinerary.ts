import { AIRPORTS } from './airports'
import { AIRLINES } from './airlines'

const AIRPORT_IATA_SET = new Set(AIRPORTS.map(a => a.iata))
// Common English 3-letter words to ignore when scanning for IATA codes
const IGNORE_WORDS = new Set([
  'THE','AND','FOR','NOT','YOU','ARE','BUT','ALL','CAN','HER','WAS','ONE',
  'OUR','OUT','WHO','GET','MAY','HIM','HIS','HOW','ITS','NEW','NOW','OLD',
  'SEE','TWO','WAY','WHO','BOY','DID','HAS','HIM','LET','PUT','SAY','TOO',
  'USE','DAD','MOM','SUN','MON','TUE','WED','THU','FRI','SAT','JAN','FEB',
  'MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC','ETA','ETD',
  'REF','PNR','NUM','EST','USD','VND','EUR','GBP','AUD','CAD','TAX','FEE',
  'PDF','SMS','APP','FAQ','LAP','INF','ADT','CHD','PAX','SVC','BAG','KGS',
  'LBS','KG','LB','AM','PM','UTC','GMT',
])

export interface ParsedSegment {
  departure_airport: string
  arrival_airport: string
  departure_time: string
  arrival_time: string
  airline: string
  flight_number: string
}

function findIataCodes(text: string): string[] {
  // Match 3-letter uppercase sequences (standalone words)
  const matches = text.match(/\b([A-Z]{3})\b/g) ?? []
  return [...new Set(matches.filter(m => AIRPORT_IATA_SET.has(m) && !IGNORE_WORDS.has(m)))]
}

function findFlightNumbers(text: string): { code: string; number: string; airline: string }[] {
  // Match patterns like EK392, EK 392, EK-392
  const regex = /\b([A-Z]{2})\s?[-]?\s?(\d{1,4})\b/g
  const results: { code: string; number: string; airline: string }[] = []
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    const code = m[1]
    const number = m[2]
    const airline = AIRLINES.find(a => a.iata === code)
    if (airline) {
      results.push({ code, number, airline: airline.name })
    }
  }
  return results
}

function parseDateTime(dateStr: string, timeStr: string): string {
  // Try to combine date and time into an ISO datetime-local string (YYYY-MM-DDTHH:MM)
  try {
    const combined = `${dateStr} ${timeStr}`
    const d = new Date(combined)
    if (!isNaN(d.getTime())) {
      const pad = (n: number) => n.toString().padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    }
  } catch {}
  return ''
}

function extractTimes(text: string): string[] {
  // Match HH:MM or H:MM (with optional AM/PM)
  const regex = /\b(\d{1,2}:\d{2}(?:\s?[AaPp][Mm])?)\b/g
  const results: string[] = []
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) results.push(m[1])
  return results
}

function extractDates(text: string): string[] {
  const patterns = [
    // "15 Apr 2026", "15 April 2026"
    /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})\b/gi,
    // "Apr 15, 2026", "April 15, 2026"
    /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/gi,
    // "2026-04-15"
    /\b(\d{4}-\d{2}-\d{2})\b/g,
    // "15/04/2026" or "04/15/2026"
    /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/g,
  ]
  const results: string[] = []
  for (const p of patterns) {
    let m: RegExpExecArray | null
    while ((m = p.exec(text)) !== null) results.push(m[1])
  }
  return results
}

function normalizeTo24h(time: string): string {
  // Convert "2:30 PM" → "14:30", "14:30" → "14:30"
  const pm = /pm/i.test(time)
  const am = /am/i.test(time)
  const cleaned = time.replace(/\s?[AaPp][Mm]/, '').trim()
  const [h, m] = cleaned.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return cleaned
  let hour = h
  if (pm && hour < 12) hour += 12
  if (am && hour === 12) hour = 0
  return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export function parseItinerary(raw: string): ParsedSegment[] {
  // Normalize: uppercase for code scanning, preserve original for date parsing
  const upper = raw.toUpperCase()
  const iatas = findIataCodes(upper)
  const flights = findFlightNumbers(upper)
  const times = extractTimes(raw).map(normalizeTo24h)
  const dates = extractDates(raw)

  const segments: ParsedSegment[] = []

  if (flights.length > 0) {
    // Build one segment per detected flight number
    flights.forEach((fl, i) => {
      const dep = iatas[i * 2] ?? ''
      const arr = iatas[i * 2 + 1] ?? ''

      // Try to find departure/arrival times near this flight
      const depTime = times[i * 2] ?? times[0] ?? ''
      const arrTime = times[i * 2 + 1] ?? times[1] ?? ''
      const date = dates[i] ?? dates[0] ?? ''

      const depDt = date && depTime ? parseDateTime(date, depTime) : ''
      const arrDt = date && arrTime ? parseDateTime(date, arrTime) : ''

      segments.push({
        departure_airport: dep,
        arrival_airport: arr,
        departure_time: depDt,
        arrival_time: arrDt,
        airline: fl.airline,
        flight_number: `${fl.code}${fl.number}`,
      })
    })
  } else if (iatas.length >= 2) {
    // No flight numbers found — build segments from consecutive IATA pairs
    for (let i = 0; i + 1 < iatas.length; i += 2) {
      const depTime = times[i] ?? ''
      const arrTime = times[i + 1] ?? ''
      const date = dates[0] ?? ''
      segments.push({
        departure_airport: iatas[i],
        arrival_airport: iatas[i + 1],
        departure_time: date && depTime ? parseDateTime(date, depTime) : '',
        arrival_time: date && arrTime ? parseDateTime(date, arrTime) : '',
        airline: '',
        flight_number: '',
      })
    }
  }

  return segments
}
