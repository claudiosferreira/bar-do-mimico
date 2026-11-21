(()=>{
  const cfg=window.APP_CONFIG||{},$=id=>document.getElementById(id);
  const client=window.supabase?.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
  let selected=null,overrides=[],history=[],isAdmin=false;
  const frame=$('site');
  const status=t=>{const el=$('status');if(el)el.textContent=t};
  const setSaveEnabled=enabled=>{const b=$('save');if(b)b.disabled=!enabled};

  function safeSelector(el){
    if(!el||el===el.ownerDocument.body||el===el.ownerDocument.documentElement)return null;
    const parts=[];let node=el;
    while(node&&node.nodeType===1&&node!==node.ownerDocument.body){
      let part=node.tagName.toLowerCase();
      if(node.id){part+='#'+CSS.escape(node.id);parts.unshift(part);break}
      const parent=node.parentElement;
      if(parent){const siblings=[...parent.children].filter(x=>x.tagName===node.tagName);if(siblings.length>1)part+=`:nth-of-type(${siblings.indexOf(node)+1})`}
      parts.unshift(part);node=node.parentElement;
    }
    return parts.join(' > ');
  }
  function pushHistory(){history.push(JSON.stringify(overrides));if(history.length>30)history.shift()}
  function getOverride(selector){return overrides.find(x=>x.selector===selector)||{selector}}
  function rgbHex(v){const m=String(v).match(/\d+/g);if(!m||m.length<3)return '#ffffff';return '#'+m.slice(0,3).map(n=>Number(n).toString(16).padStart(2,'0')).join('')}

  function choose(el){
    if(!el||!el.closest)return;
    const target=el.closest('h1,h2,h3,h4,h5,p,span,a,button,img,small,footer,section,header,article,li');
    if(!target||target===target.ownerDocument.body)return;
    const doc=target.ownerDocument;
    doc.querySelectorAll('.bm-editor-selected').forEach(x=>x.classList.remove('bm-editor-selected'));
    selected=target;selected.classList.add('bm-editor-selected');
    $('editText').value=target.tagName==='IMG'?'':(target.innerText||target.textContent||'').trim();
    $('editBg').value=rgbHex(getComputedStyle(target).backgroundColor);
    $('editColor').value=rgbHex(getComputedStyle(target).color);
    $('editImage').value='';
    status('Selecionado: '+target.tagName.toLowerCase()+' — faça suas alterações.');
  }

  function bindFrame(){
    try{
      const doc=frame.contentDocument;
      if(!doc||!doc.body){status('Aguardando a prévia da loja carregar...');return}
      if(doc.documentElement.dataset.bmEditorBound==='1')return;
      doc.documentElement.dataset.bmEditorBound='1';
      const style=doc.createElement('style');
      style.id='bm-visual-editor-style';
      style.textContent=`html.visual-edit-mode,html.visual-edit-mode *{cursor:crosshair!important} .bm-editor-hover{outline:2px dashed #91b52b!important;outline-offset:2px!important} .bm-editor-selected{outline:3px solid #d8f35c!important;outline-offset:2px!important;position:relative!important}`;
      doc.head.appendChild(style);
      doc.documentElement.classList.add('visual-edit-mode');
      doc.addEventListener('click',e=>{
        const hit=e.target?.closest?.('h1,h2,h3,h4,h5,p,span,a,button,img,small,footer,section,header,article,li');
        if(!hit||hit===doc.body||hit===doc.documentElement)return;
        e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();choose(hit);
      },true);
      doc.addEventListener('mouseover',e=>{
        const el=e.target?.closest?.('h1,h2,h3,h4,h5,p,span,a,button,img,small,footer,section,header,article,li');
        if(el&&el!==doc.body&&el!==doc.documentElement)el.classList.add('bm-editor-hover');
      },true);
      doc.addEventListener('mouseout',e=>{
        const el=e.target?.closest?.('.bm-editor-hover');if(el)el.classList.remove('bm-editor-hover');
      },true);
      doc.querySelectorAll('a').forEach(a=>a.removeAttribute('target'));
      status('Prévia pronta. Clique em um texto ou imagem: o item ficará destacado.');
    }catch(e){status('Não foi possível ativar a seleção: '+e.message)}
  }

  // A seleção da prévia é ativada imediatamente; não depende da autenticação Supabase.
  frame.addEventListener('load',bindFrame);
  if(frame.contentDocument?.readyState==='complete')bindFrame();
  else status('Carregando a prévia da loja...');

  async function start(){
    setSaveEnabled(false);
    if(!client){status('Prévia disponível, mas o Supabase não está configurado para salvar.');return}
    try{
      const {data:{session},error:sessionError}=await client.auth.getSession();
      if(sessionError)throw sessionError;
      if(!session){status('Você pode selecionar elementos. Para salvar, entre no painel administrativo e abra o editor novamente.');return}
      const {data:profile,error:profileError}=await client.from('profiles').select('role').eq('id',session.user.id).maybeSingle();
      if(profileError)throw profileError;
      if(profile?.role!=='admin'){status('Prévia disponível. Somente o administrador pode salvar alterações.');return}
      isAdmin=true;setSaveEnabled(true);
      const {data,error}=await client.from('site_content').select('content').eq('id',1).maybeSingle();
      if(error)throw error;
      overrides=data?.content?.visualOverrides||[];
      status('Editor pronto. Clique em um texto, imagem ou área da prévia para selecionar.');
      if(frame.contentDocument?.readyState==='complete')bindFrame();
    }catch(e){status('A prévia está disponível, mas houve um erro ao validar o acesso: '+e.message)}
  }

  function applyLocal(){
    if(!selected)return status('Primeiro clique em um elemento da página.');
    pushHistory();const selector=safeSelector(selected);let item=getOverride(selector);
    const text=$('editText').value;
    if(['H1','H2','H3','H4','H5','P','SPAN','A','BUTTON','SMALL'].includes(selected.tagName)&&text.trim())item.text=text;
    const bg=$('editBg').value,color=$('editColor').value;
    if(bg!=='#ffffff')item.background=bg;
    if(color!=='#20291c')item.color=color;
    const idx=overrides.findIndex(x=>x.selector===selector);if(idx>=0)overrides[idx]=item;else overrides.push(item);
    paint(item);status('Alteração aplicada na prévia. Clique em salvar e publicar para enviar à loja.');
  }
  function paint(item){if(!selected)return;if(item.text!==undefined)selected.textContent=item.text;if(item.background)selected.style.backgroundColor=item.background;if(item.color)selected.style.color=item.color}

  $('apply').onclick=applyLocal;
  $('clear').onclick=()=>{if(selected)selected.classList.remove('bm-editor-selected');selected=null;$('editText').value='';$('editImage').value='';status('Seleção limpa. Clique em outro elemento.');frame.contentDocument?.querySelectorAll('.bm-editor-hover').forEach(el=>el.classList.remove('bm-editor-hover'))};
  $('editImage').onchange=async()=>{
    if(!selected||selected.tagName!=='IMG')return status('Para trocar uma foto, clique diretamente nela primeiro.');
    const file=$('editImage').files[0];if(!file)return;
    if(!isAdmin)return status('Entre como administrador para enviar e salvar imagens.');
    try{status('Enviando imagem...');const path=`site/visual-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;const {error}=await client.storage.from('product-images').upload(path,file,{upsert:true});if(error)throw error;const url=client.storage.from('product-images').getPublicUrl(path).data.publicUrl;pushHistory();const selector=safeSelector(selected),item={...getOverride(selector),image:url};const idx=overrides.findIndex(x=>x.selector===selector);if(idx>=0)overrides[idx]=item;else overrides.push(item);selected.src=url;status('Imagem aplicada na prévia. Publique para atualizar a loja.')}catch(e){status('Falha ao enviar imagem: '+e.message)}
  };
  $('save').onclick=async()=>{
    if(!isAdmin)return status('Somente o administrador pode publicar alterações.');
    try{status('Publicando alterações...');const {data,error}=await client.from('site_content').select('content').eq('id',1).maybeSingle();if(error)throw error;const content={...(data?.content||{}),visualOverrides:overrides};const {error:saveError}=await client.from('site_content').upsert({id:1,content,updated_at:new Date().toISOString()});if(saveError)throw saveError;status('Publicado! A loja pública já pode receber as alterações.');frame.contentWindow.location.reload()}catch(e){status('Erro ao publicar: '+e.message)}
  };
  $('undo').onclick=()=>{if(!history.length)return status('Não há alterações para desfazer.');overrides=JSON.parse(history.pop());frame.contentWindow.location.reload();status('Última alteração desfeita. Salve para publicar.')};
  $('desktop').onclick=()=>document.querySelector('.preview').classList.remove('mobile');
  $('mobile').onclick=()=>document.querySelector('.preview').classList.add('mobile');
  $('refresh').onclick=()=>frame.contentWindow.location.reload();
  start();
})();
