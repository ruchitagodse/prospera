/** GPU fluid wake: velocity advection, vorticity, pressure projection, and dye transport. */
export type FluidWake = {
  resize(width: number, height: number): void;
  splat(x: number, y: number, vx: number, vy: number, strength: number): void;
  step(dt: number, dark: boolean): void;
  clear(): void;
  dispose(): void;
};

const vertex = `#version 300 es
in vec2 aPosition; out vec2 uv;
void main(){uv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;
const common = `#version 300 es
precision highp float;
in vec2 uv;out vec4 result;
vec4 bilerp(sampler2D field,vec2 p,vec2 texel){
  vec2 q=p/texel-.5;vec2 base=floor(q);vec2 f=fract(q);
  return mix(mix(texture(field,(base+.5)*texel),texture(field,(base+vec2(1.5,.5))*texel),f.x),mix(texture(field,(base+vec2(.5,1.5))*texel),texture(field,(base+1.5)*texel),f.x),f.y);
}
`;
const sources = {
  advect: `uniform sampler2D uVelocity;uniform sampler2D uSource;uniform vec2 uVelocityTexel;uniform vec2 uSourceTexel;uniform float uDt;uniform float uDecay;
  void main(){vec2 v=bilerp(uVelocity,uv,uVelocityTexel).xy;vec2 back=uv-uDt*v*uVelocityTexel;result=bilerp(uSource,back,uSourceTexel)*exp(-uDecay*uDt);}`,
  splat: `uniform sampler2D uSource;uniform vec2 uPoint;uniform vec3 uValue;uniform float uAspect;uniform float uRadius;
  void main(){vec2 p=uv-uPoint;p.x*=uAspect;float weight=exp(-dot(p,p)/uRadius);result=texture(uSource,uv)+vec4(uValue*weight,0.);}`,
  curl: `uniform sampler2D uVelocity;uniform vec2 uTexel;
  void main(){float l=texture(uVelocity,uv-vec2(uTexel.x,0.)).y;float r=texture(uVelocity,uv+vec2(uTexel.x,0.)).y;float b=texture(uVelocity,uv-vec2(0.,uTexel.y)).x;float t=texture(uVelocity,uv+vec2(0.,uTexel.y)).x;result=vec4(.5*(r-l-t+b),0.,0.,1.);}`,
  vorticity: `uniform sampler2D uVelocity;uniform sampler2D uCurl;uniform vec2 uTexel;uniform float uDt;uniform float uCurlStrength;
  void main(){float l=texture(uCurl,uv-vec2(uTexel.x,0.)).x;float r=texture(uCurl,uv+vec2(uTexel.x,0.)).x;float b=texture(uCurl,uv-vec2(0.,uTexel.y)).x;float t=texture(uCurl,uv+vec2(0.,uTexel.y)).x;float c=texture(uCurl,uv).x;vec2 force=.5*vec2(abs(t)-abs(b),abs(r)-abs(l));force/=length(force)+.0001;force*=uCurlStrength*c;force.y*=-1.;vec2 velocity=texture(uVelocity,uv).xy+force*uDt;result=vec4(clamp(velocity,vec2(-850.),vec2(850.)),0.,1.);}`,
  divergence: `uniform sampler2D uVelocity;uniform vec2 uTexel;
  void main(){vec2 c=texture(uVelocity,uv).xy;float l=texture(uVelocity,uv-vec2(uTexel.x,0.)).x;float r=texture(uVelocity,uv+vec2(uTexel.x,0.)).x;float b=texture(uVelocity,uv-vec2(0.,uTexel.y)).y;float t=texture(uVelocity,uv+vec2(0.,uTexel.y)).y;if(uv.x<uTexel.x)l=-c.x;if(uv.x>1.-uTexel.x)r=-c.x;if(uv.y<uTexel.y)b=-c.y;if(uv.y>1.-uTexel.y)t=-c.y;result=vec4(.5*(r-l+t-b),0.,0.,1.);}`,
  pressure: `uniform sampler2D uPressure;uniform sampler2D uDivergence;uniform vec2 uTexel;
  void main(){float l=texture(uPressure,uv-vec2(uTexel.x,0.)).x;float r=texture(uPressure,uv+vec2(uTexel.x,0.)).x;float b=texture(uPressure,uv-vec2(0.,uTexel.y)).x;float t=texture(uPressure,uv+vec2(0.,uTexel.y)).x;float d=texture(uDivergence,uv).x;result=vec4((l+r+b+t-d)*.25,0.,0.,1.);}`,
  project: `uniform sampler2D uPressure;uniform sampler2D uVelocity;uniform vec2 uTexel;
  void main(){float l=texture(uPressure,uv-vec2(uTexel.x,0.)).x;float r=texture(uPressure,uv+vec2(uTexel.x,0.)).x;float b=texture(uPressure,uv-vec2(0.,uTexel.y)).x;float t=texture(uPressure,uv+vec2(0.,uTexel.y)).x;result=vec4(texture(uVelocity,uv).xy-vec2(r-l,t-b),0.,1.);}`,
  display: `uniform sampler2D uDye;uniform vec2 uTexel;uniform vec3 uTint;uniform float uOpacity;
  void main(){float density=bilerp(uDye,uv,uTexel).r;vec3 colour=mix(uTint,vec3(1.,.84,.43),clamp(density*.12,0.,.28));float alpha=(1.-exp(-density*.65))*uOpacity;result=vec4(colour,alpha);}`,
};

type BufferTarget = { texture: WebGLTexture; framebuffer: WebGLFramebuffer; width: number; height: number };
type Pair = { read: BufferTarget; write: BufferTarget; swap(): void };
type Program = { value: WebGLProgram; uniforms: Record<string, WebGLUniformLocation> };

export function createFluidWake(canvas: HTMLCanvasElement): FluidWake | null {
  const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
  if (!gl || !gl.getExtension("EXT_color_buffer_float")) return null;
  const programs: Program[] = [];
  const buffers: BufferTarget[] = [];
  const shaders: WebGLShader[] = [];
  const vao = gl.createVertexArray()!;
  const quad = gl.createBuffer()!;
  gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER,quad);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const compile = (type: number, code: string) => {
    const shader=gl.createShader(type)!;gl.shaderSource(shader,code);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw new Error("Fluid shader did not compile");}
    shaders.push(shader);return shader;
  };
  let linked: Record<keyof typeof sources,Program>;
  try {
    const vert=compile(gl.VERTEX_SHADER,vertex);
    linked=Object.fromEntries(Object.entries(sources).map(([name,code])=>{
      const program=gl.createProgram()!;gl.attachShader(program,vert);gl.attachShader(program,compile(gl.FRAGMENT_SHADER,common+code));gl.bindAttribLocation(program,0,"aPosition");gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);throw new Error("Fluid shader did not link");}
      const uniforms: Record<string,WebGLUniformLocation>={};
      const count=gl.getProgramParameter(program,gl.ACTIVE_UNIFORMS);
      for(let i=0;i<count;i++){const uniform=gl.getActiveUniform(program,i)!;uniforms[uniform.name]=gl.getUniformLocation(program,uniform.name)!;}
      const result={value:program,uniforms};programs.push(result);return [name,result];
    })) as Record<keyof typeof sources,Program>;
  } catch {
    shaders.forEach(shader=>gl.deleteShader(shader));programs.forEach(program=>gl.deleteProgram(program.value));gl.deleteBuffer(quad);gl.deleteVertexArray(vao);return null;
  }
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  gl.disable(gl.BLEND);gl.clearColor(0,0,0,0);
  const target = (width:number,height:number):BufferTarget => {
    const texture=gl.createTexture()!,framebuffer=gl.createFramebuffer()!;
    gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,width,height,0,gl.RGBA,gl.HALF_FLOAT,null);
    gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE){gl.deleteTexture(texture);gl.deleteFramebuffer(framebuffer);throw new Error("Fluid buffer unavailable");}
    gl.clear(gl.COLOR_BUFFER_BIT);const value={texture,framebuffer,width,height};buffers.push(value);return value;
  };
  const pair = (w:number,h:number):Pair => ({read:target(w,h),write:target(w,h),swap(){const old=this.read;this.read=this.write;this.write=old;}});
  let velocity:Pair,dye:Pair,pressure:Pair,curl:BufferTarget,divergence:BufferTarget;
  let width=1,height=1,aspect=1,lost=false;
  const destroyBuffers=()=>{buffers.forEach(buffer=>{gl.deleteTexture(buffer.texture);gl.deleteFramebuffer(buffer.framebuffer);});buffers.length=0;};
  const bindProgram=(program:Program)=>{gl.useProgram(program.value);gl.bindVertexArray(vao);};
  const texture=(program:Program,name:string,buffer:BufferTarget,unit:number)=>{gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,buffer.texture);gl.uniform1i(program.uniforms[name],unit);};
  const draw=(buffer:BufferTarget|null)=>{gl.bindFramebuffer(gl.FRAMEBUFFER,buffer?.framebuffer??null);gl.viewport(0,0,buffer?.width??canvas.width,buffer?.height??canvas.height);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);};
  const advect=(field:Pair,dt:number,decay:number)=>{
    const p=linked.advect;bindProgram(p);texture(p,"uVelocity",velocity.read,0);texture(p,"uSource",field.read,1);gl.uniform2f(p.uniforms.uVelocityTexel,1/velocity.read.width,1/velocity.read.height);gl.uniform2f(p.uniforms.uSourceTexel,1/field.read.width,1/field.read.height);gl.uniform1f(p.uniforms.uDt,dt);gl.uniform1f(p.uniforms.uDecay,decay);draw(field.write);field.swap();
  };
  const add=(field:Pair,x:number,y:number,a:number,b:number,c:number,radius:number)=>{
    const p=linked.splat;bindProgram(p);texture(p,"uSource",field.read,0);gl.uniform2f(p.uniforms.uPoint,x,1-y);gl.uniform3f(p.uniforms.uValue,a,b,c);gl.uniform1f(p.uniforms.uAspect,aspect);gl.uniform1f(p.uniforms.uRadius,radius);draw(field.write);field.swap();
  };
  const onLost=(event:Event)=>{event.preventDefault();lost=true;canvas.dataset.engine="unavailable";};
  canvas.addEventListener("webglcontextlost",onLost);
  canvas.dataset.engine="fluid";
  return {
    resize(w,h){
      if(lost)return;width=w;height=h;aspect=w/h;
      const ratio=Math.min(devicePixelRatio||1,1.25);canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
      destroyBuffers();
      const sw=Math.round(128*Math.max(1,aspect)),sh=Math.round(128*Math.max(1,1/aspect));
      const dw=Math.round(400*Math.max(1,aspect)),dh=Math.round(400*Math.max(1,1/aspect));
      velocity=pair(sw,sh);pressure=pair(sw,sh);dye=pair(dw,dh);curl=target(sw,sh);divergence=target(sw,sh);
    },
    splat(x,y,vx,vy,strength){
      if(lost||!velocity)return;
      const radius=Math.max(.001,Math.min(.005,(40/height)**2))*(.5+strength*.45);
      add(velocity,x/width,y/height,Math.max(-420,Math.min(420,vx/width*velocity.read.width*2.1*strength)),Math.max(-420,Math.min(420,-vy/height*velocity.read.height*2.1*strength)),0,radius);
      add(dye,x/width,y/height,.3*strength,.3*strength,.3*strength,radius*.8);
    },
    step(dt,dark){
      if(lost||!velocity)return;
      dt=Math.min(.033,Math.max(.001,dt));
      advect(velocity,dt,1.4);
      let p=linked.curl;bindProgram(p);texture(p,"uVelocity",velocity.read,0);gl.uniform2f(p.uniforms.uTexel,1/curl.width,1/curl.height);draw(curl);
      p=linked.vorticity;bindProgram(p);texture(p,"uVelocity",velocity.read,0);texture(p,"uCurl",curl,1);gl.uniform2f(p.uniforms.uTexel,1/curl.width,1/curl.height);gl.uniform1f(p.uniforms.uDt,dt);gl.uniform1f(p.uniforms.uCurlStrength,9);draw(velocity.write);velocity.swap();
      p=linked.divergence;bindProgram(p);texture(p,"uVelocity",velocity.read,0);gl.uniform2f(p.uniforms.uTexel,1/curl.width,1/curl.height);draw(divergence);
      gl.bindFramebuffer(gl.FRAMEBUFFER,pressure.read.framebuffer);gl.clear(gl.COLOR_BUFFER_BIT);
      p=linked.pressure;bindProgram(p);texture(p,"uDivergence",divergence,1);gl.uniform2f(p.uniforms.uTexel,1/curl.width,1/curl.height);
      for(let i=0;i<12;i++){texture(p,"uPressure",pressure.read,0);draw(pressure.write);pressure.swap();}
      p=linked.project;bindProgram(p);texture(p,"uPressure",pressure.read,0);texture(p,"uVelocity",velocity.read,1);gl.uniform2f(p.uniforms.uTexel,1/curl.width,1/curl.height);draw(velocity.write);velocity.swap();
      advect(dye,dt,2.2);
      p=linked.display;bindProgram(p);texture(p,"uDye",dye.read,0);gl.uniform2f(p.uniforms.uTexel,1/dye.read.width,1/dye.read.height);gl.uniform3f(p.uniforms.uTint,dark?.82:.56,dark?.63:.38,dark?.28:.12);gl.uniform1f(p.uniforms.uOpacity,dark?.52:.27);draw(null);
    },
    clear(){if(lost)return;buffers.forEach(buffer=>{gl.bindFramebuffer(gl.FRAMEBUFFER,buffer.framebuffer);gl.clear(gl.COLOR_BUFFER_BIT);});gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.clear(gl.COLOR_BUFFER_BIT);},
    dispose(){canvas.removeEventListener("webglcontextlost",onLost);destroyBuffers();programs.forEach(p=>gl.deleteProgram(p.value));shaders.forEach(s=>gl.deleteShader(s));gl.deleteBuffer(quad);gl.deleteVertexArray(vao);delete canvas.dataset.engine;},
  };
}
