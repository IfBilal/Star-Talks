import { searchBirthplaces } from './geoapify';

describe('searchBirthplaces',()=>{
  afterEach(()=>jest.restoreAllMocks());

  it('maps Geoapify suggestions to location records with coordinates',async()=>{
    const fetchMock=jest.spyOn(globalThis,'fetch').mockResolvedValue({ok:true,json:async()=>({features:[{properties:{place_id:'place-1',formatted:'Delhi, India',country_code:'in'},geometry:{coordinates:[77.209,28.6139]}}]})} as Response);
    const result=await searchBirthplaces(`Delhi ${Date.now()}`,'test-api-key');
    expect(result).toEqual([{id:'place-1',label:'Delhi, India',lat:28.6139,lon:77.209,countryCode:'in'}]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('https://api.geoapify.com/v1/geocode/autocomplete');
  });

  it('requires an API key and reports provider failures',async()=>{
    await expect(searchBirthplaces('Lahore','')).rejects.toThrow('EXPO_PUBLIC_GEOAPIFY_API_KEY');
    jest.spyOn(globalThis,'fetch').mockResolvedValue({ok:false,status:429} as Response);
    await expect(searchBirthplaces(`Lahore ${Date.now()}`,'test-api-key')).rejects.toThrow('Place search failed (429)');
  });
});
