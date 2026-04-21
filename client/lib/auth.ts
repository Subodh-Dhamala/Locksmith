let _accessToken: string | null = null;

export const getToken = ()=> _accessToken;

export const setTokenRef = (t:string | null)=>{
  _accessToken = t;
}