
(function(){
  const HANA_DATE_POSTS={"2026-08-25": "posts/whs-01-network-basics/index.html", "2026-08-23": "posts/aws-security-group/index.html", "2026-08-21": "posts/linux-network-tools/index.html", "2026-08-19": "posts/cloud-shared-responsibility/index.html"};

  const root=document.documentElement;
  if(localStorage.getItem("hana-theme")==="dark") root.classList.add("dark");
  document.querySelectorAll("[data-theme]").forEach(btn=>btn.addEventListener("click",()=>{
    root.classList.toggle("dark");
    localStorage.setItem("hana-theme",root.classList.contains("dark")?"dark":"light");
  }));

  document.querySelectorAll("[data-check]").forEach((row,idx)=>{
    const dot=row.querySelector(".today-dot");
    const key="hana-check-"+(row.dataset.slug||idx);
    if(localStorage.getItem(key)==="1") row.classList.add("done");

    if(dot) dot.addEventListener("click",e=>{
      e.preventDefault();
      e.stopPropagation();
      row.classList.toggle("done");
      localStorage.setItem(key,row.classList.contains("done")?"1":"0");
    });

    row.addEventListener("click",e=>{
      // Dedicated links (topic/track/skill/title) keep their own destination.
      if(e.target.closest("a,button")) return;
      const href=row.dataset.href || row.querySelector(".today-title")?.getAttribute("href");
      if(href) window.location.href=href;
    });

    row.setAttribute("tabindex","0");
    row.setAttribute("role","link");
    row.addEventListener("keydown",e=>{
      if(e.key==="Enter"){
        const href=row.dataset.href || row.querySelector(".today-title")?.getAttribute("href");
        if(href) window.location.href=href;
      }
    });
  });

  // Contribution graph: uses local activity data so the static GitHub Pages site works without a backend.
  // Replace window.HANA_CONTRIBUTIONS with actual GitHub data later if desired.
  document.querySelectorAll("[data-contrib-graph]").forEach(box=>{
    const year=Number(box.dataset.year||new Date().getFullYear());
    const data=(window.HANA_CONTRIBUTIONS||[]).filter(x=>String(x.date).startsWith(String(year)));
    const byDate=Object.fromEntries(data.map(x=>[x.date,Number(x.count)||0]));
    const max=Math.max(1,...Object.values(byDate));
    const start=new Date(year,0,1);
    const end=new Date(year,11,31);
    const grid=box.querySelector(".contrib-grid");
    if(!grid)return;

    const sundayOffset=start.getDay();
    const first=new Date(start); first.setDate(start.getDate()-sundayOffset);
    let html="";
    let total=0;
    for(let i=0;i<371;i++){
      const d=new Date(first); d.setDate(first.getDate()+i);
      const iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      const inYear=d.getFullYear()===year;
      const count=inYear?(byDate[iso]||0):0;
      total+=count;
      let level=0;
      if(count>0){
        const ratio=count/max;
        level=ratio<=.25?1:ratio<=.5?2:ratio<=.75?3:4;
      }
      const postHref=HANA_DATE_POSTS[iso]||""; html+=`<span class="contrib-cell${postHref?" has-post":""}" data-level="${level}" data-href="${postHref}" title="${iso} · ${count} contribution${count===1?"":"s"}" style="${inYear?"":"visibility:hidden"}"></span>`;
    }
    grid.innerHTML=html;
    grid.querySelectorAll(".contrib-cell.has-post").forEach(cell=>{
      cell.addEventListener("click",()=>{ if(cell.dataset.href) window.location.href=cell.dataset.href; });
      cell.setAttribute("role","link");
      cell.setAttribute("tabindex","0");
      cell.addEventListener("keydown",e=>{ if(e.key==="Enter" && cell.dataset.href) window.location.href=cell.dataset.href; });
    });
    const totalEl=box.querySelector("[data-contrib-total]");
    if(totalEl) totalEl.textContent=`${total} contributions in ${year}`;
  });

  // Generic 10-per-page pagination
  document.querySelectorAll("[data-paginated-list]").forEach(list=>{
    const items=[...list.children];
    const perPage=10;
    if(items.length<=perPage)return;
    const pager=document.createElement("div");
    pager.className="pagination";
    list.after(pager);
    const pages=Math.ceil(items.length/perPage);
    let current=1;
    function render(){
      items.forEach((el,i)=>el.style.display=(i>=(current-1)*perPage&&i<current*perPage)?"":"none");
      pager.innerHTML="";
      const prev=document.createElement("button"); prev.className="page-btn"; prev.textContent="←"; prev.disabled=current===1; prev.onclick=()=>{current--;render()}; pager.appendChild(prev);
      for(let p=1;p<=pages;p++){
        const b=document.createElement("button"); b.className="page-btn"+(p===current?" active":""); b.textContent=p; b.onclick=()=>{current=p;render()}; pager.appendChild(b);
      }
      const next=document.createElement("button"); next.className="page-btn"; next.textContent="→"; next.disabled=current===pages; next.onclick=()=>{current++;render()}; pager.appendChild(next);
    }
    render();
  });
})();
