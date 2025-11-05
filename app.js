(function(){
  const $ = (sel,root=document)=>root.querySelector(sel);
  const $$ = (sel,root=document)=>[...root.querySelectorAll(sel)];

  /* Timestamp */
  const updated = $('#updated');
  const nowISO = new Date().toISOString();
  updated.textContent = nowISO.slice(0,10);
  updated.setAttribute('datetime', nowISO);

  /* Emergency mode toggle */
  const toggleBtn = $('#toggleEmergency');
  toggleBtn?.addEventListener('click', () => {
    document.documentElement.classList.toggle('emergency-mode');
    const state = document.documentElement.classList.contains('emergency-mode');
    toggleBtn.textContent = state ? 'Exit emergency mode' : 'Emergency mode';
    toggleBtn.setAttribute('aria-pressed', String(state));
  });

  /* Print */
  $('#printBtn')?.addEventListener('click', () => window.print());

  /* Copy URL */
  $('#copyURL')?.addEventListener('click', async () => {
    try{ await navigator.clipboard.writeText(location.href); copyToast('Link copied'); }
    catch{ copyToast('Could not copy'); }
  });
  function copyToast(text){
    const t = document.createElement('div');
    Object.assign(t.style,{
      position:'fixed', inset:'auto 16px 16px auto', background:'rgba(0,0,0,.8)', color:'#fff', padding:'8px 10px', borderRadius:'10px', zIndex:9999
    });
    t.textContent = text; document.body.appendChild(t); setTimeout(()=>t.remove(), 1600);
  }

  /* Build QR to this page */
  const url = encodeURIComponent(location.href);
  const qr = $('#qr');
  if(qr){ qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${url}`; $('#urlText').textContent = location.href; }

  /* Helpers to read visible text/links */
  const text = (sel)=>{ const el=$(sel); return el?el.textContent.trim():'' };
  function contactLink(contactIdx, startsWith){
    const contacts = $$('.contacts .contact');
    const c = contacts[contactIdx];
    if(!c) return '';
    const a = c.querySelector(`a[href^="${startsWith}"]`);
    return a ? a.getAttribute('href').replace(startsWith,'') : '';
  }

  /* vCard from visible fields */
  const fullName = text('.name');
  const primaryPhone = contactLink(0,'tel:');
  const primaryEmail = contactLink(0,'mailto:');
  const addressCell = $$('.contacts .contact div').at(-1);
  const address = addressCell ? addressCell.textContent.trim() : '';

  const vcf = [
    'BEGIN:VCARD','VERSION:3.0',
    `FN:${fullName}`,
    primaryPhone?`TEL;TYPE=CELL:${primaryPhone}`:'',
    primaryEmail?`EMAIL:${primaryEmail}`:'',
    address?`ADR;TYPE=HOME:;;${address.replaceAll(',', ';')}`:'',
    `NOTE:ICE page ${location.href}`,
    'END:VCARD'
  ].filter(Boolean).join('\n');

  const vcfBlob = new Blob([vcf], { type: 'text/vcard' });
  const vcfURL = URL.createObjectURL(vcfBlob);
  const save = $('#saveVcf');
  if(save) save.href = vcfURL;
})();
