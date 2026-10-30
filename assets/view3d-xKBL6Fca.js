import{n as e,t}from"./main-CLt387B6.js";import{A as n,B as r,C as i,D as a,E as o,H as s,K as c,M as l,P as u,R as d,S as f,_ as p,d as m,g as h,h as g,i as _,k as v,l as y,m as b,n as x,o as S,p as C,q as w,s as T,t as E,u as D,v as O,x as k,z as A}from"./three.module-BwdZO4ge.js";import{n as j,t as M}from"./RoomEnvironment-D4nbeueH.js";var N=`
uniform sampler2D depthMap;
uniform vec2 texel;
uniform float maxDepth, displace, thick;
varying vec2 vUv;
varying vec3 vWorld;
void main() {
  vUv = uv;
  // 3D reliefs sink the surface itself; PCB grooves are too fine for the mesh and rely on shading.
  // The height is a 3×3 average (~0.15 mm): a wall that shifts by a hair between raster passes would
  // otherwise flip vertices sitting on it between top and floor, drawing a picket fence.
  float h = 0.0;
  for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) h += texture2D(depthMap, uv + vec2(float(i), float(j)) * texel * 1.5).r;
  vec3 p = position;
  // Never below the stock bottom: through-cuts end flat there instead of hanging under the part.
  p.z -= displace * min((1.0 - h / 9.0) * maxDepth, thick);
  vec4 w = modelMatrix * vec4(p, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`,P=`
uniform sampler2D depthMap;
uniform vec2 texel;
uniform float texelMm, maxDepth, thick, metal, displace;
uniform vec3 topColor, cutColor, lightDir;
varying vec2 vUv;
varying vec3 vWorld;
float depthAt(vec2 uv) { return (1.0 - texture2D(depthMap, uv).r) * maxDepth; }
void main() {
  float d = depthAt(vUv);
  bool through = d >= thick - 0.02;
  // Flat (PCB) view: cut-through areas are holes. 3D view: they are drawn at the stock bottom, dark,
  // because discarding pixels of displaced triangles leaves ragged slivers along the cut.
  if (through && displace < 0.5) discard;
  float ddx = (depthAt(vUv + vec2(texel.x, 0.0)) - depthAt(vUv - vec2(texel.x, 0.0))) / (2.0 * texelMm);
  float ddy = (depthAt(vUv + vec2(0.0, texel.y)) - depthAt(vUv - vec2(0.0, texel.y))) / (2.0 * texelMm);
  vec3 n = normalize(vec3(ddx, 1.0, -ddy));
  vec3 V = normalize(cameraPosition - vWorld);
  // On steep walls of displaced (3D) surfaces the texel-scale gradient over-amplifies tiny scallops into
  // stripes; shade those from the displaced geometry instead.
  vec3 gN = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  if (dot(gN, V) < 0.0) gN = -gN;
  n = normalize(mix(n, gN, displace * smoothstep(0.8, 2.5, length(vec2(ddx, ddy)))));
  bool top = d < 0.004;
  vec3 base = top ? topColor : mix(cutColor, cutColor * 0.55, clamp(d / thick, 0.0, 1.0));
  if (through) base = vec3(0.07, 0.08, 0.09);
  vec3 L = normalize(lightDir);
  vec3 H = normalize(L + V);
  float diff = max(dot(n, L), 0.0);
  float shine = top ? metal : 0.05;
  float spec = pow(max(dot(n, H), 0.0), top ? 70.0 : 14.0) * shine;
  float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0) * 0.25 * shine;
  gl_FragColor = vec4(base * (0.32 + 0.78 * diff) + vec3(1.0, 0.86, 0.7) * (spec + fres), 1.0);
  #include <colorspace_fragment>
}`,F=`
uniform sampler2D depthMap;
uniform vec2 texel;
uniform float maxDepth, displace, thick;
attribute float top;
varying vec3 vN;
void main() {
  vec3 p = position;
  if (top > 0.5) {
    float h = 0.0;
    for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) h += texture2D(depthMap, uv + vec2(float(i), float(j)) * texel * 1.5).r;
    p.y -= displace * min((1.0 - h / 9.0) * maxDepth, thick);
  }
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
}`,I=`
uniform vec3 sideColor, lightDir;
varying vec3 vN;
void main() {
  float diff = abs(dot(normalize(vN), normalize(lightDir)));
  gl_FragColor = vec4(sideColor * (0.45 + 0.6 * diff), 1.0);
  #include <colorspace_fragment>
}`,L=class{constructor(e,t,n){this.host=e,this.state=t,this.ev=n,this.showPaths=!0;let r=this.renderer=new x({antialias:!0});r.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),r.shadowMap.enabled=!0,r.shadowMap.type=2,r.toneMapping=4,r.toneMappingExposure=1.05,e.appendChild(r.domElement);let i=this.scene=new A;i.background=new T(`#1a1e22`),i.fog=new g(`#1a1e22`,600,1600),i.environment=new E(r).fromScene(new M,.04).texture,this.camera=new l(38,1,1,5e3),this.controls=new j(this.camera,r.domElement),this.controls.enableDamping=!0,this.controls.dampingFactor=.12,this.controls.maxPolarAngle=Math.PI*.49,this.controls.addEventListener(`change`,()=>this.request()),i.add(new O(`#dfe8ff`,`#2a2420`,.55));let a=this.sun=new m(`#fff4e6`,1.25);a.castShadow=!0,a.shadow.mapSize.set(2048,2048),a.shadow.bias=-4e-4,i.add(a,a.target),this.mats={steel:new v({color:`#d8dde2`,metalness:1,roughness:.18}),carbide:new v({color:`#9aa1a8`,metalness:.9,roughness:.3}),hot:new v({color:`#d8dde2`,metalness:1,roughness:.18,emissive:`#ff9a00`,emissiveIntensity:.35})},this.world=new p,i.add(this.world),this.drawnIdx=0,this.drawnT=0,this.key=``,new ResizeObserver(()=>this.resize()).observe(e),this.loop=this.loop.bind(this),this.needs=!0,requestAnimationFrame(this.loop)}request(){this.needs=!0}resize(){let{width:e,height:t}=this.host.getBoundingClientRect();e&&t&&(this.renderer.setSize(e,t),this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.request())}loop(){if(requestAnimationFrame(this.loop),!this.active)return;let e=this.controls.update();this.burnLeft!=null&&this.burn(this.burnLeft),(this.needs||e)&&(this.needs=!1,this.renderer.render(this.scene,this.camera))}setActive(e){this.active=e,e&&(this.resize(),this.sync())}build(){let{width:e,height:t,thickness:s,preset:l}=this.state.material,f=l===`fr4`;this.world.clear(),this.W=e,this.H=t,this.T=s;let m=Math.max(e,t)+60,g=Math.ceil(m/10)+2,x=new h(g*10,g,`#3b444c`,`#2b3238`);x.position.y=-.05,this.world.add(x);let S=f?`#b7a96a`:l===`acrylic`?`#d7e6ec`:`#cfa877`,C=new a({visible:!1}),E=new v({color:S,roughness:.8}),O=new o(new _(e,s,t),[C,C,C,E,C,C]);O.position.set(0,s/2,0),this.world.add(O);let k=Math.min(20,4096/Math.max(e,t));this.ppm=k,this.fw=Math.round(e*k),this.fh=Math.round(t*k),this.maxDepth=s+.5,this.field=new Float32Array(this.fw*this.fh).fill(1),this.tex?.dispose(),this.tex=new D(this.field,this.fw,this.fh,d,b);let A=this.renderer.extensions.has(`OES_texture_float_linear`)?i:n;this.tex.minFilter=this.tex.magFilter=A,this.tex.generateMipmaps=!1,this.tex.needsUpdate=!0;let j=f?`#d0864a`:l===`acrylic`?`#e6f0f3`:l===`mdf`?`#b98f62`:`#d9b07c`,M=f?`#c2b47a`:l===`acrylic`?`#c9d9de`:`#9f7a52`;this.surfaceMat=new r({vertexShader:N,fragmentShader:P,uniforms:{depthMap:{value:this.tex},texel:{value:new c(1/this.fw,1/this.fh)},texelMm:{value:1/k},maxDepth:{value:this.maxDepth},displace:{value:0},thick:{value:s},metal:{value:f?.9:.12},topColor:{value:new T(j)},cutColor:{value:new T(M)},lightDir:{value:new w(.45,1,.35)}}});let F=e=>Math.min(1024,Math.max(1,Math.round(e*8))),I=new o(new u(e,t,F(e),F(t)),this.surfaceMat);I.rotation.x=-Math.PI/2,I.position.y=s+.001,this.world.add(I),this.world.add(this.buildWalls(e,t,s,F,S)),this.originMark=new p;let L=(e,t)=>{let n=new o(new y(.5,.5,12,8),new a({color:e}));return n.position.copy(t.clone().multiplyScalar(6)),n.quaternion.setFromUnitVectors(new w(0,1,0),t),n};this.originMark.add(L(`#ff5a4a`,new w(1,0,0)),L(`#4fd17f`,new w(0,0,-1)),L(`#5aa9ff`,new w(0,1,0))),this.world.add(this.originMark),this.buildTool(),this.pathLines=null,this.sun.position.set(m*.6,m*1.4,m*.8),Object.assign(this.sun.shadow.camera,{left:-m,right:m,top:m,bottom:-m,near:1,far:m*4}),this.sun.shadow.camera.updateProjectionMatrix(),this.clearDepth(),this.viewPreset(`iso`)}buildWalls(e,t,n,i,a){let s=[],c=[],l=[],u=[],d=[],f=(r,i,a)=>{let o=s.length/3;for(let o=0;o<=r;o++){let[d,f]=i(o/r);for(let r of[0,1])s.push(d*e-e/2,r*n,-(f*t-t/2)),c.push(d,f),l.push(...a),u.push(r)}for(let e=0;e<r;e++){let t=o+e*2;d.push(t,t+2,t+1,t+1,t+2,t+3)}};f(i(e),e=>[e,0],[0,0,1]),f(i(e),e=>[e,1],[0,0,-1]),f(i(t),e=>[0,e],[-1,0,0]),f(i(t),e=>[1,e],[1,0,0]);let p=new S;p.setAttribute(`position`,new C(s,3)),p.setAttribute(`uv`,new C(c,2)),p.setAttribute(`normal`,new C(l,3)),p.setAttribute(`top`,new C(u,1)),p.setIndex(d);let m=this.surfaceMat.uniforms,h=new r({vertexShader:F,fragmentShader:I,side:2,uniforms:{depthMap:m.depthMap,texel:m.texel,maxDepth:m.maxDepth,displace:m.displace,thick:m.thick,lightDir:m.lightDir,sideColor:{value:new T(a)}}});return new o(p,h)}buildTool(){this.bitGroup=new p,this.bitId=void 0,this.world.add(this.bitGroup)}setBit(e){if(this.bitId===e?.id||(this.bitId=e?.id,this.bitGroup.clear(),!e))return;let t=Math.max(e.dia/2,.15),n=new o(new y(1.6,1.6,26,20),this.mats.carbide);n.position.y=17,n.castShadow=!0,this.bitGroup.add(n);let r;if(e.type===`vbit`){let n=Math.max(1,(1.6-t)/Math.tan(e.angle*Math.PI/360));r=new o(new y(1.6,t,Math.min(n,6),20),this.mats.steel),r.position.y=Math.min(n,6)/2}else if(e.type===`ball`){r=new o(new y(t,t,4,20),this.mats.steel),r.position.y=t+2;let e=new o(new s(t,20,12),this.mats.steel);e.position.y=t,this.bitGroup.add(e)}else r=new o(new y(t,t,4,20),this.mats.steel),r.position.y=2;r.castShadow=!0,this.bitGroup.add(r)}placeTool(e,t,n,r){if(!this.bitGroup)return;this.bitGroup.position.set(e-this.W/2,this.T+n,-(t-this.H/2));let{steel:i,hot:a}=this.mats;for(let e of this.bitGroup.children)(e.material===i||e.material===a)&&(e.material=r?a:i)}clearDepth(){this.field?.fill(1),this.drawnIdx=0,this.drawnT=0,this.tex&&(this.tex.needsUpdate=!0)}burn(t){let n=this.state.sim;if(this.burnLeft=null,!n||!n.segs.length)return;let r=performance.now()+25;t<this.drawnT&&this.clearDepth();let[i,a]=this.ev.origin(),o=Math.min(e(n,t),n.segs.length-1);for(let e=this.drawnIdx;e<=o;e++){let o=n.segs[e];if(o.t0>t)break;if(performance.now()>r){this.drawnIdx=e,this.drawnT=t,this.burnLeft=t,this.tex.needsUpdate=!0,this.request();return}let s=o.t1>o.t0?Math.min(1,(t-o.t0)/(o.t1-o.t0)):1,c=o.z0+(o.z1-o.z0)*s;-Math.min(o.z0,c)<=0||this.stamp(n.jobs[o.ji].bit,o.x0+i,o.y0+a,o.z0,o.x0+(o.x1-o.x0)*s+i,o.y0+(o.y1-o.y0)*s+a,c)}let s=this.drawnIdx;for(;s<n.segs.length&&n.segs[s].t1<=t;)s++;this.drawnIdx=s,this.drawnT=t,this.tex.needsUpdate=!0}stamp(e,t,n,r,i,a,o){if(Math.min(r,o)>=0)return;let s=this.field,c=this.fw,l=this.fh,u=this.ppm,d=1/this.maxDepth,f=Math.max(e.dia/2,.5/u),p=e.type===`vbit`,m=e.type!==`ball`&&!p,h=Math.tan((e.angle||60)*Math.PI/360),g=p?e.dia/2-Math.min(r,o)*h:f,_=g*g,v=e.type===`ball`?e=>f-Math.sqrt(Math.max(0,f*f-e)):p?t=>Math.max(0,Math.sqrt(t)-e.dia/2)/h:()=>0,y=i-t,b=a-n,x=Math.hypot(y,b),S=x?y/x:0,C=x?b/x:0,w=o-r,T=x?w/x:0,E=e.type===`ball`,D=1/Math.sqrt(1+T*T),O=T*h,k=Math.abs(O)<1?O/Math.sqrt(1-O*O):null,A=0,j=0,M=e=>{let t=A-e*x,n=j+t*t;return n>_+1e-9?-1/0:-(r+w*e)-v(n)},N=Math.max(0,Math.floor((Math.min(t,i)-g)*u)),P=Math.min(c-1,Math.ceil((Math.max(t,i)+g)*u)),F=Math.max(0,Math.floor((Math.min(n,a)-g)*u)),I=Math.min(l-1,Math.ceil((Math.max(n,a)+g)*u));for(let e=F;e<=I;e++){let i=(e+.5)/u-n;for(let n=N;n<=P;n++){let a=(n+.5)/u-t;if(A=a*S+i*C,j=Math.max(0,a*a+i*i-A*A),j>_)continue;let l;if(x<1e-6){if(a*a+i*i>_)continue;l=-Math.min(r,o)-v(a*a+i*i)}else{let e=Math.sqrt(_-j),t=Math.max(0,(A-e)/x),n=Math.min(1,(A+e)/x);if(t>n)continue;let r=e=>e<t?t:e>n?n:e;m?l=M(w>0?t:n):E?l=M(r((A-T*Math.sqrt(_-j)*D)/x)):(l=Math.max(M(t),M(n),M(r(A/x))),k!==null&&(l=Math.max(l,M(r((A-k*Math.sqrt(j))/x)))))}if(l<=0)continue;let f=1-Math.min(l,this.maxDepth)*d,p=e*c+n;f<s[p]&&(s[p]=f)}}}buildPaths(){this.pathLines&&(this.world.remove(this.pathLines),this.pathLines.geometry.dispose()),this.pathLines=null;let e=this.state.sim;if(!e)return;let[t,n]=this.ev.origin(),r=[];for(let i of e.segs){if(Math.min(i.z0,i.z1)>=0&&!i.rapid)continue;let e=i.rapid?this.T+Math.max(i.z0,.3):this.T+.05;r.push(i.x0+t-this.W/2,e,-(i.y0+n-this.H/2),i.x1+t-this.W/2,i.rapid?this.T+Math.max(i.z1,.3):this.T+.05,-(i.y1+n-this.H/2))}let i=new S;i.setAttribute(`position`,new C(r,3)),this.pathLines=new f(i,new k({color:`#ffb020`,transparent:!0,opacity:.35})),this.pathLines.visible=this.showPaths,this.world.add(this.pathLines)}sync(){if(!this.active)return;let e=this.state.material,n=`${e.width}|${e.height}|${e.thickness}|${e.preset}`;n!==this.key&&(this.key=n,this.build(),this.simRef=null);let r=this.state.sim,i=this.ev.origin().join(`,`);(r!==this.simRef||i!==this.oKey)&&(this.simRef=r,this.oKey=i,this.clearDepth(),this.buildPaths()),this.surfaceMat.uniforms.displace.value=+!!this.state.objects.some(e=>e.kind===`mesh`&&e.visible);let[a,o]=this.ev.origin();this.originMark.position.set(a-this.W/2,this.T+.2,-(o-this.H/2));let s=this.state.simT??r?.total??0;if(r?.segs.length&&this.burn(s),this.state.machinePos&&!(r&&s<r.total)){let[e,t,n]=this.state.machinePos;this.setBit(this.ev.currentBit?.()),this.placeTool(e+a,t+o,n,!1)}else if(r?.segs.length){let e=t(r,Math.min(s,r.total));this.setBit(r.jobs[e.seg.ji].bit),this.placeTool(e.x+a,e.y+o,e.z,e.z<0&&s<r.total)}else this.setBit(this.state.bits[0]),this.placeTool(0,0,this.state.settings.toolChangeZ??15,!1);this.pathLines&&(this.pathLines.visible=this.showPaths),this.request()}viewPreset(e){let t=this.W||100,n=this.H||70,r=this.T||1.6,i=this.camera,a=this.controls.target;a.set(0,r/2,0);let o=i.fov*Math.PI/360,s=Math.atan(Math.tan(o)*i.aspect),c=Math.hypot(t,n,r)/2/Math.sin(Math.min(o,s))*1.08,l=e===`top`?[0,1,1e-4]:e===`front`?[0,.3,1]:[.55,.62,.78];i.position.copy(a).add(new w(...l).normalize().multiplyScalar(c)),i.lookAt(a),this.controls.update(),this.request()}setPathsVisible(e){this.showPaths=e,this.pathLines&&(this.pathLines.visible=e),this.request()}};export{L as View3D};