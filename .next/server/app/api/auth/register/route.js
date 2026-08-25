"use strict";(()=>{var e={};e.id=2,e.ids=[2],e.modules={72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},92048:e=>{e.exports=require("fs")},85861:e=>{e.exports=require("node:sqlite")},55315:e=>{e.exports=require("path")},76162:e=>{e.exports=require("stream")},21764:e=>{e.exports=require("util")},6005:e=>{e.exports=require("node:crypto")},94223:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>_,patchFetch:()=>L,requestAsyncStorage:()=>h,routeModule:()=>p,serverHooks:()=>m,staticGenerationAsyncStorage:()=>N});var s={};r.r(s),r.d(s,{POST:()=>E});var n=r(49303),i=r(88716),a=r(60670),u=r(87070),o=r(42023),l=r.n(o),d=r(42549),T=r(9487),c=r(90455);async function E(e){let t=await e.json().catch(()=>null),r=t?.name?.trim(),s=t?.email?.toLowerCase()?.trim(),n=t?.password,i=t?.room?.trim(),a=t?.hostel?.trim();if(!r||!s||!n||!i||!a)return u.NextResponse.json({error:"Name, email, hostel, room and password are all required."},{status:400});if(n.length<6)return u.NextResponse.json({error:"Password must be at least 6 characters."},{status:400});if((0,c.CX)(s))return u.NextResponse.json({error:"An account with that email already exists."},{status:409});let o=`u_${(0,d.x0)(10)}`,E=l().hashSync(n,10);T.db.prepare("INSERT INTO users (id, name, email, password_hash, role, room, hostel, specialty, is_active) VALUES (?, ?, ?, ?, 'student', ?, ?, NULL, 1)").run(o,r,s,E,i,a);let p=(0,c.ax)({id:o,name:r,email:s,password_hash:E,role:"student",room:i,hostel:a,specialty:null,avatar_url:null,phone:null,bio:null,is_active:1,created_at:new Date().toISOString()});return(0,c.Uj)(p),u.NextResponse.json({user:p})}let p=new n.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/auth/register/route",pathname:"/api/auth/register",filename:"route",bundlePath:"app/api/auth/register/route"},resolvedPagePath:"/Users/tony/Downloads/fixhubgh/app/api/auth/register/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:h,staticGenerationAsyncStorage:N,serverHooks:m}=p,_="/api/auth/register/route";function L(){return(0,a.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:N})}},90455:(e,t,r)=>{r.d(t,{CX:()=>E,GA:()=>p,Rf:()=>d,Uj:()=>l,ax:()=>c,ts:()=>T});var s=r(41482),n=r.n(s),i=r(71615),a=r(9487);let u=process.env.SESSION_SECRET||"hostel-maintenance-dev-secret-change-me",o="hostel_session";function l(e){let t=n().sign(e,u,{expiresIn:"7d"});(0,i.cookies)().set(o,t,{httpOnly:!0,sameSite:"lax",path:"/",maxAge:604800})}function d(){(0,i.cookies)().set(o,"",{path:"/",maxAge:0})}function T(){let e=i.cookies().get(o)?.value;if(!e)return null;try{let t=n().verify(e,u),r=p(t.id);if(!r||1!==r.is_active)return null;return c(r)}catch{return null}}function c(e){return{id:e.id,name:e.name,email:e.email,role:e.role,room:e.room,hostel:e.hostel,specialty:e.specialty,avatar_url:e.avatar_url,phone:e.phone,bio:e.bio,is_active:e.is_active}}function E(e){return a.db.prepare("SELECT * FROM users WHERE email = ?").get(e)}function p(e){return a.db.prepare("SELECT * FROM users WHERE id = ?").get(e)}},47090:(e,t,r)=>{r.d(t,{aA:()=>s,bV:()=>i,tb:()=>n});let s=["Electrical","Plumbing","Internet","Furniture","Pest Control","Cleaning","Other"],n=["Main","North","South","East","West","Annex"],i=["reported","assigned","in_progress","review","resolved"]},9487:(e,t,r)=>{r.d(t,{db:()=>p});var s=r(85861),n=r(55315),i=r.n(n),a=r(92048),u=r.n(a),o=r(42023),l=r.n(o),d=r(42549),T=r(47090);let c=i().join(process.cwd(),"data");u().existsSync(c)||u().mkdirSync(c,{recursive:!0});let E=i().join(c,"hostel.db"),p=global.__hostelDb??function(){let e=new s.DatabaseSync(E);return e.exec("PRAGMA journal_mode = WAL;"),e}();!function(){p.exec(`
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
  `);let e=p.prepare("PRAGMA table_info(users)").all();if(e.some(e=>"is_active"===e.name)||p.exec("ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;"),e.some(e=>"avatar_url"===e.name)||p.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT;"),e.some(e=>"phone"===e.name)||p.exec("ALTER TABLE users ADD COLUMN phone TEXT;"),e.some(e=>"bio"===e.name)||p.exec("ALTER TABLE users ADD COLUMN bio TEXT;"),e.some(e=>"hostel"===e.name)||p.exec("ALTER TABLE users ADD COLUMN hostel TEXT;"),0===p.prepare("SELECT COUNT(*) as c FROM hostels").get().c){let e=p.prepare("INSERT INTO hostels (id, name) VALUES (?, ?)");for(let t of T.tb)e.run(`h_${(0,d.x0)(10)}`,t)}if(p.prepare("PRAGMA table_info(issues)").all().some(e=>"hostel"===e.name)||p.exec("ALTER TABLE issues ADD COLUMN hostel TEXT NOT NULL DEFAULT 'Main';"),0===p.prepare("SELECT COUNT(*) as c FROM users").get().c){let e=p.prepare("INSERT INTO users (id, name, email, password_hash, role, room, hostel, specialty, avatar_url, phone, bio, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"),t=e=>l().hashSync(e,10);e.run("u_admin","Dara Whitfield","admin@hostel.edu",t("admin123"),"admin",null,null,null,null,null,null,1),e.run("u_tech1","Marcus Reid","marcus.reid@hostel.edu",t("tech123"),"technician",null,null,"Electrical",null,null,null,1),e.run("u_tech2","Ines Okafor","ines.okafor@hostel.edu",t("tech123"),"technician",null,null,"Plumbing",null,null,null,1),e.run("u_tech3","Sam Lindqvist","sam.lindqvist@hostel.edu",t("tech123"),"technician",null,null,"General/Furniture",null,null,null,1),e.run("u_student1","Priya Nandan","priya.n@student.edu",t("student123"),"student","B-214","Main",null,null,null,null,1),e.run("u_student2","Tom Achebe","tom.a@student.edu",t("student123"),"student","A-108","North",null,null,null,null,1);let r=new Date,s=e=>{let t=new Date(r);return t.setDate(t.getDate()-e),t.toISOString().slice(0,19).replace("T"," ")},n=p.prepare(`
      INSERT INTO issues (id, ticket_no, title, description, category, priority, status, room, hostel, student_id, technician_id, created_at, updated_at, resolved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);for(let e of[["i1","HM-0001","Flickering ceiling light","The ceiling light in the room flickers constantly and buzzes at night.","Electrical","normal","resolved","B-214","Main","u_student1","u_tech1",9,7,7],["i2","HM-0002","Leaking sink pipe","Water is pooling under the bathroom sink every morning.","Plumbing","high","in_progress","A-108","North","u_student2","u_tech2",5,2,null],["i3","HM-0003","No internet connection","Ethernet port in the room has had no connection for two days.","Internet","urgent","assigned","B-214","Main","u_student1","u_tech3",3,1,null],["i4","HM-0004","Broken wardrobe hinge","One door of the wardrobe has fallen off its hinge.","Furniture","low","reported","A-108","South","u_student2",null,1,1,null],["i5","HM-0005","Power socket not working","The socket near the desk has stopped supplying power.","Electrical","normal","resolved","B-214","Main","u_student1","u_tech1",14,12,12],["i6","HM-0006","Blocked drain in shower","Shower drains very slowly and water backs up.","Plumbing","high","resolved","A-108","North","u_student2","u_tech2",11,9,9]])n.run(e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9],e[10],s(e[11]),s(e[12]),null!==e[13]?s(e[13]):null);let i=p.prepare("INSERT INTO updates (id, issue_id, actor_id, message, created_at) VALUES (?, ?, ?, ?, ?)");i.run("up1","i1","u_student1","Issue reported by student.",s(9)),i.run("up2","i1","u_admin","Assigned to Marcus Reid (Electrical).",s(8)),i.run("up3","i1","u_tech1","Replaced faulty ballast. Marked resolved.",s(7)),i.run("up4","i2","u_student2","Issue reported by student.",s(5)),i.run("up5","i2","u_admin","Assigned to Ines Okafor (Plumbing).",s(4)),i.run("up6","i2","u_tech2","Inspected pipe, ordering replacement gasket.",s(2)),i.run("up7","i3","u_student1","Issue reported by student. Flagged urgent — needed for coursework.",s(3)),i.run("up8","i3","u_admin","Assigned to Sam Lindqvist.",s(1)),i.run("up9","i4","u_student2","Issue reported by student.",s(1))}}()}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[276,323,261,972],()=>r(94223));module.exports=s})();