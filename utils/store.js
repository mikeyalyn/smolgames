const NAMESPACE = 'tinyArcade';

function k(key){ return `${NAMESPACE}:${key}`; }

export function save(key, value){
  try{ localStorage.setItem(k(key), JSON.stringify(value)); }catch{}
}

export function load(key, fallback=null){
  try{
    const raw = localStorage.getItem(k(key));
    return raw==null ? fallback : JSON.parse(raw);
  }catch{ return fallback; }
}

export function remove(key){
  try{ localStorage.removeItem(k(key)); }catch{}
}

export function wipeAll(){
  try{
    const keys = [];
    for(let i=0;i<localStorage.length;i++){
      const kk = localStorage.key(i);
      if(kk && kk.startsWith(NAMESPACE+':')) keys.push(kk);
    }
    keys.forEach(kk=>localStorage.removeItem(kk));
  }catch{}
}
