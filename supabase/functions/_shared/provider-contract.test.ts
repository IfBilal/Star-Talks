import { generateAnswer, moderate, observeImage, generateCompatibility, summarizeConversation } from './openai.ts';
const assert=(condition:unknown,message:string)=>{if(!condition)throw new Error(message);};
async function rejects(run:()=>Promise<unknown>, message:string){try{await run();}catch(error){assert(error instanceof Error&&error.message.includes(message),String(error));return;}throw new Error('Expected rejection: '+message);}
const response=(value:unknown)=>({output:[{content:[{type:'output_text',text:JSON.stringify(value)}]}]});
const args={moduleId:'tarot' as const,evidence:{cards:['one']},allowedSourceRefs:['card:one'],question:'Career?',history:[],summary:'',language:'English',first:false};
const answer={directAnswer:'A symbolic suggestion.',insights:[],supportingFactors:[{sourceRef:'card:one',explanation:'The actual drawn card.'}],conflictingFactors:[],timing:null,uncertainty:'Not a prediction.',plainLanguageExplanation:'A reflection.',followUps:['What would you like to explore?'],sourceRefs:['card:one']};
Deno.test('Provider contracts fail closed without live credentials or network',async()=>{
  const originalFetch=globalThis.fetch;const originalKey=Deno.env.get('OPENAI_API_KEY');
  Deno.env.set('OPENAI_API_KEY','local-contract-test-not-a-real-key');
  let output:unknown={};let status=200;const requests:Array<Record<string,unknown>>=[];
  globalThis.fetch=async(_url,init)=>{requests.push(JSON.parse(String(init?.body)));return new Response(JSON.stringify(output),{status});};
  try{
    await rejects(()=>moderate('test'),'safety checks');
    output={results:[{flagged:false,categories:{}}]};assert((await moderate('test')).flagged===false,'Valid verdict');
    output={results:[{flagged:true}]};assert((await moderate('test')).flagged===true,'Flagged verdict');
    status=429;await rejects(()=>moderate('test'),'429');status=200;
    output=response(answer);const valid=await generateAnswer(args);assert(valid.answer.directAnswer===answer.directAnswer,'Valid answer');
    const sent=requests.at(-1)!;assert(sent.store===false&&sent.model==='gpt-4o-mini','Privacy/model contract');
    output=response({...answer,sourceRefs:['invented:chart']});await rejects(()=>generateAnswer(args),'not supplied');
    for(const bad of [null,{...answer,conflictingFactors:null},{...answer,directAnswer:42},{...answer,followUps:[{}]}]){output=response(bad);await rejects(()=>generateAnswer(args),'incomplete');}
    output={output:[{content:[{type:'refusal',refusal:'No'}]}]};await rejects(()=>generateAnswer(args),'readable answer');
    output=response({quality:'blurred',retakeReason:'Please retake in daylight.',observations:[]});assert(Boolean((await observeImage('palm','https://example.invalid/private')).retakeReason),'Retake preserved');
    output=response({quality:'clear',retakeReason:null,observations:[{id:'x'}]});await rejects(()=>observeImage('palm','https://example.invalid/private'),'invalid');
    output=response({overview:'x',strengths:[],challenges:[],dynamics:'x',longTermOutlook:'x',timing:null});await rejects(()=>generateCompatibility({method:'tarot',relationshipType:'love',firstName:'A',secondName:'B',factors:[],warnings:[],language:'English'}),'supplied factors');
    output=response({summary:'x',userFacts:[null],openQuestions:[]});await rejects(()=>summarizeConversation('',[]),'invalid');
  }finally{globalThis.fetch=originalFetch;if(originalKey)Deno.env.set('OPENAI_API_KEY',originalKey);else Deno.env.delete('OPENAI_API_KEY');}
});
