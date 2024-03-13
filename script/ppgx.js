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
// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!t,i="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!i,isJSBox:i,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:i,isScriptable:n,isNode:o}=ENV(),r=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;const u={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(l=>u[l.toLowerCase()]=(u=>(function(u,l){l="string"==typeof l?{url:l}:l;const h=e.baseURL;h&&!r.test(l.url||"")&&(l.url=h?h+l.url:l.url);const a=(l={...e,...l}).timeout,c={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...l.events};let f,d;if(c.onRequest(u,l),t)f=$task.fetch({method:u,...l});else if(s||i||o)f=new Promise((e,t)=>{(o?require("request"):$httpClient)[u.toLowerCase()](l,(s,i,n)=>{s?t(s):e({statusCode:i.status||i.statusCode,headers:i.headers,body:n})})});else if(n){const e=new Request(l.url);e.method=u,e.headers=l.headers,e.body=l.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const p=a?new Promise((e,t)=>{d=setTimeout(()=>(c.onTimeout(),t(`${u} URL: ${l.url} exceeds the timeout ${a} ms`)),a)}):null;return(p?Promise.race([p,f]).then(e=>(clearTimeout(d),e)):f).then(e=>c.onResponse(e))})(l,u))),u}function API(e="untitled",t=!1){const{isQX:s,isLoon:i,isSurge:n,isNode:o,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(o){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(i||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),o){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(i||n)&&$persistentStore.write(e,this.name),o&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||i)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);o&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||i?$persistentStore.read(e):s?$prefs.valueForKey(e):o?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||i)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);o&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",l="",h={}){const a=h["open-url"],c=h["media-url"];if(s&&$notify(e,t,l,h),n&&$notification.post(e,t,l+`${c?"\n多媒体:"+c:""}`,{url:a}),i){let s={};a&&(s.openUrl=a),c&&(s.mediaUrl=c),"{}"===JSON.stringify(s)?$notification.post(e,t,l):$notification.post(e,t,l,s)}if(o||u){const s=l+(a?`\n点击跳转: ${a}`:"")+(c?`\n多媒体: ${c}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||i||n?$done(e):o&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}
/*****************************************************************************/