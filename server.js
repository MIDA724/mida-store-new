const express=require("express");
const fs=require("fs");
const path=require("path");
const crypto=require("crypto");
const app=express();
const PORT=process.env.PORT||3000;
const DB=path.join(__dirname,"orders.json");
app.use(express.json());
app.use(express.static(__dirname));

const packs=[
["3 💎","₹7"],["5 💎","₹9"],["11 💎","₹16"],["22 💎","₹32"],["56 💎","₹80"],["112 💎","₹160"],["223 💎","₹320"],["279 💎","₹400"],["336 💎","₹480"],["570 💎","₹800"],["1163 💎","₹1599"],
["86 💎","₹128"],["172 💎","₹254"],["429 💎","₹621"],["514 💎","₹735"],["600 💎","₹862"],["706 💎","₹998"],["878 💎","₹1251"],["963 💎","₹1365"],["1049 💎","₹1493"],["1412 💎","₹1995"],["2195 💎","₹3019"],["2901 💎","₹4016"],["3688 💎","₹5037"],["5532 💎","₹7604"],["9288 💎","₹12630"],
["Weekly Pass 1×","₹152"],["Weekly Pass 2×","₹304"],["Weekly Pass 3×","₹456"],["Weekly Pass 4×","₹608"],["Weekly Pass +172 💎","₹412"],["Twilight Pass","₹837"]];

function read(){if(!fs.existsSync(DB))fs.writeFileSync(DB,"[]");return JSON.parse(fs.readFileSync(DB,"utf8"))}
function save(x){fs.writeFileSync(DB,JSON.stringify(x,null,2))}
app.get("/api/health",(q,s)=>s.json({ok:true,store:"MIDA STORE",version:"3.0"}));
app.post("/api/player/check",(q,s)=>{
 const {playerId,serverId}=q.body||{};
 if(!/^\d{4,15}$/.test(String(playerId||""))||!/^\d{1,8}$/.test(String(serverId||"")))
   return s.status(400).json({found:false,error:"Enter a valid Player ID and Server ID."});
 s.json({found:false,verificationRequired:true,error:"Player-name verification requires an authorized player-information API."});
});
app.post("/api/orders",(q,s)=>{
 const {playerId,serverId,packageName,price}=q.body||{};
 if(!/^\d{4,15}$/.test(String(playerId||""))||!/^\d{1,8}$/.test(String(serverId||"")))
   return s.status(400).json({error:"Invalid Player ID or Server ID"});
 if(!packs.some(p=>p[0]===packageName&&p[1]===price))
   return s.status(400).json({error:"Invalid package"});
 const o={id:"MIDA-"+crypto.randomBytes(4).toString("hex").toUpperCase(),playerId:String(playerId),serverId:String(serverId),packageName,price,status:"PENDING_PAYMENT",createdAt:new Date().toISOString()};
 const a=read();a.push(o);save(a);s.status(201).json(o);
});
app.get("/api/orders/:id",(q,s)=>{const o=read().find(x=>x.id===q.params.id);o?s.json(o):s.status(404).json({error:"Order not found"})});
app.get("/admin",(q,s)=>s.sendFile(path.join(__dirname,"admin.html")));
app.get("*",(q,s)=>s.sendFile(path.join(__dirname,"index.html")));
app.listen(PORT,()=>console.log("MIDA STORE running on "+PORT));
