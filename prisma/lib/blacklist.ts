//in memory blacklist - will swap to redis later

const blacklist = new Set<string>();

export function blacklistToken(token:string): void{
  blacklist.add(token);
}

export function isBlacklisted(token:string): boolean{
  return blacklist.has(token);
}