import React from 'react';
import { ShareableCardProps } from './SummaryCard';

// ─── City lookup ───────────────────────────────────────────────────────────────
interface CityInfo {
  iata: string;
  code: string;   // short display code shown in DEST. field
  country: string;
  line1: string;  // first line of big city name
  line2: string;  // second line of big city name
}

const CITY_DATA: Record<string, CityInfo> = {
  'chicago':        { iata: 'ORD', code: 'CHI', country: 'U.S.A.',      line1: 'CHICAGO', line2: '[ORD]'      },
  'new york':       { iata: 'JFK', code: 'NYC', country: 'U.S.A.',      line1: 'NEW',     line2: 'YORK'      },
  'new york city':  { iata: 'JFK', code: 'NYC', country: 'U.S.A.',      line1: 'NEW',     line2: 'YORK'      },
  'los angeles':    { iata: 'LAX', code: 'LAX', country: 'U.S.A.',      line1: 'LOS',     line2: 'ANGELES'   },
  'san francisco':  { iata: 'SFO', code: 'SFO', country: 'U.S.A.',      line1: 'SAN',     line2: 'FRANCISCO' },
  'miami':          { iata: 'MIA', code: 'MIA', country: 'U.S.A.',      line1: 'MIAMI',   line2: '[MIA]'     },
  'london':         { iata: 'LHR', code: 'LHR', country: 'U.K.',        line1: 'LONDON',    line2: 'DON'       },
  'paris':          { iata: 'CDG', code: 'CDG', country: 'FRANCE',      line1: 'PA-',     line2: 'RIS'       },
  'tokyo':          { iata: 'TYO', code: 'TYO', country: 'JAPAN',       line1: 'TO-',     line2: 'KYO'       },
  'milan':          { iata: 'MXP', code: 'MXP', country: 'ITALY',       line1: 'MI-',     line2: 'LAN'       },
  'sydney':         { iata: 'SYD', code: 'SYD', country: 'AUSTRALIA',   line1: 'SYD-',    line2: 'NEY'       },
  'berlin':         { iata: 'BER', code: 'BER', country: 'GERMANY',     line1: 'BER-',    line2: 'LIN'       },
  'seoul':          { iata: 'ICN', code: 'ICN', country: 'KOREA',       line1: 'SE-',     line2: 'OUL'       },
  'toronto':        { iata: 'YYZ', code: 'YYZ', country: 'CANADA',      line1: 'TO-',     line2: 'RONTO'     },
  'austin':         { iata: 'AUS', code: 'AUS', country: 'U.S.A.',      line1: 'AUS-',    line2: 'TIN'       },
  'nashville':      { iata: 'BNA', code: 'BNA', country: 'U.S.A.',      line1: 'NASH-',   line2: 'VILLE'     },
  'portland':       { iata: 'PDX', code: 'PDX', country: 'U.S.A.',      line1: 'PORT-',   line2: 'LAND'      },
  'seattle':        { iata: 'SEA', code: 'SEA', country: 'U.S.A.',      line1: 'SEA-',    line2: 'TTLE'      },
  'boston':         { iata: 'BOS', code: 'BOS', country: 'U.S.A.',      line1: 'BOS-',    line2: 'TON'       },
  'denver':         { iata: 'DEN', code: 'DEN', country: 'U.S.A.',      line1: 'DEN-',    line2: 'VER'       },
  'atlanta':        { iata: 'ATL', code: 'ATL', country: 'U.S.A.',      line1: 'ATLAN-',  line2: 'TA'        },
  'amsterdam':      { iata: 'AMS', code: 'AMS', country: 'NETHERLANDS', line1: 'AMSTER-', line2: 'DAM'       },
  'barcelona':      { iata: 'BCN', code: 'BCN', country: 'SPAIN',       line1: 'BARCE-',  line2: 'LONA'      },
  'dubai':          { iata: 'DXB', code: 'DXB', country: 'U.A.E.',      line1: 'DU-',     line2: 'BAI'       },
  'singapore':      { iata: 'SIN', code: 'SIN', country: 'SINGAPORE',   line1: 'SINGA-',  line2: 'PORE'      },
  'mexico city':    { iata: 'MEX', code: 'MEX', country: 'MEXICO',      line1: 'MEXICO',  line2: 'CITY'      },
  'hong kong':      { iata: 'HKG', code: 'HKG', country: 'S.A.R. CHINA',       line1: 'HONG',    line2: 'KONG'      },
  'new orleans':    { iata: 'MSY', code: 'MSY', country: 'U.S.A.',      line1: 'NEW',     line2: 'ORLEANS'   },
  'dallas':         { iata: 'DFW', code: 'DFW', country: 'U.S.A.',      line1: 'DAL-',    line2: 'LAS'       },
  'houston':        { iata: 'IAH', code: 'IAH', country: 'U.S.A.',      line1: 'HOUS-',   line2: 'TON'       },
  'phoenix':        { iata: 'PHX', code: 'PHX', country: 'U.S.A.',      line1: 'PHOE-',   line2: 'NIX'       },
  'washington':     { iata: 'DCA', code: 'DCA', country: 'U.S.A.',      line1: 'WASHINGTON',   line2: 'D.C.'    },
  'minneapolis':    { iata: 'MSP', code: 'MSP', country: 'U.S.A.',      line1: 'MINNE-',  line2: 'APOLIS'    },
  'detroit':        { iata: 'DTW', code: 'DTW', country: 'U.S.A.',      line1: 'DE-',     line2: 'TROIT'     },
  'philadelphia':   { iata: 'PHL', code: 'PHL', country: 'U.S.A.',      line1: 'PHILA-',  line2: 'DELPHIA'   },
  'charlotte':      { iata: 'CLT', code: 'CLT', country: 'U.S.A.',      line1: 'CHAR-',   line2: 'LOTTE'     },
  'vancouver':      { iata: 'YVR', code: 'YVR', country: 'CANADA',      line1: 'VAN-',    line2: 'COUVER'    },
  'montreal':       { iata: 'YUL', code: 'YUL', country: 'CANADA',      line1: 'MON-',    line2: 'TREAL'     },
  'madrid':         { iata: 'MAD', code: 'MAD', country: 'SPAIN',       line1: 'MA-',     line2: 'DRID'      },
  'rome':           { iata: 'FCO', code: 'FCO', country: 'ITALY',       line1: 'RO-',     line2: 'ME'        },
  'lisbon':         { iata: 'LIS', code: 'LIS', country: 'PORTUGAL',    line1: 'LIS-',    line2: 'BON'       },
  'stockholm':      { iata: 'ARN', code: 'ARN', country: 'SWEDEN',      line1: 'STOCK-',  line2: 'HOLM'      },
  'copenhagen':     { iata: 'CPH', code: 'CPH', country: 'DENMARK',     line1: 'COPEN-',  line2: 'HAGEN'     },
  'oslo':           { iata: 'OSL', code: 'OSL', country: 'NORWAY',      line1: 'OS-',     line2: 'LO'        },
  'helsinki':       { iata: 'HEL', code: 'HEL', country: 'FINLAND',     line1: 'HEL-',    line2: 'SINKI'     },
  'vienna':         { iata: 'VIE', code: 'VIE', country: 'AUSTRIA',     line1: 'VI-',     line2: 'ENNA'      },
  'zurich':         { iata: 'ZRH', code: 'ZRH', country: 'SWITZERLAND', line1: 'ZU-',     line2: 'RICH'      },
  'geneva':         { iata: 'GVA', code: 'GVA', country: 'SWITZERLAND', line1: 'GE-',     line2: 'NEVA'      },
  'brussels':       { iata: 'BRU', code: 'BRU', country: 'BELGIUM',     line1: 'BRUS-',   line2: 'SELS'      },
  'dublin':         { iata: 'DUB', code: 'DUB', country: 'IRELAND',     line1: 'DUB-',    line2: 'LIN'       },
  'edinburgh':      { iata: 'EDI', code: 'EDI', country: 'SCOTLAND',    line1: 'EDIN-',   line2: 'BURGH'     },
  'manchester':     { iata: 'MAN', code: 'MAN', country: 'U.K.',        line1: 'MAN-',    line2: 'CHESTER'   },
  'birmingham':     { iata: 'BHX', code: 'BHX', country: 'U.K.',        line1: 'BIR-',    line2: 'MINGHAM'   },
  'glasgow':        { iata: 'GLA', code: 'GLA', country: 'SCOTLAND',    line1: 'GLAS-',   line2: 'GOW'       },
  'shanghai':       { iata: 'PVG', code: 'PVG', country: 'CHINA',       line1: 'SHANG-',  line2: 'HAI'       },
  'beijing':        { iata: 'PEK', code: 'PEK', country: 'CHINA',       line1: 'BEI-',    line2: 'JING'      },
  'guangzhou':      { iata: 'CAN', code: 'CAN', country: 'CHINA',       line1: 'GUANG-',  line2: 'ZHOU'      },
  'shenzhen':       { iata: 'SZX', code: 'SZX', country: 'CHINA',       line1: 'SHEN-',   line2: 'ZHEN'      },
  'bangkok':        { iata: 'BKK', code: 'BKK', country: 'THAILAND',    line1: 'BANG-',   line2: 'KOK'       },
  'singapore city': { iata: 'SIN', code: 'SIN', country: 'SINGAPORE',   line1: 'SINGA-',  line2: 'PORE'      },
  'kuala lumpur':   { iata: 'KUL', code: 'KUL', country: 'MALAYSIA',    line1: 'KUALA',   line2: 'LUMPUR'    },
  'jakarta':        { iata: 'CGK', code: 'CGK', country: 'INDONESIA',   line1: 'JA-',     line2: 'KARTA'     },
  'manila':         { iata: 'MNL', code: 'MNL', country: 'PHILIPPINES', line1: 'MA-',     line2: 'NILA'      },
  'ho chi minh':    { iata: 'SGN', code: 'SGN', country: 'VIETNAM',     line1: 'HO CHI',  line2: 'MINH'      },
  'hanoi':          { iata: 'HAN', code: 'HAN', country: 'VIETNAM',     line1: 'HA-',     line2: 'NOI'       },
  'mumbai':         { iata: 'BOM', code: 'BOM', country: 'INDIA',       line1: 'MUM-',    line2: 'BAI'       },
  'delhi':          { iata: 'DEL', code: 'DEL', country: 'INDIA',       line1: 'DEL-',    line2: 'HI'        },
  'bangalore':      { iata: 'BLR', code: 'BLR', country: 'INDIA',       line1: 'BANGA-',  line2: 'LORE'      },
  'chennai':        { iata: 'MAA', code: 'MAA', country: 'INDIA',       line1: 'CHEN-',   line2: 'NAI'       },
  'hyderabad':      { iata: 'HYD', code: 'HYD', country: 'INDIA',       line1: 'HYDER-',  line2: 'ABAD'      },
  'kolkata':        { iata: 'CCU', code: 'CCU', country: 'INDIA',       line1: 'KOL-',    line2: 'KATA'      },
  'istanbul':       { iata: 'IST', code: 'IST', country: 'TURKEY',      line1: 'ISTAN-',  line2: 'BUL'       },
  'tel aviv':       { iata: 'TLV', code: 'TLV', country: 'ISRAEL',      line1: 'TEL',     line2: 'AVIV'      },
  'riyadh':         { iata: 'RUH', code: 'RUH', country: 'SAUDI ARABIA',line1: 'RI-',     line2: 'YADH'      },
  'jeddah':         { iata: 'JED', code: 'JED', country: 'SAUDI ARABIA',line1: 'JED-',    line2: 'DAH'       },
  'abu dhabi':      { iata: 'AUH', code: 'AUH', country: 'U.A.E.',      line1: 'ABU',     line2: 'DHABI'     },
  'doha':           { iata: 'DOH', code: 'DOH', country: 'QATAR',       line1: 'DO-',     line2: 'HA'        },
  'kuwait city':    { iata: 'KWI', code: 'KWI', country: 'KUWAIT',      line1: 'KUWAIT',  line2: 'CITY'      },
  'muscat':         { iata: 'MCT', code: 'MCT', country: 'OMAN',        line1: 'MUS-',    line2: 'CAT'       },
  'cairo':          { iata: 'CAI', code: 'CAI', country: 'EGYPT',       line1: 'CAI-',    line2: 'RO'        },
  'johannesburg':   { iata: 'JNB', code: 'JNB', country: 'SOUTH AFRICA',line1: 'JOHAN-',  line2: 'NESBURG'   },
  'cape town':      { iata: 'CPT', code: 'CPT', country: 'SOUTH AFRICA',line1: 'CAPE',    line2: 'TOWN'      },
  'lagos':          { iata: 'LOS', code: 'LOS', country: 'NIGERIA',     line1: 'LA-',     line2: 'GOS'       },
  'nairobi':        { iata: 'NBO', code: 'NBO', country: 'KENYA',       line1: 'NAI-',    line2: 'ROBI'      },
  'casablanca':     { iata: 'CMN', code: 'CMN', country: 'MOROCCO',     line1: 'CASA-',   line2: 'BLANCA'    },
  'sao paulo':      { iata: 'GRU', code: 'GRU', country: 'BRAZIL',      line1: 'SAO',     line2: 'PAULO'     },
  'rio de janeiro': { iata: 'GIG', code: 'GIG', country: 'BRAZIL',      line1: 'RIO DE',  line2: 'JANEIRO'   },
  'buenos aires':   { iata: 'EZE', code: 'EZE', country: 'ARGENTINA',   line1: 'BUENOS',  line2: 'AIRES'     },
  'santiago':       { iata: 'SCL', code: 'SCL', country: 'CHILE',       line1: 'SAN-',    line2: 'TIAGO'     },
  'lima':           { iata: 'LIM', code: 'LIM', country: 'PERU',        line1: 'LI-',     line2: 'MA'        },
  'bogota':         { iata: 'BOG', code: 'BOG', country: 'COLOMBIA',    line1: 'BOGO-',   line2: 'TA'        },
  'melbourne':      { iata: 'MEL', code: 'MEL', country: 'AUSTRALIA',   line1: 'MEL-',    line2: 'BOURNE'    },
  'brisbane':       { iata: 'BNE', code: 'BNE', country: 'AUSTRALIA',   line1: 'BRIS-',   line2: 'BANE'      },
  'perth':          { iata: 'PER', code: 'PER', country: 'AUSTRALIA',   line1: 'PER-',    line2: 'TH'        },
  'auckland':       { iata: 'AKL', code: 'AKL', country: 'NEW ZEALAND', line1: 'AUCK-',   line2: 'LAND'      },
  'wellington':     { iata: 'WLG', code: 'WLG', country: 'NEW ZEALAND', line1: 'WELLING-',line2: 'TON'       },
};

function getCityInfo(cityVibe: string): CityInfo {
  const key = cityVibe.toLowerCase().trim();
  let info: CityInfo;

  if (CITY_DATA[key]) {
    info = { ...CITY_DATA[key] };
  } else {
    // Fallback: derive from name
    const upper = cityVibe.toUpperCase().trim();
    const words = upper.split(/\s+/);
    const iata = upper.replace(/\s+/g, '').slice(0, 3);
    const code = upper.replace(/\s+/g, '').slice(0, 3);

    if (words.length >= 2) {
      info = { iata, code, country: '—', line1: words[0], line2: words.slice(1).join(' ') };
    } else {
      const mid = Math.ceil(upper.length / 2);
      info = { iata, code, country: '—', line1: upper.slice(0, mid) + '-', line2: upper.slice(mid) };
    }
  }

  // If it's not a multi-word city (like NEW YORK), use just the name.
  const isMultiWord = cityVibe.trim().split(/\s+/).length > 1;
  if (!isMultiWord) {
    info.line1 = cityVibe.toUpperCase().trim();
    info.line2 = '';
  }

  return info;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSeason(date: Date): string {
  // const m = date.getMonth() + 1;
  // const y = String(date.getFullYear()).slice(-2);
  // if (m >= 9 && m <= 11) return `FW${y}`;
  // if (m === 12 || m <= 2) return `WI${y}`;
  // if (m >= 3 && m <= 5) return `SS${y}`;
  // return `SU${y}`;
  return "SS26"
}

function getOriginCode(city: string | null): string {
  if (!city) return 'UNK';
  return city.split(/[\s,]+/)[0].toUpperCase().slice(0, 3);
}

function getOriginDisplay(city: string | null): string {
  if (!city) return 'UNKNOWN';
  const upper = city.toUpperCase().trim();
  return upper.length > 10 ? upper.slice(0, 10) : upper;
}

function getDestDisplay(cityInfo: CityInfo, cityVibe: string): string {
  const upper = cityVibe.toUpperCase().trim();
  return upper.length > 10 ? upper.slice(0, 10) : upper;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INK = '#1a1a1a';
const TAG_BG = '#e8e4c8';

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`;

const BEBAS = `var(--font-bebas-neue), "Bebas Neue", sans-serif`;
const MONO  = `var(--font-jetbrains-mono), "IBM Plex Mono", monospace`;

// ─── Component ────────────────────────────────────────────────────────────────

export const StyleDestinationCard = ({ results }: ShareableCardProps) => {
  const displayDate = results.completedAt ? new Date(results.completedAt) : new Date();
  const season = getSeason(displayDate);

  const mm   = String(displayDate.getMonth() + 1).padStart(2, '0');
  const dd   = String(displayDate.getDate()).padStart(2, '0');
  const hh   = String(displayDate.getHours()).padStart(2, '0');
  const min  = String(displayDate.getMinutes()).padStart(2, '0');

  const city       = getCityInfo(results.city_vibe);
  const originDisp = getOriginDisplay(results.userCity);
  const originCode = getOriginCode(results.userCity);
  const destDisp   = getDestDisplay(city, results.city_vibe);
  const flightNum  = `LB${String(displayDate.getFullYear()).slice(-2)}${String(results.total_clothing_items).padStart(2, '0')}`;
  const poNum      = `P/O_${String(results.total_outfits_analyzed).padStart(3, '0')}`;
  const styleLabel = results.primary_style.toUpperCase().slice(0, 9);
  const sysCode    = `${originCode}${city.code}·${displayDate.getFullYear()}`;

  const fields = [
    { label: 'DEPART.',    value: `${mm}/${dd}`   },
    { label: 'TIME',   value: `${hh}:${min}`  },
    { label: 'FLIGHT #',   value: flightNum        },
    { label: 'ORIGIN',     value: originDisp       },
    { label: 'DEST.',      value: destDisp         },
    { label: 'MATCH SCORE', value: `${results.city_vibe_similarity_score.toFixed(1)}%`},
    { label: 'CABIN',      value: "FIRST"       },
    { label: 'PICS',      value: `${results.total_outfits_analyzed} PHOTOS` },
    { label: 'CAPSULE',       value: `${results.total_clothing_items} PIECES` },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">

      {/* ── City photo background ── */}
      {results.city_photo_url ? (
        <img
          src={results.city_photo_url}
          alt={results.city_vibe}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #4a5568 0%, #1a202c 100%)' }} />
      )}
      {/* Scrim so the tag reads cleanly */}
      <div className="absolute inset-0 bg-black/30" />

      {/* ── String: from card top down to grommet ── */}
      <div style={{
        position: 'absolute', top: 'calc(50% - 240px)', left: '50%',
        transform: 'translateX(-50%) translateY(-100%)',
        width: 3, height: 70,
        background: `linear-gradient(to bottom, rgba(26,26,26,0.3), ${INK})`,
        borderRadius: 2, zIndex: 10,
      }} />

      {/* ── Notch: cream semicircle cut into the top of the tag ── */}
      <div style={{
        position: 'absolute', top: 'calc(50% - 240px)', left: '50%',
        transform: 'translateX(-50%)',
        width: 52, height: 32,
        backgroundColor: TAG_BG,
        borderRadius: '0 0 50% 50%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.25), inset 0 -1px 2px rgba(0,0,0,0.1)',
        zIndex: 11,
      }} />

      {/* ── Grommet: sits in the notch, centered on the tag's top edge ── */}
      <div style={{
        position: 'absolute', top: 'calc(50% - 250px)', left: '50%',
        transform: 'translateX(-50%)',
        width: 32, height: 32, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #555, #1a1a1a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.1)',
        zIndex: 12,
      }}>
        <div style={{
          width: 14, height: 14, borderRadius: '50%',
          background: '#0a0a0a',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.9)',
        }} />
      </div>

      {/* ── Floating tag ── */}
      <div
        className="absolute flex flex-col overflow-hidden animate-tag-drop left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 304,
          height: 480,
          backgroundColor: TAG_BG,
          fontFamily: MONO,
          backgroundImage: GRAIN,
          borderRadius: 16,
          boxShadow: '0 16px 48px rgba(0,0,0,0.55), 0 4px 14px rgba(0,0,0,0.35)',
        }}
      >

      {/* ── Tag body ── */}
      <div className="flex-1 flex flex-col px-[22px] pt-[10px] pb-[20px] relative overflow-hidden">

        {/* Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-none"
          style={{ backgroundImage: GRAIN, opacity: 0.5 }}
        />

        {/* Brand line */}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: INK, lineHeight: 1.4 }}>
          LOOKBOOK AIRWAYS //
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: INK, lineHeight: 1.4 }}>
          {season} COLLECTION
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: 1, background: INK, margin: '7px 0' }} />

        {/* Icon row */}
        <div style={{
          border: `1px solid ${INK}`, borderBottom: 'none',
          display: 'flex', alignItems: 'center',
          padding: '5px 8px', gap: 7,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: INK, lineHeight: 1.4, width: '50%' }}>
          {results.userName.toUpperCase()}
          </div>
          <div style={{
            marginLeft: 'auto', textAlign: 'right',
            fontSize: 8, fontWeight: 700, letterSpacing: '0.06em', color: INK, lineHeight: 1.5,
          }}>
            BOARDING<br />PASS
          </div>
          <span style={{ fontSize: 28, lineHeight: 1 }}>✈</span>
        </div>

        {/* Fields grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: `1px solid ${INK}` }}>
          {fields.map((f, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            return (
              <div
                key={f.label}
                style={{
                  padding: '5px 6px',
                  borderRight:  col < 2            ? `1px solid ${INK}` : undefined,
                  borderBottom: row < 2            ? `1px solid ${INK}` : undefined,
                }}
              >
                <div style={{ fontSize: 6.5, fontWeight: 400, letterSpacing: '0.09em', color: INK, marginBottom: 2, lineHeight: 1 }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: INK, letterSpacing: '0.02em', lineHeight: 1.2 }}>
                  {f.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Destination block */}
        <div style={{
          margin: '9px 0 5px', border: `1px solid ${INK}`,
          padding: '7px 10px', position: 'relative',
          height: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center'
        }}>
          {/* Corner marks */}
          <div style={{ position: 'absolute', top: -1, left: -1, width: 40, height: 40, borderTop: `2.5px solid ${INK}`, borderLeft: `2.5px solid ${INK}` }} />
          <div style={{ position: 'absolute', bottom: -1, right: -1, width: 40, height: 40, borderBottom: `2.5px solid ${INK}`, borderRight: `2.5px solid ${INK}` }} />

          <div style={{ 
            fontFamily: BEBAS, 
            fontSize: 56, 
            lineHeight: city.line2 ? 0.9 : 1.1, 
            color: INK, 
            letterSpacing: '0.01em',
          }}>
            {city.line1}{city.line2 && <><br />{city.line2}</>}
          </div>
          <div style={{ fontFamily: BEBAS, fontSize: 30, lineHeight: 1, color: INK, letterSpacing: '0.01em', marginTop: city.line2 ? 3 : 0 }}>
            {city.country}
          </div>
        </div>

        {/* Bottom meta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '4px 0 7px' }}>
          <div style={{ fontSize: 7, letterSpacing: '0.05em', color: INK }}>
            LOOKBOOK SNAPSHOT ({season})
          </div>
          <div style={{ fontSize: 6, color: INK, textAlign: 'right', letterSpacing: '0.04em', lineHeight: 1.6 }}>
            STYLE DESTINATION<br />{results.city_vibe.toUpperCase()}
          </div>
        </div>

        {/* Thin divider */}
        <div style={{ width: '100%', height: 0.5, background: INK, marginBottom: 9 }} />

        {/* Barcode row */}
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          
          {/* 1. Barcode (Left Aligned) */}
          <div style={{ flex: '0 0 auto' }}>
            <img 
              src="/images/lb_barcode_only.png" 
              alt="Barcode"
              style={{ 
                width: '180px', // Fixed width for the barcode
                height: 40,      // Increased height
                display: 'block',
                mixBlendMode: 'darken',
                objectFit: 'fill'
              }} 
            />
          </div>
          {/* 2. Flexible Spacer (Pushes items apart) */}
          <div style={{ flex: 1 }} />

          {/* Logo badge */}
          <div style={{ width: 46, height: 46, flexShrink: 0 }}>
            <svg viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg" width="46" height="46">
              <polygon points="23,2 44,23 23,44 2,23" fill="none" stroke={INK} strokeWidth="1.5"/>
              {/* Logo centered inside the diamond */}
              <image 
                href="/LB-logo-dark.svg" 
                x="13" y="13" 
                width="20" height="20"
              />
            </svg>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 8,
          textAlign: 'center',
          fontSize: 7,
          letterSpacing: '0.08em',
          color: INK,
          opacity: 0.4,
          fontWeight: 700,
        }}>
          LOOKBOOK.INC/SNAPSHOT
        </div>
      </div>

      </div>{/* end floating tag */}
    </div>
  );
};
