import { requireSupabase } from '@/lib/supabase';

export type AiMessage = {
  id: string; role: 'user'|'assistant'; kind: 'first'|'question'|'answer'|'clarification'|'redirect'|'blocked'|'error';
  body: string; created_at: string; request_id?: string|null;
  structured_payload?: {
    directAnswer?: string;
    insights?: {title:string;body:string;sourceRefs:string[]}[];
    supportingFactors?: {sourceRef:string;explanation:string}[];
    conflictingFactors?: {sourceRef:string;explanation:string}[];
    timing?: string|null; uncertainty?: string; plainLanguageExplanation?: string;
    followUps?: string[]; sourceRefs?: string[]; recommendedModuleId?: string;
  };
};
export type AiConversation = { id:string; module_id:string; title:string; first_reading_status:string;
  created_at:string; updated_at:string; birth_profile_id?:string|null;
  input_snapshot?: {profileName?:string;tarotCards?:{id:string;cardName:string;orientation:string;position:string}[];warnings?:string[]} };

export type AiCursor = {updatedAt:string;id:string};
type AiResponse = { error?:string; requestId?:string; conversation?:AiConversation; messages?:AiMessage[]; conversations?:AiConversation[]; total?:number; nextCursor?:AiCursor|null; saved?:boolean; deleted?:boolean; title?:string };

export async function aiCall<T extends AiResponse = AiResponse>(action:string, args:Record<string,unknown> = {}):Promise<T> {
  const { data, error } = await requireSupabase().functions.invoke('ai', { body: {action,...args} });
  if (error) {
    const context = (error as {context?:Response}).context;
    if (context?.json) {
      try { const payload = await context.json() as AiResponse; if (payload.error) throw new Error(payload.error); }
      catch (parsedError) { if(parsedError instanceof Error&&parsedError.message!== 'Unexpected end of JSON input') throw parsedError; }
    }
    throw new Error(error.message || 'AI service is unavailable.');
  }
  if ((data as AiResponse)?.error) throw new Error((data as AiResponse).error);
  return data as T;
}
