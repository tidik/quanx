/***
 * @tidik
 -------------- Quantumult X 配置 --------------
[MITM]
hostname = h5.ippzone.com
* 
* 功能：自动签到，自动刮卡
*
* 获取CK： 皮皮搞笑->我的->签到
*
[rewrite_local]
^https:\/\/h5\.ippzone\.com\/spacey\/api\/proxy\?url=(http:\/\/api\.in\.ippzone\.com\/treasure_hunt)/ url script-request-body https://raw.githubusercontent.com/tidik/quanx/master/script/ppgx.js
[task_local]
52 7 * * * https://raw.githubusercontent.com/tidik/quanx/master/script/ppgx.js, tag=皮皮搞笑, img-url=https://raw.githubusercontent.com/tidik/quanx/master/icon/ppgx.png,enabled=true
 */

const $ = new API("皮皮搞笑");
const PPGX_TOKEN = 'PPGX_TOKEN';
const proxyUrl = "https://h5.ippzone.com/spacey/api/proxy?url=";
let con = {
    headers:{
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
}
let kun = {
    level:null,
    length:null,
    cards:[],
    packs:[]
}
function GetCookie(){
	let reqBody = JSON.parse($request.body);
	if(reqBody.token && reqBody.h_did  &&  reqBody.h_m ){
		let  token = reqBody.token+"@"+reqBody.h_did +"@" +reqBody.h_m ;
        $.write(token, PPGX_TOKEN);
        if($.read(PPGX_TOKEN)){
            $.notify("皮皮搞笑", "", "🎉 签到数据获取/更新成功。");
        }
	}
}
async function checkIn(){
    let url = "http://api.in.ippzone.com/treasure_hunt/check_in";
    con.url = proxyUrl+url;
    con.body = JSON.stringify(getBodyParams());
    try {
        let ret = await $.http.post(con);
        const body = JSON.parse(ret.body);
        if(body.ret == -1 ){
            console.log(body.msg);
        }else if(body.ret ==1 ){
            console.log("签到成功");
            $.notify('皮皮搞笑', '🎉签到成功~',msg);
        }
    } catch (error) {
        console.log("错误信息："+error);
    }
}
async function getTreasure(){
    let url = 'http://api.in.ippzone.com/treasure_hunt/hunt_treasure';
    con.url = proxyUrl+url;
    con.body = JSON.stringify(getBodyParams());
    try {
        let ret = await $.http.post(con);
        const body = JSON.parse(ret.body);
        const data = body.data;
        kun.length = data.kun_data.integral;
        kun.level = data.kun_data.level;
        kun.cards = data.kun_data.list;
        console.log("鲲鲲等级："+ kun.level );
        console.log("鲲鲲长度："+kun.length);
    } catch (error) {
        console.log("错误信息(getTreasure)："+error);
    }
}
async function getPckID(){
    let url = 'http://api.in.ippzone.com/treasure_hunt/click';
    con.url = proxyUrl + url;
    let cards = kun.cards;
    if(kun.cards.length != 0){
        for(let Obj of cards){
            con.body = JSON.stringify(getBodyParams(['id',Obj.id],['type',1]));
            try {
                let ret = await $.http.post(con);
                const body = JSON.parse(ret.body);
                if(body.ret == 1){
                    let pack_id = body.data.bubble.pack_id;
                    let cid = body.data.bubble.id;
                    if(pack_id && cid){
                        kun.packs.push([cid,pack_id]);
                    }
                }
            } catch (error) {
                console.log("错误信息(getPckID)："+error);
            }
            
        }
        Object.fromEntries(kun.packs)
    }else{
        $.notify('皮皮搞笑', '', '🎉所有开都开完了~')
    }
}
async function openCard(){
    let url = 'http://api.in.ippzone.com/treasure_hunt/open_box_v2';
    con.url = proxyUrl+url;
    if(kun.packs.length!=0){
        try{
            for(let Arr of kun.packs){
                con.body = JSON.stringify(getBodyParams(['id',Arr[0]],['pack_id',Arr[1]]));
                let ret = await $.http.post(con);
                const body = JSON.parse(ret.body);
                if(body.ret == -1){
                    console.log(body.msg)
                }
                if(body.ret == 1){
                    let data = body.data;
                    let msg = "";
                    data.list.forEach(element => {
                        if(element.name){
                            msg+=element.count+element.unit+element.name+"\n";
                        }
                    });
                        if(msg == ""){
                            $.notify('皮皮搞笑', '', '啥也没开到');
                        }else{
                            $.notify('皮皮搞笑', '🎉开卡成功~',msg);
                        }
                    console.log("----开卡奖励----");
                    console.log(msg);
                }
            }
        }catch(error){
            console.log("错误信息(OpenCard)："+error);
        }
    }
}
function getBodyParams(...arg){
    let params =  $.read( PPGX_TOKEN).split('@');
    let token = params[0];
    let h_did = params[1];
    let h_m =  Number(params[2]);
    let bodyParams = [['token',token],['h_did',h_did],['h_m',h_m]];
    arg.forEach((element)=>bodyParams.push(element));
    return Object.fromEntries(bodyParams);
}
if (isGetCookie = typeof $request !== `undefined`) {
    GetCookie();
    $.done();
}else{
    !(async()=>{
        await Promise.all([
            checkIn(),
            getTreasure() 
        ]);
         await getPckID(); 
         await openCard(); 
         $.done(); 
    })();
}
/***固定区域 */
function ENV(){const e="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:"undefined"!=typeof $task,isLoon:"undefined"!=typeof $loon,isSurge:"undefined"!=typeof $httpClient&&"undefined"!=typeof $utils,isBrowser:"undefined"!=typeof document,isNode:"function"==typeof require&&!e,isJSBox:e,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:o,isScriptable:n,isNode:i,isBrowser:r}=ENV(),u=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;const a={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(h=>a[h.toLowerCase()]=(a=>(function(a,h){h="string"==typeof h?{url:h}:h;const d=e.baseURL;d&&!u.test(h.url||"")&&(h.url=d?d+h.url:h.url),h.body&&h.headers&&!h.headers["Content-Type"]&&(h.headers["Content-Type"]="application/x-www-form-urlencoded");const l=(h={...e,...h}).timeout,c={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...h.events};let f,p;if(c.onRequest(a,h),t)f=$task.fetch({method:a,...h});else if(s||o||i)f=new Promise((e,t)=>{(i?require("request"):$httpClient)[a.toLowerCase()](h,(s,o,n)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:n})})});else if(n){const e=new Request(h.url);e.method=a,e.headers=h.headers,e.body=h.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}else r&&(f=new Promise((e,t)=>{fetch(h.url,{method:a,headers:h.headers,body:h.body}).then(e=>e.json()).then(t=>e({statusCode:t.status,headers:t.headers,body:t.data})).catch(t)}));const y=l?new Promise((e,t)=>{p=setTimeout(()=>(c.onTimeout(),t(`${a} URL: ${h.url} exceeds the timeout ${l} ms`)),l)}):null;return(y?Promise.race([y,f]).then(e=>(clearTimeout(p),e)):f).then(e=>c.onResponse(e))})(h,a))),a}function API(e="untitled",t=!1){const{isQX:s,isLoon:o,isSurge:n,isNode:i,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(i){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),i){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(o||n)&&$persistentStore.write(e,this.name),i&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||o)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);i&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||o?$persistentStore.read(e):s?$prefs.valueForKey(e):i?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||o)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);i&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",a="",h={}){const d=h["open-url"],l=h["media-url"];if(s&&$notify(e,t,a,h),n&&$notification.post(e,t,a+`${l?"\n多媒体:"+l:""}`,{url:d}),o){let s={};d&&(s.openUrl=d),l&&(s.mediaUrl=l),"{}"===JSON.stringify(s)?$notification.post(e,t,a):$notification.post(e,t,a,s)}if(i||u){const s=a+(d?`\n点击跳转: ${d}`:"")+(l?`\n多媒体: ${l}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||o||n?$done(e):i&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}