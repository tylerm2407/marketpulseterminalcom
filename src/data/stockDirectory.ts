/**
 * Comprehensive directory of NASDAQ and NYSE listed stocks for instant local search.
 * This enables search to work without API calls — the FMP API enriches results when available.
 */

export interface StockEntry {
  t: string; // ticker
  n: string; // name
  e: string; // exchange
  s?: string; // sector (optional, for popular stocks)
}

// ~500 most commonly searched NASDAQ and NYSE stocks
export const stockDirectory: StockEntry[] = [
  // Mega-cap Tech
  { t: 'AAPL', n: 'Apple Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'MSFT', n: 'Microsoft Corporation', e: 'NASDAQ', s: 'Technology' },
  { t: 'NVDA', n: 'NVIDIA Corporation', e: 'NASDAQ', s: 'Technology' },
  { t: 'GOOGL', n: 'Alphabet Inc. Class A', e: 'NASDAQ', s: 'Technology' },
  { t: 'GOOG', n: 'Alphabet Inc. Class C', e: 'NASDAQ', s: 'Technology' },
  { t: 'AMZN', n: 'Amazon.com Inc.', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'META', n: 'Meta Platforms Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'TSLA', n: 'Tesla Inc.', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'TSM', n: 'Taiwan Semiconductor Manufacturing', e: 'NYSE', s: 'Technology' },
  { t: 'AVGO', n: 'Broadcom Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'ORCL', n: 'Oracle Corporation', e: 'NYSE', s: 'Technology' },
  { t: 'CRM', n: 'Salesforce Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'ADBE', n: 'Adobe Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'AMD', n: 'Advanced Micro Devices Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'INTC', n: 'Intel Corporation', e: 'NASDAQ', s: 'Technology' },
  { t: 'CSCO', n: 'Cisco Systems Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'QCOM', n: 'Qualcomm Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'TXN', n: 'Texas Instruments Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'INTU', n: 'Intuit Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'IBM', n: 'International Business Machines', e: 'NYSE', s: 'Technology' },
  { t: 'NOW', n: 'ServiceNow Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'AMAT', n: 'Applied Materials Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'LRCX', n: 'Lam Research Corporation', e: 'NASDAQ', s: 'Technology' },
  { t: 'MU', n: 'Micron Technology Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'SNPS', n: 'Synopsys Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'CDNS', n: 'Cadence Design Systems', e: 'NASDAQ', s: 'Technology' },
  { t: 'KLAC', n: 'KLA Corporation', e: 'NASDAQ', s: 'Technology' },
  { t: 'PANW', n: 'Palo Alto Networks Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'CRWD', n: 'CrowdStrike Holdings Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'NFLX', n: 'Netflix Inc.', e: 'NASDAQ', s: 'Communication Services' },
  { t: 'SNOW', n: 'Snowflake Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'PLTR', n: 'Palantir Technologies Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'NET', n: 'Cloudflare Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'SHOP', n: 'Shopify Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'SQ', n: 'Block Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'MRVL', n: 'Marvell Technology Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'UBER', n: 'Uber Technologies Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'ABNB', n: 'Airbnb Inc.', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'COIN', n: 'Coinbase Global Inc.', e: 'NASDAQ', s: 'Financial Services' },
  { t: 'DDOG', n: 'Datadog Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'ZS', n: 'Zscaler Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'TEAM', n: 'Atlassian Corporation', e: 'NASDAQ', s: 'Technology' },
  { t: 'WDAY', n: 'Workday Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'FTNT', n: 'Fortinet Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'HPE', n: 'Hewlett Packard Enterprise', e: 'NYSE', s: 'Technology' },
  { t: 'HPQ', n: 'HP Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'DELL', n: 'Dell Technologies Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'ARM', n: 'Arm Holdings plc', e: 'NASDAQ', s: 'Technology' },
  { t: 'SMCI', n: 'Super Micro Computer Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'MSTR', n: 'MicroStrategy Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'ROKU', n: 'Roku Inc.', e: 'NASDAQ', s: 'Communication Services' },
  { t: 'TWLO', n: 'Twilio Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'OKTA', n: 'Okta Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'MDB', n: 'MongoDB Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'TTD', n: 'The Trade Desk Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'RBLX', n: 'Roblox Corporation', e: 'NYSE', s: 'Technology' },
  { t: 'DASH', n: 'DoorDash Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'PINS', n: 'Pinterest Inc.', e: 'NYSE', s: 'Communication Services' },
  { t: 'SNAP', n: 'Snap Inc.', e: 'NYSE', s: 'Communication Services' },
  { t: 'SPOT', n: 'Spotify Technology', e: 'NYSE', s: 'Communication Services' },
  { t: 'U', n: 'Unity Software Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'PATH', n: 'UiPath Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'SOFI', n: 'SoFi Technologies Inc.', e: 'NASDAQ', s: 'Financial Services' },
  { t: 'HOOD', n: 'Robinhood Markets Inc.', e: 'NASDAQ', s: 'Financial Services' },
  { t: 'AFRM', n: 'Affirm Holdings Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'IONQ', n: 'IonQ Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'RIVN', n: 'Rivian Automotive Inc.', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'LCID', n: 'Lucid Group Inc.', e: 'NASDAQ', s: 'Consumer Cyclical' },

  // Finance
  { t: 'BRK-B', n: 'Berkshire Hathaway Inc. Class B', e: 'NYSE', s: 'Financial Services' },
  { t: 'BRK-A', n: 'Berkshire Hathaway Inc. Class A', e: 'NYSE', s: 'Financial Services' },
  { t: 'JPM', n: 'JPMorgan Chase & Co.', e: 'NYSE', s: 'Financial Services' },
  { t: 'V', n: 'Visa Inc.', e: 'NYSE', s: 'Financial Services' },
  { t: 'MA', n: 'Mastercard Inc.', e: 'NYSE', s: 'Financial Services' },
  { t: 'BAC', n: 'Bank of America Corporation', e: 'NYSE', s: 'Financial Services' },
  { t: 'WFC', n: 'Wells Fargo & Company', e: 'NYSE', s: 'Financial Services' },
  { t: 'GS', n: 'Goldman Sachs Group Inc.', e: 'NYSE', s: 'Financial Services' },
  { t: 'MS', n: 'Morgan Stanley', e: 'NYSE', s: 'Financial Services' },
  { t: 'C', n: 'Citigroup Inc.', e: 'NYSE', s: 'Financial Services' },
  { t: 'SCHW', n: 'Charles Schwab Corporation', e: 'NYSE', s: 'Financial Services' },
  { t: 'AXP', n: 'American Express Company', e: 'NYSE', s: 'Financial Services' },
  { t: 'BLK', n: 'BlackRock Inc.', e: 'NYSE', s: 'Financial Services' },
  { t: 'USB', n: 'U.S. Bancorp', e: 'NYSE', s: 'Financial Services' },
  { t: 'PNC', n: 'PNC Financial Services Group', e: 'NYSE', s: 'Financial Services' },
  { t: 'TFC', n: 'Truist Financial Corporation', e: 'NYSE', s: 'Financial Services' },
  { t: 'COF', n: 'Capital One Financial Corp.', e: 'NYSE', s: 'Financial Services' },
  { t: 'ICE', n: 'Intercontinental Exchange Inc.', e: 'NYSE', s: 'Financial Services' },
  { t: 'CME', n: 'CME Group Inc.', e: 'NASDAQ', s: 'Financial Services' },
  { t: 'MCO', n: 'Moody\'s Corporation', e: 'NYSE', s: 'Financial Services' },
  { t: 'SPGI', n: 'S&P Global Inc.', e: 'NYSE', s: 'Financial Services' },
  { t: 'MMC', n: 'Marsh & McLennan Companies', e: 'NYSE', s: 'Financial Services' },
  { t: 'AON', n: 'Aon plc', e: 'NYSE', s: 'Financial Services' },
  { t: 'PYPL', n: 'PayPal Holdings Inc.', e: 'NASDAQ', s: 'Financial Services' },

  // Healthcare
  { t: 'LLY', n: 'Eli Lilly and Company', e: 'NYSE', s: 'Healthcare' },
  { t: 'UNH', n: 'UnitedHealth Group Inc.', e: 'NYSE', s: 'Healthcare' },
  { t: 'JNJ', n: 'Johnson & Johnson', e: 'NYSE', s: 'Healthcare' },
  { t: 'ABBV', n: 'AbbVie Inc.', e: 'NYSE', s: 'Healthcare' },
  { t: 'MRK', n: 'Merck & Co. Inc.', e: 'NYSE', s: 'Healthcare' },
  { t: 'PFE', n: 'Pfizer Inc.', e: 'NYSE', s: 'Healthcare' },
  { t: 'TMO', n: 'Thermo Fisher Scientific', e: 'NYSE', s: 'Healthcare' },
  { t: 'ABT', n: 'Abbott Laboratories', e: 'NYSE', s: 'Healthcare' },
  { t: 'DHR', n: 'Danaher Corporation', e: 'NYSE', s: 'Healthcare' },
  { t: 'BMY', n: 'Bristol-Myers Squibb Company', e: 'NYSE', s: 'Healthcare' },
  { t: 'AMGN', n: 'Amgen Inc.', e: 'NASDAQ', s: 'Healthcare' },
  { t: 'GILD', n: 'Gilead Sciences Inc.', e: 'NASDAQ', s: 'Healthcare' },
  { t: 'VRTX', n: 'Vertex Pharmaceuticals', e: 'NASDAQ', s: 'Healthcare' },
  { t: 'ISRG', n: 'Intuitive Surgical Inc.', e: 'NASDAQ', s: 'Healthcare' },
  { t: 'MDT', n: 'Medtronic plc', e: 'NYSE', s: 'Healthcare' },
  { t: 'SYK', n: 'Stryker Corporation', e: 'NYSE', s: 'Healthcare' },
  { t: 'BSX', n: 'Boston Scientific Corporation', e: 'NYSE', s: 'Healthcare' },
  { t: 'REGN', n: 'Regeneron Pharmaceuticals', e: 'NASDAQ', s: 'Healthcare' },
  { t: 'ELV', n: 'Elevance Health Inc.', e: 'NYSE', s: 'Healthcare' },
  { t: 'CI', n: 'The Cigna Group', e: 'NYSE', s: 'Healthcare' },
  { t: 'HCA', n: 'HCA Healthcare Inc.', e: 'NYSE', s: 'Healthcare' },
  { t: 'ZTS', n: 'Zoetis Inc.', e: 'NYSE', s: 'Healthcare' },
  { t: 'MRNA', n: 'Moderna Inc.', e: 'NASDAQ', s: 'Healthcare' },
  { t: 'BIIB', n: 'Biogen Inc.', e: 'NASDAQ', s: 'Healthcare' },
  { t: 'IQV', n: 'IQVIA Holdings Inc.', e: 'NYSE', s: 'Healthcare' },
  { t: 'DXCM', n: 'DexCom Inc.', e: 'NASDAQ', s: 'Healthcare' },
  { t: 'ILMN', n: 'Illumina Inc.', e: 'NASDAQ', s: 'Healthcare' },
  { t: 'GEHC', n: 'GE HealthCare Technologies', e: 'NASDAQ', s: 'Healthcare' },

  // Consumer
  { t: 'WMT', n: 'Walmart Inc.', e: 'NYSE', s: 'Consumer Defensive' },
  { t: 'PG', n: 'Procter & Gamble Company', e: 'NYSE', s: 'Consumer Defensive' },
  { t: 'COST', n: 'Costco Wholesale Corporation', e: 'NASDAQ', s: 'Consumer Defensive' },
  { t: 'KO', n: 'The Coca-Cola Company', e: 'NYSE', s: 'Consumer Defensive' },
  { t: 'PEP', n: 'PepsiCo Inc.', e: 'NASDAQ', s: 'Consumer Defensive' },
  { t: 'HD', n: 'The Home Depot Inc.', e: 'NYSE', s: 'Consumer Cyclical' },
  { t: 'MCD', n: 'McDonald\'s Corporation', e: 'NYSE', s: 'Consumer Cyclical' },
  { t: 'NKE', n: 'NIKE Inc.', e: 'NYSE', s: 'Consumer Cyclical' },
  { t: 'SBUX', n: 'Starbucks Corporation', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'LOW', n: 'Lowe\'s Companies Inc.', e: 'NYSE', s: 'Consumer Cyclical' },
  { t: 'TGT', n: 'Target Corporation', e: 'NYSE', s: 'Consumer Defensive' },
  { t: 'TJX', n: 'The TJX Companies Inc.', e: 'NYSE', s: 'Consumer Cyclical' },
  { t: 'CL', n: 'Colgate-Palmolive Company', e: 'NYSE', s: 'Consumer Defensive' },
  { t: 'MDLZ', n: 'Mondelez International Inc.', e: 'NASDAQ', s: 'Consumer Defensive' },
  { t: 'PM', n: 'Philip Morris International', e: 'NYSE', s: 'Consumer Defensive' },
  { t: 'MO', n: 'Altria Group Inc.', e: 'NYSE', s: 'Consumer Defensive' },
  { t: 'EL', n: 'The Estée Lauder Companies', e: 'NYSE', s: 'Consumer Defensive' },
  { t: 'KMB', n: 'Kimberly-Clark Corporation', e: 'NYSE', s: 'Consumer Defensive' },
  { t: 'GIS', n: 'General Mills Inc.', e: 'NYSE', s: 'Consumer Defensive' },
  { t: 'K', n: 'Kellanova', e: 'NYSE', s: 'Consumer Defensive' },
  { t: 'HSY', n: 'The Hershey Company', e: 'NYSE', s: 'Consumer Defensive' },
  { t: 'SJM', n: 'J.M. Smucker Company', e: 'NYSE', s: 'Consumer Defensive' },
  { t: 'LULU', n: 'Lululemon Athletica Inc.', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'ROST', n: 'Ross Stores Inc.', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'DG', n: 'Dollar General Corporation', e: 'NYSE', s: 'Consumer Defensive' },
  { t: 'DLTR', n: 'Dollar Tree Inc.', e: 'NASDAQ', s: 'Consumer Defensive' },
  { t: 'YUM', n: 'Yum! Brands Inc.', e: 'NYSE', s: 'Consumer Cyclical' },
  { t: 'CMG', n: 'Chipotle Mexican Grill Inc.', e: 'NYSE', s: 'Consumer Cyclical' },
  { t: 'DPZ', n: 'Domino\'s Pizza Inc.', e: 'NYSE', s: 'Consumer Cyclical' },
  { t: 'GM', n: 'General Motors Company', e: 'NYSE', s: 'Consumer Cyclical' },
  { t: 'F', n: 'Ford Motor Company', e: 'NYSE', s: 'Consumer Cyclical' },
  { t: 'BKNG', n: 'Booking Holdings Inc.', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'MAR', n: 'Marriott International Inc.', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'HLT', n: 'Hilton Worldwide Holdings', e: 'NYSE', s: 'Consumer Cyclical' },

  // Industrials
  { t: 'CAT', n: 'Caterpillar Inc.', e: 'NYSE', s: 'Industrials' },
  { t: 'GE', n: 'GE Aerospace', e: 'NYSE', s: 'Industrials' },
  { t: 'HON', n: 'Honeywell International Inc.', e: 'NASDAQ', s: 'Industrials' },
  { t: 'UNP', n: 'Union Pacific Corporation', e: 'NYSE', s: 'Industrials' },
  { t: 'RTX', n: 'RTX Corporation', e: 'NYSE', s: 'Industrials' },
  { t: 'BA', n: 'The Boeing Company', e: 'NYSE', s: 'Industrials' },
  { t: 'LMT', n: 'Lockheed Martin Corporation', e: 'NYSE', s: 'Industrials' },
  { t: 'DE', n: 'Deere & Company', e: 'NYSE', s: 'Industrials' },
  { t: 'UPS', n: 'United Parcel Service Inc.', e: 'NYSE', s: 'Industrials' },
  { t: 'FDX', n: 'FedEx Corporation', e: 'NYSE', s: 'Industrials' },
  { t: 'MMM', n: '3M Company', e: 'NYSE', s: 'Industrials' },
  { t: 'GD', n: 'General Dynamics Corporation', e: 'NYSE', s: 'Industrials' },
  { t: 'NOC', n: 'Northrop Grumman Corporation', e: 'NYSE', s: 'Industrials' },
  { t: 'LHX', n: 'L3Harris Technologies', e: 'NYSE', s: 'Industrials' },
  { t: 'WM', n: 'Waste Management Inc.', e: 'NYSE', s: 'Industrials' },
  { t: 'RSG', n: 'Republic Services Inc.', e: 'NYSE', s: 'Industrials' },
  { t: 'EMR', n: 'Emerson Electric Co.', e: 'NYSE', s: 'Industrials' },
  { t: 'ITW', n: 'Illinois Tool Works Inc.', e: 'NYSE', s: 'Industrials' },
  { t: 'ETN', n: 'Eaton Corporation plc', e: 'NYSE', s: 'Industrials' },
  { t: 'CSX', n: 'CSX Corporation', e: 'NASDAQ', s: 'Industrials' },
  { t: 'NSC', n: 'Norfolk Southern Corporation', e: 'NYSE', s: 'Industrials' },
  { t: 'DAL', n: 'Delta Air Lines Inc.', e: 'NYSE', s: 'Industrials' },
  { t: 'UAL', n: 'United Airlines Holdings', e: 'NASDAQ', s: 'Industrials' },
  { t: 'LUV', n: 'Southwest Airlines Co.', e: 'NYSE', s: 'Industrials' },
  { t: 'AAL', n: 'American Airlines Group', e: 'NASDAQ', s: 'Industrials' },

  // Energy
  { t: 'XOM', n: 'Exxon Mobil Corporation', e: 'NYSE', s: 'Energy' },
  { t: 'CVX', n: 'Chevron Corporation', e: 'NYSE', s: 'Energy' },
  { t: 'COP', n: 'ConocoPhillips', e: 'NYSE', s: 'Energy' },
  { t: 'SLB', n: 'Schlumberger Limited', e: 'NYSE', s: 'Energy' },
  { t: 'EOG', n: 'EOG Resources Inc.', e: 'NYSE', s: 'Energy' },
  { t: 'PXD', n: 'Pioneer Natural Resources', e: 'NYSE', s: 'Energy' },
  { t: 'MPC', n: 'Marathon Petroleum Corporation', e: 'NYSE', s: 'Energy' },
  { t: 'PSX', n: 'Phillips 66', e: 'NYSE', s: 'Energy' },
  { t: 'VLO', n: 'Valero Energy Corporation', e: 'NYSE', s: 'Energy' },
  { t: 'OXY', n: 'Occidental Petroleum Corp.', e: 'NYSE', s: 'Energy' },
  { t: 'HAL', n: 'Halliburton Company', e: 'NYSE', s: 'Energy' },
  { t: 'DVN', n: 'Devon Energy Corporation', e: 'NYSE', s: 'Energy' },
  { t: 'FANG', n: 'Diamondback Energy Inc.', e: 'NASDAQ', s: 'Energy' },
  { t: 'KMI', n: 'Kinder Morgan Inc.', e: 'NYSE', s: 'Energy' },
  { t: 'WMB', n: 'Williams Companies Inc.', e: 'NYSE', s: 'Energy' },
  { t: 'OKE', n: 'ONEOK Inc.', e: 'NYSE', s: 'Energy' },

  // Utilities
  { t: 'NEE', n: 'NextEra Energy Inc.', e: 'NYSE', s: 'Utilities' },
  { t: 'DUK', n: 'Duke Energy Corporation', e: 'NYSE', s: 'Utilities' },
  { t: 'SO', n: 'Southern Company', e: 'NYSE', s: 'Utilities' },
  { t: 'D', n: 'Dominion Energy Inc.', e: 'NYSE', s: 'Utilities' },
  { t: 'AEP', n: 'American Electric Power', e: 'NASDAQ', s: 'Utilities' },
  { t: 'SRE', n: 'Sempra', e: 'NYSE', s: 'Utilities' },
  { t: 'EXC', n: 'Exelon Corporation', e: 'NASDAQ', s: 'Utilities' },
  { t: 'XEL', n: 'Xcel Energy Inc.', e: 'NASDAQ', s: 'Utilities' },
  { t: 'ED', n: 'Consolidated Edison Inc.', e: 'NYSE', s: 'Utilities' },
  { t: 'PCG', n: 'PG&E Corporation', e: 'NYSE', s: 'Utilities' },
  { t: 'VST', n: 'Vistra Corp.', e: 'NYSE', s: 'Utilities' },
  { t: 'CEG', n: 'Constellation Energy Corp.', e: 'NASDAQ', s: 'Utilities' },

  // Real Estate
  { t: 'AMT', n: 'American Tower Corporation', e: 'NYSE', s: 'Real Estate' },
  { t: 'PLD', n: 'Prologis Inc.', e: 'NYSE', s: 'Real Estate' },
  { t: 'CCI', n: 'Crown Castle Inc.', e: 'NYSE', s: 'Real Estate' },
  { t: 'EQIX', n: 'Equinix Inc.', e: 'NASDAQ', s: 'Real Estate' },
  { t: 'SPG', n: 'Simon Property Group', e: 'NYSE', s: 'Real Estate' },
  { t: 'O', n: 'Realty Income Corporation', e: 'NYSE', s: 'Real Estate' },
  { t: 'PSA', n: 'Public Storage', e: 'NYSE', s: 'Real Estate' },
  { t: 'DLR', n: 'Digital Realty Trust', e: 'NYSE', s: 'Real Estate' },
  { t: 'WELL', n: 'Welltower Inc.', e: 'NYSE', s: 'Real Estate' },
  { t: 'AVB', n: 'AvalonBay Communities Inc.', e: 'NYSE', s: 'Real Estate' },

  // Communication Services
  { t: 'DIS', n: 'The Walt Disney Company', e: 'NYSE', s: 'Communication Services' },
  { t: 'CMCSA', n: 'Comcast Corporation', e: 'NASDAQ', s: 'Communication Services' },
  { t: 'T', n: 'AT&T Inc.', e: 'NYSE', s: 'Communication Services' },
  { t: 'VZ', n: 'Verizon Communications Inc.', e: 'NYSE', s: 'Communication Services' },
  { t: 'TMUS', n: 'T-Mobile US Inc.', e: 'NASDAQ', s: 'Communication Services' },
  { t: 'CHTR', n: 'Charter Communications Inc.', e: 'NASDAQ', s: 'Communication Services' },
  { t: 'EA', n: 'Electronic Arts Inc.', e: 'NASDAQ', s: 'Communication Services' },
  { t: 'TTWO', n: 'Take-Two Interactive', e: 'NASDAQ', s: 'Communication Services' },
  { t: 'WBD', n: 'Warner Bros. Discovery', e: 'NASDAQ', s: 'Communication Services' },
  { t: 'PARA', n: 'Paramount Global', e: 'NASDAQ', s: 'Communication Services' },
  { t: 'LYV', n: 'Live Nation Entertainment', e: 'NYSE', s: 'Communication Services' },
  { t: 'MTCH', n: 'Match Group Inc.', e: 'NASDAQ', s: 'Communication Services' },

  // Materials
  { t: 'LIN', n: 'Linde plc', e: 'NASDAQ', s: 'Materials' },
  { t: 'APD', n: 'Air Products and Chemicals', e: 'NYSE', s: 'Materials' },
  { t: 'SHW', n: 'Sherwin-Williams Company', e: 'NYSE', s: 'Materials' },
  { t: 'ECL', n: 'Ecolab Inc.', e: 'NYSE', s: 'Materials' },
  { t: 'FCX', n: 'Freeport-McMoRan Inc.', e: 'NYSE', s: 'Materials' },
  { t: 'NEM', n: 'Newmont Corporation', e: 'NYSE', s: 'Materials' },
  { t: 'DOW', n: 'Dow Inc.', e: 'NYSE', s: 'Materials' },
  { t: 'DD', n: 'DuPont de Nemours Inc.', e: 'NYSE', s: 'Materials' },
  { t: 'NUE', n: 'Nucor Corporation', e: 'NYSE', s: 'Materials' },
  { t: 'STLD', n: 'Steel Dynamics Inc.', e: 'NASDAQ', s: 'Materials' },
  { t: 'VMC', n: 'Vulcan Materials Company', e: 'NYSE', s: 'Materials' },
  { t: 'MLM', n: 'Martin Marietta Materials', e: 'NYSE', s: 'Materials' },

  // Insurance
  { t: 'BRK-B', n: 'Berkshire Hathaway Inc. Class B', e: 'NYSE', s: 'Financial Services' },
  { t: 'PGR', n: 'Progressive Corporation', e: 'NYSE', s: 'Financial Services' },
  { t: 'CB', n: 'Chubb Limited', e: 'NYSE', s: 'Financial Services' },
  { t: 'MET', n: 'MetLife Inc.', e: 'NYSE', s: 'Financial Services' },
  { t: 'PRU', n: 'Prudential Financial Inc.', e: 'NYSE', s: 'Financial Services' },
  { t: 'AIG', n: 'American International Group', e: 'NYSE', s: 'Financial Services' },
  { t: 'ALL', n: 'The Allstate Corporation', e: 'NYSE', s: 'Financial Services' },
  { t: 'TRV', n: 'The Travelers Companies', e: 'NYSE', s: 'Financial Services' },
  { t: 'AFL', n: 'Aflac Inc.', e: 'NYSE', s: 'Financial Services' },

  // Additional popular stocks
  { t: 'ACHR', n: 'Archer Aviation Inc.', e: 'NYSE', s: 'Industrials' },
  { t: 'AI', n: 'C3.ai Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'ANET', n: 'Arista Networks Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'APO', n: 'Apollo Global Management', e: 'NYSE', s: 'Financial Services' },
  { t: 'AXON', n: 'Axon Enterprise Inc.', e: 'NASDAQ', s: 'Industrials' },
  { t: 'AZO', n: 'AutoZone Inc.', e: 'NYSE', s: 'Consumer Cyclical' },
  { t: 'BABA', n: 'Alibaba Group Holding', e: 'NYSE', s: 'Consumer Cyclical' },
  { t: 'BX', n: 'Blackstone Inc.', e: 'NYSE', s: 'Financial Services' },
  { t: 'CELH', n: 'Celsius Holdings Inc.', e: 'NASDAQ', s: 'Consumer Defensive' },
  { t: 'CF', n: 'CF Industries Holdings', e: 'NYSE', s: 'Materials' },
  { t: 'CLF', n: 'Cleveland-Cliffs Inc.', e: 'NYSE', s: 'Materials' },
  { t: 'CPNG', n: 'Coupang Inc.', e: 'NYSE', s: 'Consumer Cyclical' },
  { t: 'CVS', n: 'CVS Health Corporation', e: 'NYSE', s: 'Healthcare' },
  { t: 'DKNG', n: 'DraftKings Inc.', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'ENPH', n: 'Enphase Energy Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'FSLR', n: 'First Solar Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'GRAB', n: 'Grab Holdings Limited', e: 'NASDAQ', s: 'Technology' },
  { t: 'JD', n: 'JD.com Inc.', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'KKR', n: 'KKR & Co. Inc.', e: 'NYSE', s: 'Financial Services' },
  { t: 'KR', n: 'The Kroger Co.', e: 'NYSE', s: 'Consumer Defensive' },
  { t: 'LI', n: 'Li Auto Inc.', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'LYFT', n: 'Lyft Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'MELI', n: 'MercadoLibre Inc.', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'NIO', n: 'NIO Inc.', e: 'NYSE', s: 'Consumer Cyclical' },
  { t: 'NU', n: 'Nu Holdings Ltd.', e: 'NYSE', s: 'Financial Services' },
  { t: 'ON', n: 'ON Semiconductor Corporation', e: 'NASDAQ', s: 'Technology' },
  { t: 'ORLY', n: 'O\'Reilly Automotive Inc.', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'PDD', n: 'PDD Holdings Inc.', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'REGN', n: 'Regeneron Pharmaceuticals', e: 'NASDAQ', s: 'Healthcare' },
  { t: 'SE', n: 'Sea Limited', e: 'NYSE', s: 'Communication Services' },
  { t: 'SEDG', n: 'SolarEdge Technologies', e: 'NASDAQ', s: 'Technology' },
  { t: 'SQ', n: 'Block Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'STZ', n: 'Constellation Brands Inc.', e: 'NYSE', s: 'Consumer Defensive' },
  { t: 'SWAV', n: 'Shockwave Medical Inc.', e: 'NASDAQ', s: 'Healthcare' },
  { t: 'TER', n: 'Teradyne Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'TEVA', n: 'Teva Pharmaceutical', e: 'NYSE', s: 'Healthcare' },
  { t: 'URI', n: 'United Rentals Inc.', e: 'NYSE', s: 'Industrials' },
  { t: 'W', n: 'Wayfair Inc.', e: 'NYSE', s: 'Consumer Cyclical' },
  { t: 'XPEV', n: 'XPeng Inc.', e: 'NYSE', s: 'Consumer Cyclical' },
  { t: 'ZM', n: 'Zoom Video Communications', e: 'NASDAQ', s: 'Technology' },
  { t: 'ZIM', n: 'ZIM Integrated Shipping', e: 'NYSE', s: 'Industrials' },

  // Additional large-cap & popular
  { t: 'ACN', n: 'Accenture plc', e: 'NYSE', s: 'Technology' },
  { t: 'ADSK', n: 'Autodesk Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'AME', n: 'AMETEK Inc.', e: 'NYSE', s: 'Industrials' },
  { t: 'ANSS', n: 'ANSYS Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'APH', n: 'Amphenol Corporation', e: 'NYSE', s: 'Technology' },
  { t: 'ADP', n: 'Automatic Data Processing', e: 'NASDAQ', s: 'Industrials' },
  { t: 'CARR', n: 'Carrier Global Corporation', e: 'NYSE', s: 'Industrials' },
  { t: 'CBRE', n: 'CBRE Group Inc.', e: 'NYSE', s: 'Real Estate' },
  { t: 'CHWY', n: 'Chewy Inc.', e: 'NYSE', s: 'Consumer Cyclical' },
  { t: 'CTAS', n: 'Cintas Corporation', e: 'NASDAQ', s: 'Industrials' },
  { t: 'DFS', n: 'Discover Financial Services', e: 'NYSE', s: 'Financial Services' },
  { t: 'EBAY', n: 'eBay Inc.', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'ETSY', n: 'Etsy Inc.', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'EW', n: 'Edwards Lifesciences', e: 'NYSE', s: 'Healthcare' },
  { t: 'FAST', n: 'Fastenal Company', e: 'NASDAQ', s: 'Industrials' },
  { t: 'FIS', n: 'Fidelity National Information', e: 'NYSE', s: 'Financial Services' },
  { t: 'FISV', n: 'Fiserv Inc.', e: 'NYSE', s: 'Financial Services' },
  { t: 'GPN', n: 'Global Payments Inc.', e: 'NYSE', s: 'Financial Services' },
  { t: 'HES', n: 'Hess Corporation', e: 'NYSE', s: 'Energy' },
  { t: 'HUM', n: 'Humana Inc.', e: 'NYSE', s: 'Healthcare' },
  { t: 'IDXX', n: 'IDEXX Laboratories Inc.', e: 'NASDAQ', s: 'Healthcare' },
  { t: 'IT', n: 'Gartner Inc.', e: 'NYSE', s: 'Technology' },
  { t: 'KEYS', n: 'Keysight Technologies', e: 'NYSE', s: 'Technology' },
  { t: 'MNST', n: 'Monster Beverage Corporation', e: 'NASDAQ', s: 'Consumer Defensive' },
  { t: 'MPWR', n: 'Monolithic Power Systems', e: 'NASDAQ', s: 'Technology' },
  { t: 'MSCI', n: 'MSCI Inc.', e: 'NYSE', s: 'Financial Services' },
  { t: 'NDAQ', n: 'Nasdaq Inc.', e: 'NASDAQ', s: 'Financial Services' },
  { t: 'ODFL', n: 'Old Dominion Freight Line', e: 'NASDAQ', s: 'Industrials' },
  { t: 'OTIS', n: 'Otis Worldwide Corporation', e: 'NYSE', s: 'Industrials' },
  { t: 'PAYX', n: 'Paychex Inc.', e: 'NASDAQ', s: 'Industrials' },
  { t: 'PCAR', n: 'PACCAR Inc.', e: 'NASDAQ', s: 'Industrials' },
  { t: 'PWR', n: 'Quanta Services Inc.', e: 'NYSE', s: 'Industrials' },
  { t: 'ROK', n: 'Rockwell Automation Inc.', e: 'NYSE', s: 'Industrials' },
  { t: 'RVTY', n: 'Revvity Inc.', e: 'NYSE', s: 'Healthcare' },
  { t: 'SBAC', n: 'SBA Communications Corp.', e: 'NASDAQ', s: 'Real Estate' },
  { t: 'STX', n: 'Seagate Technology Holdings', e: 'NASDAQ', s: 'Technology' },
  { t: 'SWKS', n: 'Skyworks Solutions Inc.', e: 'NASDAQ', s: 'Technology' },
  { t: 'SYY', n: 'Sysco Corporation', e: 'NYSE', s: 'Consumer Defensive' },
  { t: 'TSCO', n: 'Tractor Supply Company', e: 'NASDAQ', s: 'Consumer Cyclical' },
  { t: 'TT', n: 'Trane Technologies plc', e: 'NYSE', s: 'Industrials' },
  { t: 'VRSK', n: 'Verisk Analytics Inc.', e: 'NASDAQ', s: 'Industrials' },
  { t: 'WAB', n: 'Westinghouse Air Brake', e: 'NYSE', s: 'Industrials' },
  { t: 'WEC', n: 'WEC Energy Group Inc.', e: 'NYSE', s: 'Utilities' },
  { t: 'WTW', n: 'Willis Towers Watson', e: 'NASDAQ', s: 'Financial Services' },
  { t: 'XYL', n: 'Xylem Inc.', e: 'NYSE', s: 'Industrials' },
  { t: 'ZBRA', n: 'Zebra Technologies Corp.', e: 'NASDAQ', s: 'Technology' },
];

// Build lookup maps for fast searching
const tickerMap = new Map(stockDirectory.map(s => [s.t, s]));
const searchIndex = stockDirectory.map(s => ({
  entry: s,
  searchText: `${s.t} ${s.n} ${s.s || ''}`.toLowerCase(),
}));

/**
 * Search the local stock directory by ticker or company name.
 * Returns up to `limit` results, prioritizing exact ticker matches.
 */
export function searchStockDirectory(query: string, limit = 10): StockEntry[] {
  if (!query || query.length === 0) return [];

  const q = query.toLowerCase().trim();

  // Exact ticker match goes first
  const exactTicker = tickerMap.get(query.toUpperCase());

  // Score-based search
  const scored = searchIndex
    .map(({ entry, searchText }) => {
      let score = 0;
      const tickerLower = entry.t.toLowerCase();

      if (tickerLower === q) {
        score = 100; // exact ticker match
      } else if (tickerLower.startsWith(q)) {
        score = 80; // ticker starts with query
      } else if (tickerLower.includes(q)) {
        score = 60; // ticker contains query
      } else if (entry.n.toLowerCase().startsWith(q)) {
        score = 50; // name starts with query
      } else if (searchText.includes(q)) {
        score = 30; // name/sector contains query
      }

      // Bonus for word-boundary matches in company name
      const words = entry.n.toLowerCase().split(/\s+/);
      if (words.some(w => w.startsWith(q))) {
        score = Math.max(score, 45);
      }

      return { entry, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.entry);

  // De-duplicate (in case exact match is already in scored results)
  if (exactTicker && !scored.find(s => s.t === exactTicker.t)) {
    return [exactTicker, ...scored.slice(0, limit - 1)];
  }

  return scored;
}

/**
 * Look up a single stock by exact ticker.
 */
export function getStockByTicker(ticker: string): StockEntry | undefined {
  return tickerMap.get(ticker.toUpperCase());
}
