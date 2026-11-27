// The arrival illustration is square. Percent coordinates keep each ink line
// attached to its stars when the viewport changes during a slow download.
export type DrawnStar={x:number;y:number};

export function drawLoadingStars(button:HTMLButtonElement){
  const paper=button.querySelector<HTMLElement>(".starlines")!;
  const note=button.querySelector<HTMLElement>(".arrival-note")!;
  const frog=[[23,42],[29,31],[35,27],[39,34],[48,33],[55,25],[62,30],[68,40]];
  const stars:DrawnStar[]=[];
  button.hidden=false;
  button.onclick=e=>{
    if(stars.length===frog.length){paper.replaceChildren();stars.length=0;}
    const count=stars.length,previous=stars[count-1];
    const box=button.getBoundingClientRect();
    const [x,y]=e.detail===0?frog[count]:[(e.clientX-box.left)*100/box.width,(e.clientY-box.top)*100/box.height];
    if(previous){
      const dx=x-previous.x,dy=y-previous.y;
      const thread=document.createElement("i");
      thread.className="thread";
      thread.style.left=previous.x+"%";thread.style.top=previous.y+"%";
      thread.style.width=Math.hypot(dx,dy)+"%";thread.style.transform="rotate("+Math.atan2(dy,dx)+"rad)";
      paper.append(thread);
    }
    const star=document.createElement("i");
    star.className="spark";star.textContent=count%3===0?"✦":"✧";
    star.style.left=x+"%";star.style.top=y+"%";paper.append(star);
    stars.push({x,y});
    note.textContent=stars.length===1?"별 하나":`별 ${stars.length}개를 이었습니다`;
    button.setAttribute("aria-label",note.textContent+". 다음 별 그리기");
  };
  return {stars,finish(){button.onclick=null;button.remove();}};
}
