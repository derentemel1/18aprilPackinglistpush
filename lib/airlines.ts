export interface Airline {
  iata: string
  name: string
  country: string
}

export const AIRLINES: Airline[] = [
  // Vietnam
  { iata: 'VN', name: 'Vietnam Airlines', country: 'VN' },
  { iata: 'VJ', name: 'VietJet Air', country: 'VN' },
  { iata: 'BL', name: 'Jetstar Pacific', country: 'VN' },
  { iata: 'QH', name: 'Bamboo Airways', country: 'VN' },

  // Middle East
  { iata: 'EK', name: 'Emirates', country: 'AE' },
  { iata: 'EY', name: 'Etihad Airways', country: 'AE' },
  { iata: 'QR', name: 'Qatar Airways', country: 'QA' },
  { iata: 'GF', name: 'Gulf Air', country: 'BH' },
  { iata: 'SV', name: 'Saudi Arabian Airlines', country: 'SA' },
  { iata: 'KU', name: 'Kuwait Airways', country: 'KW' },
  { iata: 'WY', name: 'Oman Air', country: 'OM' },
  { iata: 'RJ', name: 'Royal Jordanian', country: 'JO' },
  { iata: 'ME', name: 'Middle East Airlines', country: 'LB' },
  { iata: 'FZ', name: 'flydubai', country: 'AE' },
  { iata: 'G9', name: 'Air Arabia', country: 'AE' },

  // US Carriers
  { iata: 'AA', name: 'American Airlines', country: 'US' },
  { iata: 'DL', name: 'Delta Air Lines', country: 'US' },
  { iata: 'UA', name: 'United Airlines', country: 'US' },
  { iata: 'WN', name: 'Southwest Airlines', country: 'US' },
  { iata: 'B6', name: 'JetBlue Airways', country: 'US' },
  { iata: 'AS', name: 'Alaska Airlines', country: 'US' },
  { iata: 'NK', name: 'Spirit Airlines', country: 'US' },
  { iata: 'F9', name: 'Frontier Airlines', country: 'US' },
  { iata: 'HA', name: 'Hawaiian Airlines', country: 'US' },
  { iata: 'G4', name: 'Allegiant Air', country: 'US' },

  // Canada
  { iata: 'AC', name: 'Air Canada', country: 'CA' },
  { iata: 'WS', name: 'WestJet', country: 'CA' },
  { iata: 'PD', name: 'Porter Airlines', country: 'CA' },

  // UK & Ireland
  { iata: 'BA', name: 'British Airways', country: 'GB' },
  { iata: 'VS', name: 'Virgin Atlantic', country: 'GB' },
  { iata: 'EZ', name: 'easyJet', country: 'GB' },
  { iata: 'U2', name: 'easyJet', country: 'GB' },
  { iata: 'EI', name: 'Aer Lingus', country: 'IE' },
  { iata: 'FR', name: 'Ryanair', country: 'IE' },
  { iata: 'BE', name: 'Flybe', country: 'GB' },
  { iata: 'TOM', name: 'TUI Airways', country: 'GB' },

  // Europe
  { iata: 'LH', name: 'Lufthansa', country: 'DE' },
  { iata: 'AF', name: 'Air France', country: 'FR' },
  { iata: 'KL', name: 'KLM Royal Dutch Airlines', country: 'NL' },
  { iata: 'IB', name: 'Iberia', country: 'ES' },
  { iata: 'VY', name: 'Vueling Airlines', country: 'ES' },
  { iata: 'AZ', name: 'ITA Airways', country: 'IT' },
  { iata: 'SK', name: 'Scandinavian Airlines', country: 'SE' },
  { iata: 'LX', name: 'Swiss International Air Lines', country: 'CH' },
  { iata: 'OS', name: 'Austrian Airlines', country: 'AT' },
  { iata: 'SN', name: 'Brussels Airlines', country: 'BE' },
  { iata: 'TP', name: 'TAP Air Portugal', country: 'PT' },
  { iata: 'A3', name: 'Aegean Airlines', country: 'GR' },
  { iata: 'LO', name: 'LOT Polish Airlines', country: 'PL' },
  { iata: 'OK', name: 'Czech Airlines', country: 'CZ' },
  { iata: 'MA', name: 'Malev Hungarian Airlines', country: 'HU' },
  { iata: 'TK', name: 'Turkish Airlines', country: 'TR' },
  { iata: 'PC', name: 'Pegasus Airlines', country: 'TR' },
  { iata: 'W6', name: 'Wizz Air', country: 'HU' },
  { iata: 'HV', name: 'Transavia', country: 'NL' },
  { iata: 'TO', name: 'Transavia France', country: 'FR' },
  { iata: 'BT', name: 'airBaltic', country: 'LV' },
  { iata: 'AY', name: 'Finnair', country: 'FI' },
  { iata: 'DY', name: 'Norwegian Air Shuttle', country: 'NO' },
  { iata: 'D8', name: 'Norwegian Air International', country: 'IE' },

  // East Asia
  { iata: 'JL', name: 'Japan Airlines', country: 'JP' },
  { iata: 'NH', name: 'All Nippon Airways', country: 'JP' },
  { iata: 'JW', name: 'Vanilla Air', country: 'JP' },
  { iata: 'MM', name: 'Peach Aviation', country: 'JP' },
  { iata: 'GK', name: 'Jetstar Japan', country: 'JP' },
  { iata: 'KE', name: 'Korean Air', country: 'KR' },
  { iata: 'OZ', name: 'Asiana Airlines', country: 'KR' },
  { iata: '7C', name: 'Jeju Air', country: 'KR' },
  { iata: 'LJ', name: 'Jin Air', country: 'KR' },
  { iata: 'CX', name: 'Cathay Pacific', country: 'HK' },
  { iata: 'KA', name: 'Cathay Dragon', country: 'HK' },
  { iata: 'HX', name: 'Hong Kong Airlines', country: 'HK' },
  { iata: 'NX', name: 'Air Macau', country: 'MO' },
  { iata: 'CA', name: 'Air China', country: 'CN' },
  { iata: 'MU', name: 'China Eastern Airlines', country: 'CN' },
  { iata: 'CZ', name: 'China Southern Airlines', country: 'CN' },
  { iata: 'HU', name: 'Hainan Airlines', country: 'CN' },
  { iata: 'ZH', name: 'Shenzhen Airlines', country: 'CN' },
  { iata: 'SC', name: 'Shandong Airlines', country: 'CN' },
  { iata: 'CI', name: 'China Airlines', country: 'TW' },
  { iata: 'BR', name: 'EVA Air', country: 'TW' },

  // Southeast Asia
  { iata: 'SQ', name: 'Singapore Airlines', country: 'SG' },
  { iata: 'TR', name: 'Scoot', country: 'SG' },
  { iata: '3K', name: 'Jetstar Asia', country: 'SG' },
  { iata: 'TG', name: 'Thai Airways', country: 'TH' },
  { iata: 'FD', name: 'Thai AirAsia', country: 'TH' },
  { iata: 'WE', name: 'Thai Smile Airways', country: 'TH' },
  { iata: 'PG', name: 'Bangkok Airways', country: 'TH' },
  { iata: 'MH', name: 'Malaysia Airlines', country: 'MY' },
  { iata: 'AK', name: 'AirAsia', country: 'MY' },
  { iata: 'D7', name: 'AirAsia X', country: 'MY' },
  { iata: 'MV', name: 'Air Maldives', country: 'MV' },
  { iata: 'GA', name: 'Garuda Indonesia', country: 'ID' },
  { iata: 'JT', name: 'Lion Air', country: 'ID' },
  { iata: 'QG', name: 'Citilink', country: 'ID' },
  { iata: 'IW', name: 'Wings Air', country: 'ID' },
  { iata: 'PR', name: 'Philippine Airlines', country: 'PH' },
  { iata: 'Z2', name: 'AirAsia Philippines', country: 'PH' },
  { iata: '5J', name: 'Cebu Pacific', country: 'PH' },
  { iata: 'MI', name: 'SilkAir', country: 'SG' },
  { iata: 'BI', name: 'Royal Brunei Airlines', country: 'BN' },
  { iata: 'KB', name: 'Druk Air', country: 'BT' },
  { iata: 'UB', name: 'Myanmar National Airlines', country: 'MM' },
  { iata: 'K7', name: 'Air KBZ', country: 'MM' },

  // South Asia
  { iata: 'AI', name: 'Air India', country: 'IN' },
  { iata: '6E', name: 'IndiGo', country: 'IN' },
  { iata: 'SG', name: 'SpiceJet', country: 'IN' },
  { iata: 'IX', name: 'Air India Express', country: 'IN' },
  { iata: 'UL', name: 'SriLankan Airlines', country: 'LK' },
  { iata: 'BG', name: 'Biman Bangladesh Airlines', country: 'BD' },
  { iata: 'RA', name: 'Nepal Airlines', country: 'NP' },

  // Australia & Pacific
  { iata: 'QF', name: 'Qantas', country: 'AU' },
  { iata: 'JQ', name: 'Jetstar Airways', country: 'AU' },
  { iata: 'VA', name: 'Virgin Australia', country: 'AU' },
  { iata: 'NZ', name: 'Air New Zealand', country: 'NZ' },
  { iata: 'FJ', name: 'Fiji Airways', country: 'FJ' },

  // Africa
  { iata: 'ET', name: 'Ethiopian Airlines', country: 'ET' },
  { iata: 'SA', name: 'South African Airways', country: 'ZA' },
  { iata: 'FA', name: 'Safair', country: 'ZA' },
  { iata: 'KQ', name: 'Kenya Airways', country: 'KE' },
  { iata: 'MS', name: 'EgyptAir', country: 'EG' },
  { iata: 'AT', name: 'Royal Air Maroc', country: 'MA' },
  { iata: 'TU', name: 'Tunisair', country: 'TN' },
  { iata: 'W3', name: 'Arik Air', country: 'NG' },
  { iata: 'QC', name: 'Camair-Co', country: 'CM' },

  // Latin America
  { iata: 'LA', name: 'LATAM Airlines', country: 'CL' },
  { iata: 'JJ', name: 'LATAM Brasil', country: 'BR' },
  { iata: 'G3', name: 'Gol Transportes Aéreos', country: 'BR' },
  { iata: 'AD', name: 'Azul Brazilian Airlines', country: 'BR' },
  { iata: 'AR', name: 'Aerolíneas Argentinas', country: 'AR' },
  { iata: 'AV', name: 'Avianca', country: 'CO' },
  { iata: 'CM', name: 'Copa Airlines', country: 'PA' },
  { iata: 'AM', name: 'Aeromexico', country: 'MX' },
  { iata: 'Y4', name: 'Volaris', country: 'MX' },
  { iata: 'VB', name: 'VivaAerobus', country: 'MX' },

  // Russia & Central Asia
  { iata: 'SU', name: 'Aeroflot', country: 'RU' },
  { iata: 'S7', name: 'S7 Airlines', country: 'RU' },
  { iata: 'U6', name: 'Ural Airlines', country: 'RU' },
  { iata: 'KC', name: 'Air Astana', country: 'KZ' },
  { iata: 'HY', name: 'Uzbekistan Airways', country: 'UZ' },
]

export function searchAirlines(query: string, limit = 8): Airline[] {
  const q = query.trim().toUpperCase()
  if (!q) return []
  // Exact IATA code match first, then name matches
  const exact = AIRLINES.filter(a => a.iata.toUpperCase() === q)
  const starts = AIRLINES.filter(a => a.iata.toUpperCase().startsWith(q) && a.iata.toUpperCase() !== q)
  const nameMatch = AIRLINES.filter(a =>
    a.name.toUpperCase().includes(q) &&
    !exact.includes(a) &&
    !starts.includes(a)
  )
  return [...exact, ...starts, ...nameMatch].slice(0, limit)
}
