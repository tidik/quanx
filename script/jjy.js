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

//check_in()
/***固定区域 */
function ENV(){const e="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:"undefined"!=typeof $task,isLoon:"undefined"!=typeof $loon,isSurge:"undefined"!=typeof $httpClient&&"undefined"!=typeof $utils,isBrowser:"undefined"!=typeof document,isNode:"function"==typeof require&&!e,isJSBox:e,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:o,isScriptable:n,isNode:i,isBrowser:r}=ENV(),u=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;const a={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(h=>a[h.toLowerCase()]=(a=>(function(a,h){h="string"==typeof h?{url:h}:h;const d=e.baseURL;d&&!u.test(h.url||"")&&(h.url=d?d+h.url:h.url),h.body&&h.headers&&!h.headers["Content-Type"]&&(h.headers["Content-Type"]="application/x-www-form-urlencoded");const l=(h={...e,...h}).timeout,c={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...h.events};let f,p;if(c.onRequest(a,h),t)f=$task.fetch({method:a,...h});else if(s||o||i)f=new Promise((e,t)=>{(i?require("request"):$httpClient)[a.toLowerCase()](h,(s,o,n)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:n})})});else if(n){const e=new Request(h.url);e.method=a,e.headers=h.headers,e.body=h.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}else r&&(f=new Promise((e,t)=>{fetch(h.url,{method:a,headers:h.headers,body:h.body}).then(e=>e.json()).then(t=>e({statusCode:t.status,headers:t.headers,body:t.data})).catch(t)}));const y=l?new Promise((e,t)=>{p=setTimeout(()=>(c.onTimeout(),t(`${a} URL: ${h.url} exceeds the timeout ${l} ms`)),l)}):null;return(y?Promise.race([y,f]).then(e=>(clearTimeout(p),e)):f).then(e=>c.onResponse(e))})(h,a))),a}function API(e="untitled",t=!1){const{isQX:s,isLoon:o,isSurge:n,isNode:i,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(i){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),i){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(o||n)&&$persistentStore.write(e,this.name),i&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||o)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);i&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||o?$persistentStore.read(e):s?$prefs.valueForKey(e):i?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||o)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);i&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",a="",h={}){const d=h["open-url"],l=h["media-url"];if(s&&$notify(e,t,a,h),n&&$notification.post(e,t,a+`${l?"\n多媒体:"+l:""}`,{url:d}),o){let s={};d&&(s.openUrl=d),l&&(s.mediaUrl=l),"{}"===JSON.stringify(s)?$notification.post(e,t,a):$notification.post(e,t,a,s)}if(i||u){const s=a+(d?`\n点击跳转: ${d}`:"")+(l?`\n多媒体: ${l}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||o||n?$done(e):i&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}