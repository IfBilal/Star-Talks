import swisseph as swe, json, sys, datetime
swe.set_sid_mode(swe.SIDM_LAHIRI)
cases=json.loads(sys.argv[1]); out=[]
for c in cases:
    d=datetime.datetime.fromisoformat(c['utc'].replace('Z',''))
    jd=swe.julday(d.year,d.month,d.day,d.hour+d.minute/60+d.second/3600)
    fl=swe.FLG_MOSEPH|swe.FLG_SIDEREAL
    pos=lambda b: swe.calc_ut(jd,b,fl)[0][0]
    houses,ascmc=swe.houses_ex(jd,c['lat'],c['lon'],b'W',swe.FLG_SIDEREAL)
    out.append(dict(id=c['id'],ayan=swe.get_ayanamsa_ut(jd),asc=ascmc[0],sun=pos(swe.SUN),moon=pos(swe.MOON),mars=pos(swe.MARS),jupiter=pos(swe.JUPITER),saturn=pos(swe.SATURN),rahu=pos(swe.MEAN_NODE)))
print(json.dumps(out))
