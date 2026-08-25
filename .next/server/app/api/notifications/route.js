"use strict";(()=>{var e={};e.id=996,e.ids=[996],e.modules={72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},92048:e=>{e.exports=require("fs")},85861:e=>{e.exports=require("node:sqlite")},55315:e=>{e.exports=require("path")},76162:e=>{e.exports=require("stream")},21764:e=>{e.exports=require("util")},6005:e=>{e.exports=require("node:crypto")},1583:(e,t,s)=>{s.r(t),s.d(t,{originalPathname:()=>h,patchFetch:()=>N,requestAsyncStorage:()=>T,routeModule:()=>E,serverHooks:()=>p,staticGenerationAsyncStorage:()=>c});var i={};s.r(i),s.d(i,{GET:()=>d});var n=s(49303),r=s(88716),a=s(60670),u=s(87070),o=s(9487),l=s(90455);async function d(){let e=(0,l.ts)();if(!e)return u.NextResponse.json({error:"Not signed in."},{status:401});let t="SELECT id, ticket_no, title, room, created_at FROM issues WHERE status != ?",s=["resolved"];"student"===e.role?(t+=" AND student_id = ?",s.push(e.id)):"technician"===e.role&&(t+=" AND technician_id = ?",s.push(e.id)),t+=" ORDER BY created_at DESC LIMIT 5";let i=[];return i="technician"===e.role?o.db.prepare(`SELECT u.id, i.ticket_no, i.title, i.room, u.created_at
         FROM updates u
         JOIN issues i ON i.id = u.issue_id
         WHERE i.technician_id = ? AND u.message LIKE 'Assigned to %'
         ORDER BY u.created_at DESC LIMIT 5`).all(e.id):"student"===e.role?o.db.prepare(`SELECT u.id, i.ticket_no, i.title, i.room, u.created_at
         FROM updates u
         JOIN issues i ON i.id = u.issue_id
         WHERE i.student_id = ? AND u.actor_id IN (
           SELECT id FROM users WHERE role = 'admin'
         ) AND u.message = 'Status updated to "resolved".'
         ORDER BY u.created_at DESC LIMIT 5`).all(e.id):o.db.prepare("SELECT id, ticket_no, title, room, created_at FROM issues WHERE status = 'review' ORDER BY created_at DESC LIMIT 5").all(),u.NextResponse.json({total:i.length,newIssues:i})}let E=new n.AppRouteRouteModule({definition:{kind:r.x.APP_ROUTE,page:"/api/notifications/route",pathname:"/api/notifications",filename:"route",bundlePath:"app/api/notifications/route"},resolvedPagePath:"/Users/tony/Downloads/fixhubgh/app/api/notifications/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:T,staticGenerationAsyncStorage:c,serverHooks:p}=E,h="/api/notifications/route";function N(){return(0,a.patchFetch)({serverHooks:p,staticGenerationAsyncStorage:c})}},90455:(e,t,s)=>{s.d(t,{CX:()=>c,GA:()=>p,Rf:()=>d,Uj:()=>l,ax:()=>T,ts:()=>E});var i=s(41482),n=s.n(i),r=s(71615),a=s(9487);let u=process.env.SESSION_SECRET||"hostel-maintenance-dev-secret-change-me",o="hostel_session";function l(e){let t=n().sign(e,u,{expiresIn:"7d"});(0,r.cookies)().set(o,t,{httpOnly:!0,sameSite:"lax",path:"/",maxAge:604800})}function d(){(0,r.cookies)().set(o,"",{path:"/",maxAge:0})}function E(){let e=r.cookies().get(o)?.value;if(!e)return null;try{let t=n().verify(e,u),s=p(t.id);if(!s||1!==s.is_active)return null;return T(s)}catch{return null}}function T(e){return{id:e.id,name:e.name,email:e.email,role:e.role,room:e.room,hostel:e.hostel,specialty:e.specialty,avatar_url:e.avatar_url,phone:e.phone,bio:e.bio,is_active:e.is_active}}function c(e){return a.db.prepare("SELECT * FROM users WHERE email = ?").get(e)}function p(e){return a.db.prepare("SELECT * FROM users WHERE id = ?").get(e)}},47090:(e,t,s)=>{s.d(t,{aA:()=>i,bV:()=>r,tb:()=>n});let i=["Electrical","Plumbing","Internet","Furniture","Pest Control","Cleaning","Other"],n=["Main","North","South","East","West","Annex"],r=["reported","assigned","in_progress","review","resolved"]},9487:(e,t,s)=>{s.d(t,{db:()=>p});var i=s(85861),n=s(55315),r=s.n(n),a=s(92048),u=s.n(a),o=s(42023),l=s.n(o),d=s(42549),E=s(47090);let T=r().join(process.cwd(),"data");u().existsSync(T)||u().mkdirSync(T,{recursive:!0});let c=r().join(T,"hostel.db"),p=global.__hostelDb??function(){let e=new i.DatabaseSync(c);return e.exec("PRAGMA journal_mode = WAL;"),e}();!function(){p.exec(`
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
  `);let e=p.prepare("PRAGMA table_info(users)").all();if(e.some(e=>"is_active"===e.name)||p.exec("ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;"),e.some(e=>"avatar_url"===e.name)||p.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT;"),e.some(e=>"phone"===e.name)||p.exec("ALTER TABLE users ADD COLUMN phone TEXT;"),e.some(e=>"bio"===e.name)||p.exec("ALTER TABLE users ADD COLUMN bio TEXT;"),e.some(e=>"hostel"===e.name)||p.exec("ALTER TABLE users ADD COLUMN hostel TEXT;"),0===p.prepare("SELECT COUNT(*) as c FROM hostels").get().c){let e=p.prepare("INSERT INTO hostels (id, name) VALUES (?, ?)");for(let t of E.tb)e.run(`h_${(0,d.x0)(10)}`,t)}if(p.prepare("PRAGMA table_info(issues)").all().some(e=>"hostel"===e.name)||p.exec("ALTER TABLE issues ADD COLUMN hostel TEXT NOT NULL DEFAULT 'Main';"),0===p.prepare("SELECT COUNT(*) as c FROM users").get().c){let e=p.prepare("INSERT INTO users (id, name, email, password_hash, role, room, hostel, specialty, avatar_url, phone, bio, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"),t=e=>l().hashSync(e,10);e.run("u_admin","Dara Whitfield","admin@hostel.edu",t("admin123"),"admin",null,null,null,null,null,null,1),e.run("u_tech1","Marcus Reid","marcus.reid@hostel.edu",t("tech123"),"technician",null,null,"Electrical",null,null,null,1),e.run("u_tech2","Ines Okafor","ines.okafor@hostel.edu",t("tech123"),"technician",null,null,"Plumbing",null,null,null,1),e.run("u_tech3","Sam Lindqvist","sam.lindqvist@hostel.edu",t("tech123"),"technician",null,null,"General/Furniture",null,null,null,1),e.run("u_student1","Priya Nandan","priya.n@student.edu",t("student123"),"student","B-214","Main",null,null,null,null,1),e.run("u_student2","Tom Achebe","tom.a@student.edu",t("student123"),"student","A-108","North",null,null,null,null,1);let s=new Date,i=e=>{let t=new Date(s);return t.setDate(t.getDate()-e),t.toISOString().slice(0,19).replace("T"," ")},n=p.prepare(`
      INSERT INTO issues (id, ticket_no, title, description, category, priority, status, room, hostel, student_id, technician_id, created_at, updated_at, resolved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);for(let e of[["i1","HM-0001","Flickering ceiling light","The ceiling light in the room flickers constantly and buzzes at night.","Electrical","normal","resolved","B-214","Main","u_student1","u_tech1",9,7,7],["i2","HM-0002","Leaking sink pipe","Water is pooling under the bathroom sink every morning.","Plumbing","high","in_progress","A-108","North","u_student2","u_tech2",5,2,null],["i3","HM-0003","No internet connection","Ethernet port in the room has had no connection for two days.","Internet","urgent","assigned","B-214","Main","u_student1","u_tech3",3,1,null],["i4","HM-0004","Broken wardrobe hinge","One door of the wardrobe has fallen off its hinge.","Furniture","low","reported","A-108","South","u_student2",null,1,1,null],["i5","HM-0005","Power socket not working","The socket near the desk has stopped supplying power.","Electrical","normal","resolved","B-214","Main","u_student1","u_tech1",14,12,12],["i6","HM-0006","Blocked drain in shower","Shower drains very slowly and water backs up.","Plumbing","high","resolved","A-108","North","u_student2","u_tech2",11,9,9]])n.run(e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9],e[10],i(e[11]),i(e[12]),null!==e[13]?i(e[13]):null);let r=p.prepare("INSERT INTO updates (id, issue_id, actor_id, message, created_at) VALUES (?, ?, ?, ?, ?)");r.run("up1","i1","u_student1","Issue reported by student.",i(9)),r.run("up2","i1","u_admin","Assigned to Marcus Reid (Electrical).",i(8)),r.run("up3","i1","u_tech1","Replaced faulty ballast. Marked resolved.",i(7)),r.run("up4","i2","u_student2","Issue reported by student.",i(5)),r.run("up5","i2","u_admin","Assigned to Ines Okafor (Plumbing).",i(4)),r.run("up6","i2","u_tech2","Inspected pipe, ordering replacement gasket.",i(2)),r.run("up7","i3","u_student1","Issue reported by student. Flagged urgent — needed for coursework.",i(3)),r.run("up8","i3","u_admin","Assigned to Sam Lindqvist.",i(1)),r.run("up9","i4","u_student2","Issue reported by student.",i(1))}}()}};var t=require("../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),i=t.X(0,[276,323,261,972],()=>s(1583));module.exports=i})();