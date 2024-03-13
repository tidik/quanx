/***
 * @tidik
 -------------- Quantumult X 配置 --------------
[MITM]
hostname = mole-mmp-scrm.jiajiayue.com
* 家家悦微信小程序
* 3月份签到活动
* 功能：自动签到
*
* 获取CK： 家家悦小程序 -> 3月份签到
*
[rewrite_local]
^https:\/\/mole-mmp-scrm\.jiajiayue\.com\/boss\/boss\/signin\/record\/list url script-request-header https://raw.githubusercontent.com/tidik/quanx/master/script/jjy.js
[task_local]
30 8 * * * https://raw.githubusercontent.com/tidik/quanx/master/script/jjy.js, tag=家家悦签到,enabled=true
 */
const $ = new  API("家家悦签到");
const JJY_TOKEN = "JJY_TOKEN";
const Activity_ID = "2402187cvFhAhp9X";
let KUMI_TOKEN = null;
let PROJECT_ID = null;
const json_body = {
    activityId:Activity_ID
};
async function check_in(){
    let params = $.read( JJY_TOKEN).split('@');
    console.log(JSON.stringify(params));
    KUMI_TOKEN = params[0];
    PROJECT_ID = params[1];
    let req = {
        url:"https://mole-mmp-scrm.jiajiayue.com/boss/boss/signin/record/create",
        headers:{
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            "KUMI-TOKEN":KUMI_TOKEN,
            "PROJECT-ID":PROJECT_ID,
            "PLATFORM":"JIAJIAYUE"
        },
        body:JSON.stringify(json_body)
    }
    try{
        await $.http.post(req).then((resp) =>{
              let body = JSON.parse(resp.body);
              if(body.code == "I1013"){
                  $.log(body.message);
                  $.notify("", `${$.name}失败❌重复签到`, "");
              }else if(body.code == "1"){
                  let data = body.data;
                  if(data.continueNumber == 7 || data.continueNumber == 15){
                      $.notify(`${$.name}签到成功🎉 `, "今天可以去小程序抽奖","");
                  }else{
                      $.notify(`${$.name}签到成功🎉 `, "","");
                  }
              }else{
                  $.notify(`${$.name}未知的错误 `, "","");
              }
          });
      }catch(error){
          console.log(error);
      }
}
function getToken(){
    let kt = $request.headers['KUMI-TOKEN'];
    let pi = $request.headers['PROJECT-ID'];
    if((kt != "") && (pi!= "")){
        let token = kt +"@"+ pi;
        $.write(token, JJY_TOKEN);
        if($.read(JJY_TOKEN)){
            $.notify("家家悦Token获取成功~🎉", "", "");
        }
    }
}
if (isGetCookie = typeof $request !== `undefined`) {
    getToken();
    $.done();
}else{
    !(async()=>{
        await check_in();
        $.done();
    })();
    
}
// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!t,i="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!i,isJSBox:i,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:i,isScriptable:n,isNode:o}=ENV(),r=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;const u={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(l=>u[l.toLowerCase()]=(u=>(function(u,l){l="string"==typeof l?{url:l}:l;const h=e.baseURL;h&&!r.test(l.url||"")&&(l.url=h?h+l.url:l.url);const a=(l={...e,...l}).timeout,c={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...l.events};let f,d;if(c.onRequest(u,l),t)f=$task.fetch({method:u,...l});else if(s||i||o)f=new Promise((e,t)=>{(o?require("request"):$httpClient)[u.toLowerCase()](l,(s,i,n)=>{s?t(s):e({statusCode:i.status||i.statusCode,headers:i.headers,body:n})})});else if(n){const e=new Request(l.url);e.method=u,e.headers=l.headers,e.body=l.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const p=a?new Promise((e,t)=>{d=setTimeout(()=>(c.onTimeout(),t(`${u} URL: ${l.url} exceeds the timeout ${a} ms`)),a)}):null;return(p?Promise.race([p,f]).then(e=>(clearTimeout(d),e)):f).then(e=>c.onResponse(e))})(l,u))),u}function API(e="untitled",t=!1){const{isQX:s,isLoon:i,isSurge:n,isNode:o,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(o){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(i||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),o){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(i||n)&&$persistentStore.write(e,this.name),o&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||i)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);o&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||i?$persistentStore.read(e):s?$prefs.valueForKey(e):o?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||i)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);o&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",l="",h={}){const a=h["open-url"],c=h["media-url"];if(s&&$notify(e,t,l,h),n&&$notification.post(e,t,l+`${c?"\n多媒体:"+c:""}`,{url:a}),i){let s={};a&&(s.openUrl=a),c&&(s.mediaUrl=c),"{}"===JSON.stringify(s)?$notification.post(e,t,l):$notification.post(e,t,l,s)}if(o||u){const s=l+(a?`\n点击跳转: ${a}`:"")+(c?`\n多媒体: ${c}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||i||n?$done(e):o&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}
/*****************************************************************************/