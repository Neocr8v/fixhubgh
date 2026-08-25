"use strict";(()=>{var e={};e.id=800,e.ids=[800],e.modules={72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{e.exports=require("buffer")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},80665:e=>{e.exports=require("dns")},17702:e=>{e.exports=require("events")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},98216:e=>{e.exports=require("net")},85861:e=>{e.exports=require("node:sqlite")},19801:e=>{e.exports=require("os")},55315:e=>{e.exports=require("path")},76162:e=>{e.exports=require("stream")},82452:e=>{e.exports=require("tls")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},6005:e=>{e.exports=require("node:crypto")},52888:(e,t,s)=>{s.r(t),s.d(t,{originalPathname:()=>g,patchFetch:()=>L,requestAsyncStorage:()=>m,routeModule:()=>h,serverHooks:()=>N,staticGenerationAsyncStorage:()=>_});var r={};s.r(r),s.d(r,{GET:()=>T,PATCH:()=>E});var n=s(49303),i=s(88716),o=s(60670),a=s(87070),u=s(42549),l=s(9487),d=s(90455),c=s(33870),p=s(53710);async function T(e,{params:t}){let s=(0,d.ts)();if(!s)return a.NextResponse.json({error:"Not signed in."},{status:401});let r=l.db.prepare("SELECT * FROM issues WHERE id = ?").get(t.id);if(!r)return a.NextResponse.json({error:"Issue not found."},{status:404});if("admin"!==s.role&&("student"===s.role?r.student_id!==s.id:"technician"!==s.role||r.technician_id!==s.id))return a.NextResponse.json({error:"Not authorized to view this issue."},{status:403});let n=l.db.prepare("SELECT * FROM updates WHERE issue_id = ? ORDER BY created_at ASC").all(r.id).flatMap(e=>{let t=e.actor_id?(0,d.GA)(e.actor_id):void 0;return"student"===s.role&&t?.role==="admin"?[]:[{...e,actor_name:t?.name??"System"}]}),i=(0,d.GA)(r.student_id),o=r.technician_id?(0,d.GA)(r.technician_id):void 0;return a.NextResponse.json({issue:{...r,student_name:i?.name,technician_name:o?.name??null},updates:n})}async function E(e,{params:t}){let s=(0,d.ts)();if(!s)return a.NextResponse.json({error:"Not signed in."},{status:401});let r=l.db.prepare("SELECT * FROM issues WHERE id = ?").get(t.id);if(!r)return a.NextResponse.json({error:"Issue not found."},{status:404});let{technicianId:n,status:i,priority:o,message:T}=await e.json().catch(()=>({})),E=[];if(void 0!==n){if("admin"!==s.role)return a.NextResponse.json({error:"Only administrators can assign technicians."},{status:403});let e=(0,d.GA)(n);if(!e||"technician"!==e.role)return a.NextResponse.json({error:"Invalid technician."},{status:400});l.db.prepare("UPDATE issues SET technician_id = ?, status = CASE WHEN status = 'reported' THEN 'assigned' ELSE status END WHERE id = ?").run(n,r.id),E.push(`Assigned to ${e.name} (${e.specialty??"General"}).`)}if(void 0!==o){if("admin"!==s.role)return a.NextResponse.json({error:"Only administrators can change priority."},{status:403});l.db.prepare("UPDATE issues SET priority = ? WHERE id = ?").run(o,r.id),E.push(`Priority set to ${o}.`)}if(void 0!==i){if(!c.bV.includes(i))return a.NextResponse.json({error:"Invalid status."},{status:400});let e="technician"===s.role&&r.technician_id===s.id;if("admin"!==s.role&&!e)return a.NextResponse.json({error:"Not authorized to change status."},{status:403});let t=null,n=i;"technician"===s.role&&"resolved"===i&&(n="review"),"resolved"===n&&(t=new Date().toISOString()),l.db.prepare("UPDATE issues SET status = ?, resolved_at = ? WHERE id = ?").run(n,t,r.id),"technician"===s.role&&"resolved"===i?E.push("Submitted work for admin approval."):E.push(`Status updated to "${n.replace("_"," ")}".`)}if(T&&T.trim()&&E.push(T.trim()),0===E.length)return a.NextResponse.json({error:"No changes supplied."},{status:400});l.db.prepare("UPDATE issues SET updated_at = datetime('now') WHERE id = ?").run(r.id);let h=l.db.prepare("INSERT INTO updates (id, issue_id, actor_id, message) VALUES (?, ?, ?, ?)");for(let e of E)h.run(`up_${(0,u.x0)(10)}`,r.id,s.id,e);let m=l.db.prepare("SELECT * FROM issues WHERE id = ?").get(r.id),_=(0,d.GA)(m.student_id),N=m.technician_id?(0,d.GA)(m.technician_id):void 0,g=`HostelCare: Update for ${m.ticket_no}`,L=E.join(" "),A=`Hello ${_?.name??"Student"},

There is an update on your issue ${m.ticket_no}:

${L}

Title: ${m.title}
Status: ${m.status.replace("_"," ")}
Room: ${m.room} (${m.hostel})

Visit the portal to see the latest details.

Best,
HostelCare Team`,R=`<p>Hello ${_?.name??"Student"},</p><p>There is an update on your issue <strong>${m.ticket_no}</strong>:</p><p>${L}</p><p><strong>Title:</strong> ${m.title}<br/><strong>Status:</strong> ${m.status.replace("_"," ")}<br/><strong>Room:</strong> ${m.room} (${m.hostel})</p><p>Visit the portal to see the latest details.</p><p>Best,<br/>HostelCare Team</p>`;if(_?.email&&(0,p.C)({to:_.email,subject:g,text:A,html:R}).catch(e=>{console.error("Failed to send update email to student:",e)}),N?.email&&(void 0!==n||void 0!==i)){let e=`Hello ${N.name},

A ticket has been updated that you are assigned to or need to know about:

${L}

Ticket: ${m.ticket_no}
Title: ${m.title}
Status: ${m.status.replace("_"," ")}
Room: ${m.room} (${m.hostel})

View the ticket for more details.

Best,
HostelCare Team`,t=`<p>Hello ${N.name},</p><p>A ticket has been updated that you are assigned to or need to know about:</p><p>${L}</p><p><strong>Ticket:</strong> ${m.ticket_no}<br/><strong>Title:</strong> ${m.title}<br/><strong>Status:</strong> ${m.status.replace("_"," ")}<br/><strong>Room:</strong> ${m.room} (${m.hostel})</p><p>View the ticket for more details.</p><p>Best,<br/>HostelCare Team</p>`;(0,p.C)({to:N.email,subject:g,text:e,html:t}).catch(e=>{console.error("Failed to send update email to technician:",e)})}return a.NextResponse.json({issue:m})}let h=new n.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/issues/[id]/route",pathname:"/api/issues/[id]",filename:"route",bundlePath:"app/api/issues/[id]/route"},resolvedPagePath:"/Users/tony/Downloads/fixhubgh/app/api/issues/[id]/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:m,staticGenerationAsyncStorage:_,serverHooks:N}=h,g="/api/issues/[id]/route";function L(){return(0,o.patchFetch)({serverHooks:N,staticGenerationAsyncStorage:_})}},90455:(e,t,s)=>{s.d(t,{CX:()=>T,GA:()=>E,Rf:()=>d,Uj:()=>l,ax:()=>p,ts:()=>c});var r=s(41482),n=s.n(r),i=s(71615),o=s(9487);let a=process.env.SESSION_SECRET||"hostel-maintenance-dev-secret-change-me",u="hostel_session";function l(e){let t=n().sign(e,a,{expiresIn:"7d"});(0,i.cookies)().set(u,t,{httpOnly:!0,sameSite:"lax",path:"/",maxAge:604800})}function d(){(0,i.cookies)().set(u,"",{path:"/",maxAge:0})}function c(){let e=i.cookies().get(u)?.value;if(!e)return null;try{let t=n().verify(e,a),s=E(t.id);if(!s||1!==s.is_active)return null;return p(s)}catch{return null}}function p(e){return{id:e.id,name:e.name,email:e.email,role:e.role,room:e.room,hostel:e.hostel,specialty:e.specialty,avatar_url:e.avatar_url,phone:e.phone,bio:e.bio,is_active:e.is_active}}function T(e){return o.db.prepare("SELECT * FROM users WHERE email = ?").get(e)}function E(e){return o.db.prepare("SELECT * FROM users WHERE id = ?").get(e)}},47090:(e,t,s)=>{s.d(t,{aA:()=>r,bV:()=>i,tb:()=>n});let r=["Electrical","Plumbing","Internet","Furniture","Pest Control","Cleaning","Other"],n=["Main","North","South","East","West","Annex"],i=["reported","assigned","in_progress","review","resolved"]},9487:(e,t,s)=>{s.d(t,{db:()=>E});var r=s(85861),n=s(55315),i=s.n(n),o=s(92048),a=s.n(o),u=s(42023),l=s.n(u),d=s(42549),c=s(47090);let p=i().join(process.cwd(),"data");a().existsSync(p)||a().mkdirSync(p,{recursive:!0});let T=i().join(p,"hostel.db"),E=global.__hostelDb??function(){let e=new r.DatabaseSync(T);return e.exec("PRAGMA journal_mode = WAL;"),e}();!function(){E.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('student','admin','technician')),
      room TEXT,
      hostel TEXT,
      specialty TEXT,
      avatar_url TEXT,
      phone TEXT,
      bio TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS hostels (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      ticket_no TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'normal',
      status TEXT NOT NULL DEFAULT 'reported',
      room TEXT NOT NULL,
      image_data TEXT,
      student_id TEXT NOT NULL,
      technician_id TEXT,
      duplicate_of TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      resolved_at TEXT,
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (technician_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS updates (
      id TEXT PRIMARY KEY,
      issue_id TEXT NOT NULL,
      actor_id TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (issue_id) REFERENCES issues(id)
    );

    CREATE INDEX IF NOT EXISTS idx_issues_student ON issues(student_id);
    CREATE INDEX IF NOT EXISTS idx_issues_tech ON issues(technician_id);
    CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
    CREATE INDEX IF NOT EXISTS idx_updates_issue ON updates(issue_id);
  `);let e=E.prepare("PRAGMA table_info(users)").all();if(e.some(e=>"is_active"===e.name)||E.exec("ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;"),e.some(e=>"avatar_url"===e.name)||E.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT;"),e.some(e=>"phone"===e.name)||E.exec("ALTER TABLE users ADD COLUMN phone TEXT;"),e.some(e=>"bio"===e.name)||E.exec("ALTER TABLE users ADD COLUMN bio TEXT;"),e.some(e=>"hostel"===e.name)||E.exec("ALTER TABLE users ADD COLUMN hostel TEXT;"),0===E.prepare("SELECT COUNT(*) as c FROM hostels").get().c){let e=E.prepare("INSERT INTO hostels (id, name) VALUES (?, ?)");for(let t of c.tb)e.run(`h_${(0,d.x0)(10)}`,t)}if(E.prepare("PRAGMA table_info(issues)").all().some(e=>"hostel"===e.name)||E.exec("ALTER TABLE issues ADD COLUMN hostel TEXT NOT NULL DEFAULT 'Main';"),0===E.prepare("SELECT COUNT(*) as c FROM users").get().c){let e=E.prepare("INSERT INTO users (id, name, email, password_hash, role, room, hostel, specialty, avatar_url, phone, bio, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"),t=e=>l().hashSync(e,10);e.run("u_admin","Dara Whitfield","admin@hostel.edu",t("admin123"),"admin",null,null,null,null,null,null,1),e.run("u_tech1","Marcus Reid","marcus.reid@hostel.edu",t("tech123"),"technician",null,null,"Electrical",null,null,null,1),e.run("u_tech2","Ines Okafor","ines.okafor@hostel.edu",t("tech123"),"technician",null,null,"Plumbing",null,null,null,1),e.run("u_tech3","Sam Lindqvist","sam.lindqvist@hostel.edu",t("tech123"),"technician",null,null,"General/Furniture",null,null,null,1),e.run("u_student1","Priya Nandan","priya.n@student.edu",t("student123"),"student","B-214","Main",null,null,null,null,1),e.run("u_student2","Tom Achebe","tom.a@student.edu",t("student123"),"student","A-108","North",null,null,null,null,1);let s=new Date,r=e=>{let t=new Date(s);return t.setDate(t.getDate()-e),t.toISOString().slice(0,19).replace("T"," ")},n=E.prepare(`
      INSERT INTO issues (id, ticket_no, title, description, category, priority, status, room, hostel, student_id, technician_id, created_at, updated_at, resolved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);for(let e of[["i1","HM-0001","Flickering ceiling light","The ceiling light in the room flickers constantly and buzzes at night.","Electrical","normal","resolved","B-214","Main","u_student1","u_tech1",9,7,7],["i2","HM-0002","Leaking sink pipe","Water is pooling under the bathroom sink every morning.","Plumbing","high","in_progress","A-108","North","u_student2","u_tech2",5,2,null],["i3","HM-0003","No internet connection","Ethernet port in the room has had no connection for two days.","Internet","urgent","assigned","B-214","Main","u_student1","u_tech3",3,1,null],["i4","HM-0004","Broken wardrobe hinge","One door of the wardrobe has fallen off its hinge.","Furniture","low","reported","A-108","South","u_student2",null,1,1,null],["i5","HM-0005","Power socket not working","The socket near the desk has stopped supplying power.","Electrical","normal","resolved","B-214","Main","u_student1","u_tech1",14,12,12],["i6","HM-0006","Blocked drain in shower","Shower drains very slowly and water backs up.","Plumbing","high","resolved","A-108","North","u_student2","u_tech2",11,9,9]])n.run(e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9],e[10],r(e[11]),r(e[12]),null!==e[13]?r(e[13]):null);let i=E.prepare("INSERT INTO updates (id, issue_id, actor_id, message, created_at) VALUES (?, ?, ?, ?, ?)");i.run("up1","i1","u_student1","Issue reported by student.",r(9)),i.run("up2","i1","u_admin","Assigned to Marcus Reid (Electrical).",r(8)),i.run("up3","i1","u_tech1","Replaced faulty ballast. Marked resolved.",r(7)),i.run("up4","i2","u_student2","Issue reported by student.",r(5)),i.run("up5","i2","u_admin","Assigned to Ines Okafor (Plumbing).",r(4)),i.run("up6","i2","u_tech2","Inspected pipe, ordering replacement gasket.",r(2)),i.run("up7","i3","u_student1","Issue reported by student. Flagged urgent — needed for coursework.",r(3)),i.run("up8","i3","u_admin","Assigned to Sam Lindqvist.",r(1)),i.run("up9","i4","u_student2","Issue reported by student.",r(1))}}()},33870:(e,t,s)=>{s.d(t,{Xw:()=>l,aA:()=>n.aA,bV:()=>n.bV,e3:()=>a,uj:()=>u});var r=s(9487),n=s(47090);let i=["fire","smoke","gas leak","gas smell","flood","flooding","sparking","spark","electric shock","shock","exposed wire","no water","ceiling collapse","burst pipe","burning smell","carbon monoxide","no power","security","break in","broken lock","can't lock"],o=["leak","leaking","not working","broken","no internet","no heat","no hot water","mold","mould","infestation","pest","cockroach","bed bug"];function a(e,t){let s=`${e} ${t}`.toLowerCase();return i.some(e=>s.includes(e))?"urgent":o.some(e=>s.includes(e))?"high":"normal"}function u(){let e=r.db.prepare("SELECT ticket_no FROM issues").all(),t=0;for(let s of e){let e=s.ticket_no.match(/(\d+)$/);e&&(t=Math.max(t,parseInt(e[1],10)))}return`HM-${String(t+1).padStart(4,"0")}`}function l(e,t,s,n){let i=r.db.prepare("SELECT * FROM issues WHERE category = ? AND status != 'resolved' AND id != COALESCE(?, '') ORDER BY created_at DESC LIMIT 25").all(t,n??null),o=new Set(s.toLowerCase().split(/\W+/).filter(e=>e.length>3));return i.filter(t=>{let s=t.room===e,r=new Set(t.title.toLowerCase().split(/\W+/).filter(e=>e.length>3)),n=0;r.forEach(e=>{o.has(e)&&n++});let i=n>=1&&n/Math.max(o.size,1)>=.34;return s||i})}},53710:(e,t,s)=>{s.d(t,{C:()=>d});var r=s(55245);let n=process.env.SMTP_HOST??"",i=process.env.SMTP_PORT?Number(process.env.SMTP_PORT):0,o=process.env.SMTP_USER??"",a=process.env.SMTP_PASS??"",u=process.env.EMAIL_FROM??"HostelCare <noreply@hostelcare.local>",l=n&&i&&o&&a?r.createTransport({host:n,port:i,secure:465===i,auth:{user:o,pass:a}}):null;async function d({to:e,subject:t,text:s,html:r}){if(!l){console.log("Email skipped because SMTP is not configured:",{to:e,subject:t,text:s,html:r});return}await l.sendMail({from:u,to:e,subject:t,text:s,html:r})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[276,323,261,972,245],()=>s(52888));module.exports=r})();