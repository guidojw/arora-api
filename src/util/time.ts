// Intl has no abbreviation API, so try locales; zones none know give GMT+9.
const TIME_ZONE_LOCALES = ['en-GB', 'en-US', 'en-AU', 'en-ZA', 'en-CA', 'en-IE', 'en-SG', 'en-HK']

export function getDate (date: Date): string {
  return date.toLocaleDateString()
}

export function getTime (date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function getTimeZoneAbbreviation (date: Date): string {
  const names = TIME_ZONE_LOCALES.map(locale => new Intl.DateTimeFormat(
    locale,
    { timeZoneName: 'short' }
  ).formatToParts(date).find(part => part.type === 'timeZoneName')?.value ?? 'UTC')
  // CLDR's en-GB name for Gulf Standard Time is a typo.
  return (names.find(name => !/^GMT[+-]/.test(name)) ?? names[0]).replace('GTS', 'GST')
}
