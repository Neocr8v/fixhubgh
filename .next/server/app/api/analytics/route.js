"use strict";(()=>{var e={};e.id=567,e.ids=[567],e.modules={72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},92048:e=>{e.exports=require("fs")},85861:e=>{e.exports=require("node:sqlite")},55315:e=>{e.exports=require("path")},76162:e=>{e.exports=require("stream")},21764:e=>{e.exports=require("util")},6005:e=>{e.exports=require("node:crypto")},59246:(e,t,s)=>{s.r(t),s.d(t,{originalPathname:()=>h,patchFetch:()=>N,requestAsyncStorage:()=>E,routeModule:()=>c,serverHooks:()=>p,staticGenerationAsyncStorage:()=>T});var r={};s.r(r),s.d(r,{GET:()=>d});var a=s(49303),n=s(88716),i=s(60670),u=s(87070),o=s(9487),l=s(90455);async function d(e){let t=(0,l.ts)();if(!t)return u.NextResponse.json({error:"Not signed in."},{status:401});if("admin"!==t.role)return u.NextResponse.json({error:"Admin access only."},{status:403});try{let t=new URL(e.url),s=t.searchParams.get("start"),r=t.searchParams.get("end"),a=[],n=[];s&&(a.push("date(created_at) >= date(?)"),n.push(s)),r&&(a.push("date(created_at) <= date(?)"),n.push(r));let i=a.length?`WHERE ${a.join(" AND ")}`:"",l=a.length?`${i} AND resolved_at IS NOT NULL`:"WHERE resolved_at IS NOT NULL",d=o.db.prepare(`SELECT category, COUNT(*) as count FROM issues ${i} GROUP BY category ORDER BY count DESC`).all(...n),c=o.db.prepare(`SELECT status, COUNT(*) as count FROM issues ${i} GROUP BY status`).all(...n),E=o.db.prepare(`SELECT priority, COUNT(*) as count FROM issues ${i} GROUP BY priority`).all(...n),T=o.db.prepare(`SELECT COUNT(*) as total,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
          SUM(CASE WHEN duplicate_of IS NOT NULL THEN 1 ELSE 0 END) as duplicates
         FROM issues ${i}`).get(...n),p={total:T.total??0,resolved:T.resolved??0,duplicates:T.duplicates??0},h=o.db.prepare(`SELECT AVG(julianday(resolved_at) - julianday(created_at)) as avg_days
         FROM issues ${l}`).get(...n),N=o.db.prepare(`SELECT date(created_at) as day, COUNT(*) as count
         FROM issues
         ${i}
         GROUP BY day ORDER BY day ASC`).all(...n),L=o.db.prepare(`SELECT room, COUNT(*) as count FROM issues ${i} GROUP BY room ORDER BY count DESC LIMIT 8`).all(...n),m=a.map(e=>e.replace(/date\(created_at\)/g,"date(i.created_at)")),_=`WHERE u.role = 'technician'${m.length?` AND ${m.join(" AND ")}`:""}`,O=o.db.prepare(`SELECT u.name, COUNT(i.id) as active
         FROM users u
         LEFT JOIN issues i ON i.technician_id = u.id AND i.status != 'resolved'
         ${_}
         GROUP BY u.id ORDER BY active DESC`).all(...n),g=t.searchParams.get("format");if("csv"===g){let e=[];e.push("section,name,value"),e.push(`totals,total,${p.total}`),e.push(`totals,resolved,${p.resolved}`),e.push(`totals,duplicates,${p.duplicates}`),e.push(`totals,avg_resolution_days,${h.avg_days??""}`),e.push(""),e.push("category,group,count"),d.forEach(t=>e.push(`category,${t.category},${t.count}`)),e.push(""),e.push("status,group,count"),c.forEach(t=>e.push(`status,${t.status},${t.count}`)),e.push(""),e.push("priority,group,count"),E.forEach(t=>e.push(`priority,${t.priority},${t.count}`)),e.push(""),e.push("trend,day,count"),N.forEach(t=>e.push(`trend,${t.day},${t.count}`)),e.push(""),e.push("room,room,count"),L.forEach(t=>e.push(`room,${t.room},${t.count}`)),e.push(""),e.push("technician,name,active"),O.forEach(t=>e.push(`technician,${t.name},${t.active}`));let t=e.join("\n");return new Response(t,{status:200,headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":'attachment; filename="analytics-export.csv"'}})}return u.NextResponse.json({byCategory:d,byStatus:c,byPriority:E,totals:p,avgResolutionDays:h.avg_days,trend:N,byRoom:L,technicianLoad:O})}catch(t){let e=t instanceof Error?t.message:"Unknown analytics error";return u.NextResponse.json({error:`Analytics server error: ${e}`},{status:500})}}let c=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/analytics/route",pathname:"/api/analytics",filename:"route",bundlePath:"app/api/analytics/route"},resolvedPagePath:"/Users/tony/Downloads/fixhubgh/app/api/analytics/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:E,staticGenerationAsyncStorage:T,serverHooks:p}=c,h="/api/analytics/route";function N(){return(0,i.patchFetch)({serverHooks:p,staticGenerationAsyncStorage:T})}},90455:(e,t,s)=>{s.d(t,{CX:()=>T,GA:()=>p,Rf:()=>d,Uj:()=>l,ax:()=>E,ts:()=>c});var r=s(41482),a=s.n(r),n=s(71615),i=s(9487);let u=process.env.SESSION_SECRET||"hostel-maintenance-dev-secret-change-me",o="hostel_session";function l(e){let t=a().sign(e,u,{expiresIn:"7d"});(0,n.cookies)().set(o,t,{httpOnly:!0,sameSite:"lax",path:"/",maxAge:604800})}function d(){(0,n.cookies)().set(o,"",{path:"/",maxAge:0})}function c(){let e=n.cookies().get(o)?.value;if(!e)return null;try{let t=a().verify(e,u),s=p(t.id);if(!s||1!==s.is_active)return null;return E(s)}catch{return null}}function E(e){return{id:e.id,name:e.name,email:e.email,role:e.role,room:e.room,hostel:e.hostel,specialty:e.specialty,avatar_url:e.avatar_url,phone:e.phone,bio:e.bio,is_active:e.is_active}}function T(e){return i.db.prepare("SELECT * FROM users WHERE email = ?").get(e)}function p(e){return i.db.prepare("SELECT * FROM users WHERE id = ?").get(e)}},47090:(e,t,s)=>{s.d(t,{aA:()=>r,bV:()=>n,tb:()=>a});let r=["Electrical","Plumbing","Internet","Furniture","Pest Control","Cleaning","Other"],a=["Main","North","South","East","West","Annex"],n=["reported","assigned","in_progress","review","resolved"]},9487:(e,t,s)=>{s.d(t,{db:()=>p});var r=s(85861),a=s(55315),n=s.n(a),i=s(92048),u=s.n(i),o=s(42023),l=s.n(o),d=s(42549),c=s(47090);let E=n().join(process.cwd(),"data");u().existsSync(E)||u().mkdirSync(E,{recursive:!0});let T=n().join(E,"hostel.db"),p=global.__hostelDb??function(){let e=new r.DatabaseSync(T);return e.exec("PRAGMA journal_mode = WAL;"),e}();!function(){p.exec(`
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
  `);let e=p.prepare("PRAGMA table_info(users)").all();if(e.some(e=>"is_active"===e.name)||p.exec("ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;"),e.some(e=>"avatar_url"===e.name)||p.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT;"),e.some(e=>"phone"===e.name)||p.exec("ALTER TABLE users ADD COLUMN phone TEXT;"),e.some(e=>"bio"===e.name)||p.exec("ALTER TABLE users ADD COLUMN bio TEXT;"),e.some(e=>"hostel"===e.name)||p.exec("ALTER TABLE users ADD COLUMN hostel TEXT;"),0===p.prepare("SELECT COUNT(*) as c FROM hostels").get().c){let e=p.prepare("INSERT INTO hostels (id, name) VALUES (?, ?)");for(let t of c.tb)e.run(`h_${(0,d.x0)(10)}`,t)}if(p.prepare("PRAGMA table_info(issues)").all().some(e=>"hostel"===e.name)||p.exec("ALTER TABLE issues ADD COLUMN hostel TEXT NOT NULL DEFAULT 'Main';"),0===p.prepare("SELECT COUNT(*) as c FROM users").get().c){let e=p.prepare("INSERT INTO users (id, name, email, password_hash, role, room, hostel, specialty, avatar_url, phone, bio, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"),t=e=>l().hashSync(e,10);e.run("u_admin","Dara Whitfield","admin@hostel.edu",t("admin123"),"admin",null,null,null,null,null,null,1),e.run("u_tech1","Marcus Reid","marcus.reid@hostel.edu",t("tech123"),"technician",null,null,"Electrical",null,null,null,1),e.run("u_tech2","Ines Okafor","ines.okafor@hostel.edu",t("tech123"),"technician",null,null,"Plumbing",null,null,null,1),e.run("u_tech3","Sam Lindqvist","sam.lindqvist@hostel.edu",t("tech123"),"technician",null,null,"General/Furniture",null,null,null,1),e.run("u_student1","Priya Nandan","priya.n@student.edu",t("student123"),"student","B-214","Main",null,null,null,null,1),e.run("u_student2","Tom Achebe","tom.a@student.edu",t("student123"),"student","A-108","North",null,null,null,null,1);let s=new Date,r=e=>{let t=new Date(s);return t.setDate(t.getDate()-e),t.toISOString().slice(0,19).replace("T"," ")},a=p.prepare(`
      INSERT INTO issues (id, ticket_no, title, description, category, priority, status, room, hostel, student_id, technician_id, created_at, updated_at, resolved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);for(let e of[["i1","HM-0001","Flickering ceiling light","The ceiling light in the room flickers constantly and buzzes at night.","Electrical","normal","resolved","B-214","Main","u_student1","u_tech1",9,7,7],["i2","HM-0002","Leaking sink pipe","Water is pooling under the bathroom sink every morning.","Plumbing","high","in_progress","A-108","North","u_student2","u_tech2",5,2,null],["i3","HM-0003","No internet connection","Ethernet port in the room has had no connection for two days.","Internet","urgent","assigned","B-214","Main","u_student1","u_tech3",3,1,null],["i4","HM-0004","Broken wardrobe hinge","One door of the wardrobe has fallen off its hinge.","Furniture","low","reported","A-108","South","u_student2",null,1,1,null],["i5","HM-0005","Power socket not working","The socket near the desk has stopped supplying power.","Electrical","normal","resolved","B-214","Main","u_student1","u_tech1",14,12,12],["i6","HM-0006","Blocked drain in shower","Shower drains very slowly and water backs up.","Plumbing","high","resolved","A-108","North","u_student2","u_tech2",11,9,9]])a.run(e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9],e[10],r(e[11]),r(e[12]),null!==e[13]?r(e[13]):null);let n=p.prepare("INSERT INTO updates (id, issue_id, actor_id, message, created_at) VALUES (?, ?, ?, ?, ?)");n.run("up1","i1","u_student1","Issue reported by student.",r(9)),n.run("up2","i1","u_admin","Assigned to Marcus Reid (Electrical).",r(8)),n.run("up3","i1","u_tech1","Replaced faulty ballast. Marked resolved.",r(7)),n.run("up4","i2","u_student2","Issue reported by student.",r(5)),n.run("up5","i2","u_admin","Assigned to Ines Okafor (Plumbing).",r(4)),n.run("up6","i2","u_tech2","Inspected pipe, ordering replacement gasket.",r(2)),n.run("up7","i3","u_student1","Issue reported by student. Flagged urgent — needed for coursework.",r(3)),n.run("up8","i3","u_admin","Assigned to Sam Lindqvist.",r(1)),n.run("up9","i4","u_student2","Issue reported by student.",r(1))}}()}};var t=require("../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[276,323,261,972],()=>s(59246));module.exports=r})();