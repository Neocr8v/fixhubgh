"use strict";(()=>{var e={};e.id=744,e.ids=[744],e.modules={72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},92048:e=>{e.exports=require("fs")},85861:e=>{e.exports=require("node:sqlite")},55315:e=>{e.exports=require("path")},76162:e=>{e.exports=require("stream")},21764:e=>{e.exports=require("util")},6005:e=>{e.exports=require("node:crypto")},61643:(e,t,s)=>{s.r(t),s.d(t,{originalPathname:()=>_,patchFetch:()=>L,requestAsyncStorage:()=>h,routeModule:()=>c,serverHooks:()=>N,staticGenerationAsyncStorage:()=>m});var r={};s.r(r),s.d(r,{GET:()=>p,PATCH:()=>E});var n=s(49303),i=s(88716),a=s(60670),u=s(87070),o=s(42023),l=s.n(o),d=s(9487),T=s(90455);async function p(){let e=(0,T.ts)();if(!e)return u.NextResponse.json({error:"Not signed in."},{status:401});let t=d.db.prepare("SELECT id, name, email, role, room, hostel, specialty, avatar_url, phone, bio, is_active, created_at FROM users WHERE id = ?").get(e.id);return u.NextResponse.json({user:t})}async function E(e){let t=(0,T.ts)();if(!t)return u.NextResponse.json({error:"Not signed in."},{status:401});let s=await e.json().catch(()=>null);if(!s)return u.NextResponse.json({error:"Invalid request."},{status:400});let r=s.name?.trim(),n=s.email?.toLowerCase()?.trim(),i=s.room?.trim()||null,a=s.hostel?.trim()||null,o=s.specialty?.trim()||null,p=s.avatar_url?.trim()||null,E=s.phone?.trim()||null,c=s.bio?.trim()||null,h=s.password?.trim();if(!r||!n)return u.NextResponse.json({error:"Name and email are required."},{status:400});let m=d.db.prepare("SELECT id FROM users WHERE email = ?").get(n);if(m&&m.id!==t.id)return u.NextResponse.json({error:"That email is already taken."},{status:409});let N=[],_=[];if(N.push("name = ?"),_.push(r),N.push("email = ?"),_.push(n),N.push("room = ?"),_.push(i),N.push("hostel = ?"),_.push(a),N.push("specialty = ?"),_.push(o),N.push("avatar_url = ?"),_.push(p),N.push("phone = ?"),_.push(E),N.push("bio = ?"),_.push(c),h){if(h.length<6)return u.NextResponse.json({error:"Password must be at least 6 characters."},{status:400});N.push("password_hash = ?"),_.push(l().hashSync(h,10))}_.push(t.id),d.db.prepare(`UPDATE users SET ${N.join(", ")} WHERE id = ?`).run(..._);let L=d.db.prepare("SELECT id, name, email, role, room, hostel, specialty, avatar_url, phone, bio, is_active, created_at FROM users WHERE id = ?").get(t.id);return u.NextResponse.json({ok:!0,user:L})}let c=new n.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/user/profile/route",pathname:"/api/user/profile",filename:"route",bundlePath:"app/api/user/profile/route"},resolvedPagePath:"/Users/tony/Downloads/fixhubgh/app/api/user/profile/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:h,staticGenerationAsyncStorage:m,serverHooks:N}=c,_="/api/user/profile/route";function L(){return(0,a.patchFetch)({serverHooks:N,staticGenerationAsyncStorage:m})}},90455:(e,t,s)=>{s.d(t,{CX:()=>E,GA:()=>c,Rf:()=>d,Uj:()=>l,ax:()=>p,ts:()=>T});var r=s(41482),n=s.n(r),i=s(71615),a=s(9487);let u=process.env.SESSION_SECRET||"hostel-maintenance-dev-secret-change-me",o="hostel_session";function l(e){let t=n().sign(e,u,{expiresIn:"7d"});(0,i.cookies)().set(o,t,{httpOnly:!0,sameSite:"lax",path:"/",maxAge:604800})}function d(){(0,i.cookies)().set(o,"",{path:"/",maxAge:0})}function T(){let e=i.cookies().get(o)?.value;if(!e)return null;try{let t=n().verify(e,u),s=c(t.id);if(!s||1!==s.is_active)return null;return p(s)}catch{return null}}function p(e){return{id:e.id,name:e.name,email:e.email,role:e.role,room:e.room,hostel:e.hostel,specialty:e.specialty,avatar_url:e.avatar_url,phone:e.phone,bio:e.bio,is_active:e.is_active}}function E(e){return a.db.prepare("SELECT * FROM users WHERE email = ?").get(e)}function c(e){return a.db.prepare("SELECT * FROM users WHERE id = ?").get(e)}},47090:(e,t,s)=>{s.d(t,{aA:()=>r,bV:()=>i,tb:()=>n});let r=["Electrical","Plumbing","Internet","Furniture","Pest Control","Cleaning","Other"],n=["Main","North","South","East","West","Annex"],i=["reported","assigned","in_progress","review","resolved"]},9487:(e,t,s)=>{s.d(t,{db:()=>c});var r=s(85861),n=s(55315),i=s.n(n),a=s(92048),u=s.n(a),o=s(42023),l=s.n(o),d=s(42549),T=s(47090);let p=i().join(process.cwd(),"data");u().existsSync(p)||u().mkdirSync(p,{recursive:!0});let E=i().join(p,"hostel.db"),c=global.__hostelDb??function(){let e=new r.DatabaseSync(E);return e.exec("PRAGMA journal_mode = WAL;"),e}();!function(){c.exec(`
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
  `);let e=c.prepare("PRAGMA table_info(users)").all();if(e.some(e=>"is_active"===e.name)||c.exec("ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;"),e.some(e=>"avatar_url"===e.name)||c.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT;"),e.some(e=>"phone"===e.name)||c.exec("ALTER TABLE users ADD COLUMN phone TEXT;"),e.some(e=>"bio"===e.name)||c.exec("ALTER TABLE users ADD COLUMN bio TEXT;"),e.some(e=>"hostel"===e.name)||c.exec("ALTER TABLE users ADD COLUMN hostel TEXT;"),0===c.prepare("SELECT COUNT(*) as c FROM hostels").get().c){let e=c.prepare("INSERT INTO hostels (id, name) VALUES (?, ?)");for(let t of T.tb)e.run(`h_${(0,d.x0)(10)}`,t)}if(c.prepare("PRAGMA table_info(issues)").all().some(e=>"hostel"===e.name)||c.exec("ALTER TABLE issues ADD COLUMN hostel TEXT NOT NULL DEFAULT 'Main';"),0===c.prepare("SELECT COUNT(*) as c FROM users").get().c){let e=c.prepare("INSERT INTO users (id, name, email, password_hash, role, room, hostel, specialty, avatar_url, phone, bio, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"),t=e=>l().hashSync(e,10);e.run("u_admin","Dara Whitfield","admin@hostel.edu",t("admin123"),"admin",null,null,null,null,null,null,1),e.run("u_tech1","Marcus Reid","marcus.reid@hostel.edu",t("tech123"),"technician",null,null,"Electrical",null,null,null,1),e.run("u_tech2","Ines Okafor","ines.okafor@hostel.edu",t("tech123"),"technician",null,null,"Plumbing",null,null,null,1),e.run("u_tech3","Sam Lindqvist","sam.lindqvist@hostel.edu",t("tech123"),"technician",null,null,"General/Furniture",null,null,null,1),e.run("u_student1","Priya Nandan","priya.n@student.edu",t("student123"),"student","B-214","Main",null,null,null,null,1),e.run("u_student2","Tom Achebe","tom.a@student.edu",t("student123"),"student","A-108","North",null,null,null,null,1);let s=new Date,r=e=>{let t=new Date(s);return t.setDate(t.getDate()-e),t.toISOString().slice(0,19).replace("T"," ")},n=c.prepare(`
      INSERT INTO issues (id, ticket_no, title, description, category, priority, status, room, hostel, student_id, technician_id, created_at, updated_at, resolved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);for(let e of[["i1","HM-0001","Flickering ceiling light","The ceiling light in the room flickers constantly and buzzes at night.","Electrical","normal","resolved","B-214","Main","u_student1","u_tech1",9,7,7],["i2","HM-0002","Leaking sink pipe","Water is pooling under the bathroom sink every morning.","Plumbing","high","in_progress","A-108","North","u_student2","u_tech2",5,2,null],["i3","HM-0003","No internet connection","Ethernet port in the room has had no connection for two days.","Internet","urgent","assigned","B-214","Main","u_student1","u_tech3",3,1,null],["i4","HM-0004","Broken wardrobe hinge","One door of the wardrobe has fallen off its hinge.","Furniture","low","reported","A-108","South","u_student2",null,1,1,null],["i5","HM-0005","Power socket not working","The socket near the desk has stopped supplying power.","Electrical","normal","resolved","B-214","Main","u_student1","u_tech1",14,12,12],["i6","HM-0006","Blocked drain in shower","Shower drains very slowly and water backs up.","Plumbing","high","resolved","A-108","North","u_student2","u_tech2",11,9,9]])n.run(e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9],e[10],r(e[11]),r(e[12]),null!==e[13]?r(e[13]):null);let i=c.prepare("INSERT INTO updates (id, issue_id, actor_id, message, created_at) VALUES (?, ?, ?, ?, ?)");i.run("up1","i1","u_student1","Issue reported by student.",r(9)),i.run("up2","i1","u_admin","Assigned to Marcus Reid (Electrical).",r(8)),i.run("up3","i1","u_tech1","Replaced faulty ballast. Marked resolved.",r(7)),i.run("up4","i2","u_student2","Issue reported by student.",r(5)),i.run("up5","i2","u_admin","Assigned to Ines Okafor (Plumbing).",r(4)),i.run("up6","i2","u_tech2","Inspected pipe, ordering replacement gasket.",r(2)),i.run("up7","i3","u_student1","Issue reported by student. Flagged urgent — needed for coursework.",r(3)),i.run("up8","i3","u_admin","Assigned to Sam Lindqvist.",r(1)),i.run("up9","i4","u_student2","Issue reported by student.",r(1))}}()}};var t=require("../../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[276,323,261,972],()=>s(61643));module.exports=r})();