/**
 * ESPN numeric player IDs for well-known NBA players.
 * Headshot URL: https://a.espncdn.com/i/headshots/nba/players/full/{id}.png
 * These are transparent-background PNG cutouts.
 */
export const ESPN_PLAYER_IDS: Record<string, string> = {
  // Guards
  'Stephen Curry': '3975',
  'Damian Lillard': '6606',
  'Ja Morant': '4278073',
  'Trae Young': '4277905',
  'Shai Gilgeous-Alexander': '4278128',
  'Kyrie Irving': '6442',
  'Donovan Mitchell': '3907387',
  'Tyrese Haliburton': '4395728',
  'Jalen Brunson': '4395730',
  'Cade Cunningham': '4432816',
  "De'Aaron Fox": '4066261',
  'Chris Paul': '2779',
  'James Harden': '3992',
  'Russell Westbrook': '3468',
  'Darius Garland': '4432576',
  'Josh Giddey': '4572671',
  'Devin Booker': '3136193',
  'Bradley Beal': '6580',
  'Klay Thompson': '6475',
  'Anthony Edwards': '4431680',
  'Desmond Bane': '4395727',
  'Immanuel Quickley': '4432813',
  'Tyrese Maxey': '4432814',
  'Jalen Green': '4432577',
  'LaMelo Ball': '4432576',
  'Cole Anthony': '4432813',
  'Mike Conley': '3006',
  // Wings / Forwards
  'LeBron James': '1966',
  'Kevin Durant': '3202',
  'Giannis Antetokounmpo': '3032977',
  'Luka Doncic': '3945274',
  'Jayson Tatum': '4065648',
  'Paul George': '4251',
  'Kawhi Leonard': '6450',
  'Jaylen Brown': '3917376',
  'OG Anunoby': '4065632',
  'RJ Barrett': '4431678',
  'Mikal Bridges': '4066328',
  'Miles Bridges': '4278076',
  'Andrew Wiggins': '3096090',
  'Draymond Green': '6589',
  'Pascal Siakam': '3059517',
  'Khris Middleton': '6518',
  'Jimmy Butler': '6430',
  'Jrue Holiday': '3976',
  'Lu Dort': '4395726',
  'Brandon Ingram': '3907498',
  'Paolo Banchero': '4432810',
  'Franz Wagner': '4432811',
  'Scottie Barnes': '4432580',
  'Jabari Smith Jr.': '4432812',
  'Keegan Murray': '4432815',
  'Jerami Grant': '2596998',
  // Bigs / Centers
  'Nikola Jokic': '3112335',
  'Joel Embiid': '3059318',
  'Anthony Davis': '6583',
  'Karl-Anthony Towns': '3136779',
  'Bam Adebayo': '3136194',
  'Domantas Sabonis': '3096564',
  'Evan Mobley': '4432579',
  'Jaren Jackson Jr.': '4278129',
  'Zion Williamson': '4432577',
  'Victor Wembanyama': '5105725',
  'Rudy Gobert': '3032976',
  'Brook Lopez': '3213',
  'Clint Capela': '2580782',
  'Isaiah Hartenstein': '4065629',
  'Nic Claxton': '4395716',
  'Walker Kessler': '4432817',
  'Chet Holmgren': '4432819',
};

export function getESPNPlayerId(name: string): string | null {
  if (!name) return null;
  // Exact match first
  if (ESPN_PLAYER_IDS[name]) return ESPN_PLAYER_IDS[name];
  // Case-insensitive + normalize apostrophes
  const norm = (s: string) => s.toLowerCase().replace(/['']/g, "'").trim();
  const q = norm(name);
  for (const [k, id] of Object.entries(ESPN_PLAYER_IDS)) {
    if (norm(k) === q) return id;
  }
  // First + last name match (handles middle names / Jr. suffix differences)
  const qParts = q.split(' ').filter(Boolean);
  if (qParts.length >= 2) {
    for (const [k, id] of Object.entries(ESPN_PLAYER_IDS)) {
      const kParts = norm(k).split(' ').filter(Boolean);
      if (kParts[0] === qParts[0] && kParts[kParts.length - 1] === qParts[qParts.length - 1]) {
        return id;
      }
    }
  }
  return null;
}

export function espnHeadshotUrl(playerId: string): string {
  return `https://a.espncdn.com/i/headshots/nba/players/full/${playerId}.png`;
}

// Streaming service links by broadcast network
export const BROADCAST_WATCH_LINKS: Record<string, { name: string; url: string }> = {
  ESPN:    { name: 'ESPN',    url: 'https://plus.espn.com' },
  ESPN2:   { name: 'ESPN',    url: 'https://plus.espn.com' },
  'ESPN+': { name: 'ESPN+',   url: 'https://plus.espn.com' },
  ABC:     { name: 'ESPN/ABC', url: 'https://plus.espn.com' },
  TNT:     { name: 'MAX',     url: 'https://www.max.com' },
  TBS:     { name: 'MAX',     url: 'https://www.max.com' },
  'NBA TV':{ name: 'NBA TV',  url: 'https://www.nba.com/watch' },
  'NBATV': { name: 'NBA TV',  url: 'https://www.nba.com/watch' },
  CBS:     { name: 'Paramount+', url: 'https://www.paramountplus.com' },
};

export function getWatchLink(broadcast: string | null | undefined): { name: string; url: string } | null {
  if (!broadcast) return null;
  const key = broadcast.trim().toUpperCase();
  return BROADCAST_WATCH_LINKS[broadcast.trim()] ?? BROADCAST_WATCH_LINKS[key] ?? null;
}
