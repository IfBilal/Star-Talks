export type Place={id:string;label:string;lat:number;lon:number;countryCode?:string};
type GeoFeature={properties?:{place_id?:string;formatted?:string;city?:string;state?:string;country?:string;country_code?:string;name?:string};geometry?:{coordinates?:[number,number]}};
const cache=new Map<string,{expires:number;places:Place[]}>();
export async function searchBirthplaces(query:string, apiKey:string, signal?:AbortSignal):Promise<Place[]> {
  if(!apiKey) throw new Error('Add EXPO_PUBLIC_GEOAPIFY_API_KEY to .env.local to enable birthplace search.');
  const normalized=query.trim().toLocaleLowerCase();const hit=cache.get(normalized);if(hit&&hit.expires>Date.now())return hit.places;
  const url=new URL('https://api.geoapify.com/v1/geocode/autocomplete');url.searchParams.set('text',query);url.searchParams.set('limit','6');url.searchParams.set('format','geojson');url.searchParams.set('apiKey',apiKey);
  const response=await fetch(url,{signal});if(!response.ok)throw new Error(`Place search failed (${response.status}). Please try again.`);
  const data=await response.json() as {features?:GeoFeature[]};const places=(data.features??[]).flatMap((f,i)=>{const p=f.properties;const c=f.geometry?.coordinates;if(!p||!c||!Number.isFinite(c[0])||!Number.isFinite(c[1]))return[];return[{id:p.place_id??`${c[1]}-${c[0]}-${i}`,label:p.formatted??[p.name,p.city,p.state,p.country].filter(Boolean).join(', '),lat:c[1],lon:c[0],countryCode:p.country_code}]});cache.set(normalized,{expires:Date.now()+10*60*1000,places});return places;
}
