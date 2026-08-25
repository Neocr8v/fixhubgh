"use strict";(()=>{var e={};e.id=481,e.ids=[481],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},84770:e=>{e.exports=require("crypto")},92048:e=>{e.exports=require("fs")},85861:e=>{e.exports=require("node:sqlite")},55315:e=>{e.exports=require("path")},6005:e=>{e.exports=require("node:crypto")},27494:(e,t,n)=>{n.r(t),n.d(t,{originalPathname:()=>p,patchFetch:()=>h,requestAsyncStorage:()=>T,routeModule:()=>d,serverHooks:()=>c,staticGenerationAsyncStorage:()=>E});var s={};n.r(s),n.d(s,{GET:()=>l});var r=n(49303),i=n(88716),u=n(60670),a=n(87070),o=n(9487);async function l(){let e=o.db.prepare("SELECT id, name FROM hostels ORDER BY name ASC").all();return a.NextResponse.json({hostels:e})}let d=new r.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/hostels/route",pathname:"/api/hostels",filename:"route",bundlePath:"app/api/hostels/route"},resolvedPagePath:"/Users/tony/Downloads/fixhubgh/app/api/hostels/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:T,staticGenerationAsyncStorage:E,serverHooks:c}=d,p="/api/hostels/route";function h(){return(0,u.patchFetch)({serverHooks:c,staticGenerationAsyncStorage:E})}},47090:(e,t,n)=>{n.d(t,{aA:()=>s,bV:()=>i,tb:()=>r});let s=["Electrical","Plumbing","Internet","Furniture","Pest Control","Cleaning","Other"],r=["Main","North","South","East","West","Annex"],i=["reported","assigned","in_progress","review","resolved"]},9487:(e,t,n)=>{n.d(t,{db:()=>p});var s=n(85861),r=n(55315),i=n.n(r),u=n(92048),a=n.n(u),o=n(42023),l=n.n(o),d=n(42549),T=n(47090);let E=i().join(process.cwd(),"data");a().existsSync(E)||a().mkdirSync(E,{recursive:!0});let c=i().join(E,"hostel.db"),p=global.__hostelDb??function(){let e=new s.DatabaseSync(c);return e.exec("PRAGMA journal_mode = WAL;"),e}();!function(){p.exec(`
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
  `);let e=p.prepare("PRAGMA table_info(users)").all();if(e.some(e=>"is_active"===e.name)||p.exec("ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;"),e.some(e=>"avatar_url"===e.name)||p.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT;"),e.some(e=>"phone"===e.name)||p.exec("ALTER TABLE users ADD COLUMN phone TEXT;"),e.some(e=>"bio"===e.name)||p.exec("ALTER TABLE users ADD COLUMN bio TEXT;"),e.some(e=>"hostel"===e.name)||p.exec("ALTER TABLE users ADD COLUMN hostel TEXT;"),0===p.prepare("SELECT COUNT(*) as c FROM hostels").get().c){let e=p.prepare("INSERT INTO hostels (id, name) VALUES (?, ?)");for(let t of T.tb)e.run(`h_${(0,d.x0)(10)}`,t)}if(p.prepare("PRAGMA table_info(issues)").all().some(e=>"hostel"===e.name)||p.exec("ALTER TABLE issues ADD COLUMN hostel TEXT NOT NULL DEFAULT 'Main';"),0===p.prepare("SELECT COUNT(*) as c FROM users").get().c){let e=p.prepare("INSERT INTO users (id, name, email, password_hash, role, room, hostel, specialty, avatar_url, phone, bio, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"),t=e=>l().hashSync(e,10);e.run("u_admin","Dara Whitfield","admin@hostel.edu",t("admin123"),"admin",null,null,null,null,null,null,1),e.run("u_tech1","Marcus Reid","marcus.reid@hostel.edu",t("tech123"),"technician",null,null,"Electrical",null,null,null,1),e.run("u_tech2","Ines Okafor","ines.okafor@hostel.edu",t("tech123"),"technician",null,null,"Plumbing",null,null,null,1),e.run("u_tech3","Sam Lindqvist","sam.lindqvist@hostel.edu",t("tech123"),"technician",null,null,"General/Furniture",null,null,null,1),e.run("u_student1","Priya Nandan","priya.n@student.edu",t("student123"),"student","B-214","Main",null,null,null,null,1),e.run("u_student2","Tom Achebe","tom.a@student.edu",t("student123"),"student","A-108","North",null,null,null,null,1);let n=new Date,s=e=>{let t=new Date(n);return t.setDate(t.getDate()-e),t.toISOString().slice(0,19).replace("T"," ")},r=p.prepare(`
      INSERT INTO issues (id, ticket_no, title, description, category, priority, status, room, hostel, student_id, technician_id, created_at, updated_at, resolved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);for(let e of[["i1","HM-0001","Flickering ceiling light","The ceiling light in the room flickers constantly and buzzes at night.","Electrical","normal","resolved","B-214","Main","u_student1","u_tech1",9,7,7],["i2","HM-0002","Leaking sink pipe","Water is pooling under the bathroom sink every morning.","Plumbing","high","in_progress","A-108","North","u_student2","u_tech2",5,2,null],["i3","HM-0003","No internet connection","Ethernet port in the room has had no connection for two days.","Internet","urgent","assigned","B-214","Main","u_student1","u_tech3",3,1,null],["i4","HM-0004","Broken wardrobe hinge","One door of the wardrobe has fallen off its hinge.","Furniture","low","reported","A-108","South","u_student2",null,1,1,null],["i5","HM-0005","Power socket not working","The socket near the desk has stopped supplying power.","Electrical","normal","resolved","B-214","Main","u_student1","u_tech1",14,12,12],["i6","HM-0006","Blocked drain in shower","Shower drains very slowly and water backs up.","Plumbing","high","resolved","A-108","North","u_student2","u_tech2",11,9,9]])r.run(e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9],e[10],s(e[11]),s(e[12]),null!==e[13]?s(e[13]):null);let i=p.prepare("INSERT INTO updates (id, issue_id, actor_id, message, created_at) VALUES (?, ?, ?, ?, ?)");i.run("up1","i1","u_student1","Issue reported by student.",s(9)),i.run("up2","i1","u_admin","Assigned to Marcus Reid (Electrical).",s(8)),i.run("up3","i1","u_tech1","Replaced faulty ballast. Marked resolved.",s(7)),i.run("up4","i2","u_student2","Issue reported by student.",s(5)),i.run("up5","i2","u_admin","Assigned to Ines Okafor (Plumbing).",s(4)),i.run("up6","i2","u_tech2","Inspected pipe, ordering replacement gasket.",s(2)),i.run("up7","i3","u_student1","Issue reported by student. Flagged urgent — needed for coursework.",s(3)),i.run("up8","i3","u_admin","Assigned to Sam Lindqvist.",s(1)),i.run("up9","i4","u_student2","Issue reported by student.",s(1))}}()}};var t=require("../../../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),s=t.X(0,[276,323,972],()=>n(27494));module.exports=s})();