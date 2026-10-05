// Browser layout smoke test of real screens; native adapters and backend calls are isolated.
// This verifies layout/theme behavior, not installed-device or provider acceptance.
const {build}=require('esbuild');
const {chromium}=require('playwright');
const fs=require('fs'),http=require('http'),path=require('path');
const root=process.cwd();
const output=process.env.UI_ARTIFACT_DIR || '/tmp/star-talks-appearance';fs.mkdirSync(output,{recursive:true});
const fontNames=['400Regular','500Medium','600SemiBold','700Bold'];
const fontCss=fontNames.map(name=>`@font-face{font-family:Poppins_${name};src:url(/font-${name}.ttf)}`).join('');
const mocks={
'expo-router':`export const router={push(){},replace(){}};export function useLocalSearchParams(){return {}};`,
'expo-image':`import React from 'react';import{Image as RNImage}from'react-native';export const Image=({contentFit,...p})=><RNImage {...p} resizeMode={contentFit||'contain'}/>;`,
'expo-linear-gradient':`import React from 'react';import{View}from'react-native';export const LinearGradient=({colors,locations,start,end,...p})=><View {...p} style={[p.style,{backgroundImage:'linear-gradient('+colors.join(',')+')'}]}/>;`,
'react-native-safe-area-context':`import React from 'react';import{View}from'react-native';export const SafeAreaView=({edges,...p})=><View {...p}/>;`,
'expo-system-ui':`export const setBackgroundColorAsync=async()=>{};`,
'@/lib/supabase':`const q={select(){return q},eq(){return q},maybeSingle:async()=>({data:{display_name:'Test Account'}})}; export const requireSupabase=()=>({from:()=>q,auth:{getUser:async()=>({data:{user:{id:'ui-fixture',email:'test@example.invalid'}}})}});`,
'@/features/ai/api':`export const aiCall=async()=>({modules:['vedic','tarot','palmistry','numerology','western','lal-kitab','chinese-zodiac','korean-astrology','face-reading'].map(id=>({id,available:true}))});`,
'react-i18next':`export function useTranslation(){return {t:k=>({'common.tabs.home':'Home','common.tabs.courses':'Courses','common.tabs.ai':'AI','common.tabs.reports':'Reports','common.tabs.profile':'Profile'}[k]||k)}};`,
};
(async()=>{
 const bundle=await build({stdin:{contents:`import React from 'react';import{createRoot}from'react-dom/client';import{ThemeProvider}from'@/lib/theme-context';import AiHome from'@/app/ai/index';import AccountSettings from'@/app/settings/account';document.body.style.margin='0';createRoot(document.getElementById('root')).render(<ThemeProvider>{location.search.includes('settings')?<AccountSettings/>:<AiHome/>}</ThemeProvider>);`,resolveDir:root,loader:'tsx'},bundle:true,jsx:'automatic',write:false,platform:'browser',format:'iife',define:{'process.env.NODE_ENV':'"test"',__DEV__:'false'},alias:{'react-native':'react-native-web'},loader:{'.png':'dataurl'},resolveExtensions:['.web.tsx','.web.ts','.web.js','.tsx','.ts','.js','.json'],plugins:[{name:'test-boundaries',setup(b){b.onResolve({filter:/.*/},a=>{if(mocks[a.path])return{path:a.path,namespace:'mock'};if(a.path.startsWith('@/'))return{path:path.join(root,'src',a.path.slice(2)+(path.extname(a.path)?'':fs.existsSync(path.join(root,'src',a.path.slice(2)+'.tsx'))?'.tsx':fs.existsSync(path.join(root,'src',a.path.slice(2)+'.ts'))?'.ts':'/index.tsx'))};});b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:mocks[a.path],loader:'tsx',resolveDir:root}));}}]});
 const server=http.createServer((req,res)=>{if(req.url.startsWith('/font-')){const name=req.url.slice(6,-4);if(!fontNames.includes(name)){res.statusCode=404;return res.end();}res.setHeader('Content-Type','font/ttf');return res.end(fs.readFileSync(path.join(root,'node_modules/@expo-google-fonts/poppins',name,'Poppins_'+name+'.ttf')));}
res.setHeader('Content-Type',req.url==='/bundle.js'?'application/javascript':'text/html');res.end(req.url==='/bundle.js'?bundle.outputFiles[0].text:'<html><meta name="viewport" content="width=device-width, initial-scale=1"><style>'+fontCss+'html,body,#root{height:100%}#root{display:flex;flex:1}</style><div id="root"></div><script src="/bundle.js"></script></html>')});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
 try{for(const width of [320,390,430])for(const mode of ['light','dark']){
 const page=await browser.newPage({viewport:{width,height:844}});const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message)});page.on('console',m=>{if(m.type()==='error')console.error(m.text())});
 await page.addInitScript(mode=>localStorage.setItem('star-talks.appearance',mode),mode);
 await page.goto(url);await page.getByText('Vedic Astrology',{exact:true}).waitFor();await page.evaluate(()=>document.fonts.ready);
 const first=await page.getByText('Vedic Astrology',{exact:true}).evaluate(el=>el.parentElement.getBoundingClientRect().toJSON());
 const second=await page.getByText('Tarot',{exact:true}).evaluate(el=>el.parentElement.getBoundingClientRect().toJSON());
 if(Math.abs(first.width-second.width)>1||Math.abs(first.y-second.y)>1||Math.abs(first.x-(width-second.right))>1)throw Error('Unequal grid at '+width+' '+mode+JSON.stringify([first,second]));
 if(errors.length)throw Error(errors.join('\n'));
 await page.screenshot({path:path.join(output,`ai-${mode}-${width}.png`),fullPage:true});
 console.log('PASS AI grid / logo / browser render',width,mode);
 await page.close();}
 const page=await browser.newPage({viewport:{width:390,height:844}});await page.goto(url+'?settings');const toggle=page.getByRole('switch',{name:'Dark mode'});await toggle.waitFor();await toggle.click();await page.waitForFunction(()=>localStorage.getItem('star-talks.appearance')==='dark');await page.reload();await toggle.waitFor();if(!(await toggle.isChecked()))throw Error('Dark preference failed to restore');await page.screenshot({path:path.join(output,'settings-dark.png'),fullPage:true});await toggle.click();await page.waitForFunction(()=>localStorage.getItem('star-talks.appearance')==='light');console.log('PASS settings toggle and restart persistence');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
