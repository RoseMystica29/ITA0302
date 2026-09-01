const $=id=>document.getElementById(id);
const read=k=>JSON.parse(localStorage.getItem(k)||"[]");
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
function init(){
 if(!localStorage.getItem("cr_users")) write("cr_users",[
  {id:"STU001",name:"Arun Kumar",type:"Student",email:"arun@campus.edu",rides:0},
  {id:"STU002",name:"Priya Sharma",type:"Student",email:"priya@campus.edu",rides:0}
 ]);
 if(!localStorage.getItem("cr_bikes")) write("cr_bikes",[
  {id:"BIKE101",location:"Main Gate",status:"Available",rides:0},
  {id:"BIKE102",location:"Central Library",status:"Available",rides:0},
  {id:"BIKE103",location:"Hostel Block",status:"Available",rides:0},
  {id:"BIKE104",location:"Engineering Block",status:"Available",rides:0}
 ]);
 if(!localStorage.getItem("cr_rides")) write("cr_rides",[]);
}
const titles={dashboard:["Dashboard Overview","Monitor your smart campus mobility system"],users:["User Management","Register and manage students, staff and faculty"],bikes:["Bicycle Fleet","Monitor bicycle availability and utilization"],rides:["Ride Session Management","Start, track and complete ride sessions"],reports:["Reports & Analytics","Analyze system performance and utilization"]};
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>go(b.dataset.page,b));
function go(page,btn){
 document.querySelectorAll(".page").forEach(x=>x.classList.remove("active")); $(page).classList.add("active");
 document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active")); (btn||document.querySelector(`[data-page="${page}"]`)).classList.add("active");
 $("title").textContent=titles[page][0]; $("subtitle").textContent=titles[page][1]; refresh();
}
function addUser(){
 let id=$("userId").value.trim(),name=$("userName").value.trim(),type=$("userType").value,email=$("userEmail").value.trim();
 if(!id||!name||!email)return alert("Please complete all user details.");
 let u=read("cr_users"); if(u.some(x=>x.id===id))return alert("User ID already exists!");
 u.push({id,name,type,email,rides:0});write("cr_users",u);["userId","userName","userEmail"].forEach(x=>$(x).value="");alert("User registered successfully!");refresh();
}
function addBike(){
 let id=$("bikeId").value.trim(),location=$("bikeLocation").value.trim();if(!id||!location)return alert("Please enter bicycle details.");
 let b=read("cr_bikes");if(b.some(x=>x.id===id))return alert("Bicycle ID already exists!");
 b.push({id,location,status:"Available",rides:0});write("cr_bikes",b);$("bikeId").value=$("bikeLocation").value="";alert("Bicycle added successfully!");refresh();
}
function renderUsers(){
 let u=read("cr_users");$("usersTable").innerHTML=u.length?u.map(x=>`<tr><td><b>${x.name}</b></td><td>${x.id}</td><td>${x.type}</td><td>${x.email}</td><td>${x.rides}</td><td><span class="badge available">Active</span></td></tr>`).join(""):`<tr><td colspan="6" class="empty">No users registered yet.</td></tr>`;
}
function renderBikes(){
 let b=read("cr_bikes");$("bikeGrid").innerHTML=b.map(x=>{let p=Math.min(x.rides*15,100);let c=x.status==="Available"?"available":"inuse";return `<article class="bike"><div class="bike-top"><div><div class="bike-id">${x.id}</div><span class="badge ${c}" style="display:inline-block;margin-top:8px">${x.status}</span></div><span>⚡</span></div><div class="bike-icon">🚲</div><p class="location">📍 ${x.location}</p><div class="mini"><span>Utilization</span><b>${p}%</b></div><div class="progress"><div class="bar" style="width:${p}%"></div></div><p class="location" style="margin-top:14px">Total rides completed: <b>${x.rides}</b></p></article>`}).join("")||'<div class="empty">No bicycles in fleet.</div>';
}
function loadOptions(){
 let u=read("cr_users"),b=read("cr_bikes");$("rideUser").innerHTML='<option value="">Select a user</option>'+u.map(x=>`<option value="${x.id}">${x.name} (${x.id})</option>`).join("");
 $("rideBike").innerHTML='<option value="">Select an available bicycle</option>'+b.filter(x=>x.status==="Available").map(x=>`<option value="${x.id}">${x.id} — ${x.location}</option>`).join("");
}
function startRide(){
 let id=$("rideId").value.trim(),userId=$("rideUser").value,bikeId=$("rideBike").value;if(!id||!userId||!bikeId)return alert("Please complete all ride details.");
 let r=read("cr_rides"),b=read("cr_bikes");if(r.some(x=>x.id===id))return alert("Ride ID already exists!");
 let bike=b.find(x=>x.id===bikeId);if(!bike||bike.status!=="Available")return alert("Selected bicycle is not available.");
 r.push({id,userId,bikeId,distance:0,duration:0,fare:0,status:"Active",start:new Date().toLocaleString()});bike.status="In Use";write("cr_rides",r);write("cr_bikes",b);$("rideId").value="";alert("Ride started successfully!");refresh();
}
function endRide(id){
 let distance=Number(prompt("Enter distance travelled in kilometers:"));if(!distance||distance<=0)return alert("Please enter a valid distance.");
 let duration=Number(prompt("Enter ride duration in minutes:"));if(!duration||duration<=0)return alert("Please enter a valid duration.");
 let r=read("cr_rides"),b=read("cr_bikes"),u=read("cr_users"),ride=r.find(x=>x.id===id),fare=distance*5+duration;
 Object.assign(ride,{distance,duration,fare,status:"Completed",end:new Date().toLocaleString()});let bike=b.find(x=>x.id===ride.bikeId);if(bike){bike.status="Available";bike.rides++}let user=u.find(x=>x.id===ride.userId);if(user)user.rides++;
 write("cr_rides",r);write("cr_bikes",b);write("cr_users",u);alert(`Ride completed successfully!\n\nDistance: ${distance} km\nDuration: ${duration} minutes\nTotal Fare: ₹${fare}`);refresh();
}
function renderRides(){
 let r=read("cr_rides"),u=read("cr_users");$("ridesTable").innerHTML=r.length?r.map(x=>{let user=u.find(z=>z.id===x.userId);let c=x.status==="Active"?"inuse":"completed";return `<tr><td><b>${x.id}</b></td><td>${user?user.name:x.userId}</td><td>${x.bikeId}</td><td>${x.distance} km</td><td>${x.duration} min</td><td><b>₹${x.fare}</b></td><td><span class="badge ${c}">${x.status}</span></td><td>${x.status==="Active"?`<button class="green-btn" onclick="endRide('${x.id}')">End Ride</button>`:"—"}</td></tr>`}).join(""):`<tr><td colspan="8" class="empty">No ride sessions available.</td></tr>`;
}
function dashboard(){
 let u=read("cr_users"),b=read("cr_bikes"),r=read("cr_rides"),active=r.filter(x=>x.status==="Active").length,revenue=r.reduce((s,x)=>s+Number(x.fare||0),0);
 $("statUsers").textContent=u.length;$("statBikes").textContent=b.length;$("statActive").textContent=active;$("statRevenue").textContent="₹"+revenue;
 $("activity").innerHTML=r.length?r.slice(-5).reverse().map(x=>{let user=u.find(z=>z.id===x.userId);return `<div class="activity"><div class="icon">${x.status==="Active"?"🚴":"✅"}</div><div><b>${user?user.name:"User"} ${x.status==="Active"?"started":"completed"} a ride</b><p>${x.bikeId} • ${x.status}${x.status==="Completed"?" • ₹"+x.fare:""}</p></div></div>`}).join(""):'<div class="empty">No ride activity yet. Start a new ride to see activity.</div>';
}
function reports(){
 let r=read("cr_rides").filter(x=>x.status==="Completed"),b=read("cr_bikes"),dist=r.reduce((s,x)=>s+x.distance,0),dur=r.reduce((s,x)=>s+x.duration,0),rev=r.reduce((s,x)=>s+x.fare,0);
 $("repRides").textContent=r.length;$("repDistance").textContent=dist+" km";$("repDuration").textContent=(r.length?Math.round(dur/r.length):0)+" min";$("repRevenue").textContent="₹"+rev;
 $("reportTable").innerHTML=b.map(x=>{let p=Math.min(x.rides*15,100),c=x.status==="Available"?"available":"inuse";return `<tr><td><b>${x.id}</b></td><td>📍 ${x.location}</td><td>${x.rides}</td><td><div style="display:flex;align-items:center;gap:8px"><div class="progress" style="width:80px;margin:0"><div class="bar" style="width:${p}%"></div></div>${p}%</div></td><td><span class="badge ${c}">${x.status}</span></td></tr>`}).join("");
}
function refresh(){renderUsers();renderBikes();loadOptions();renderRides();dashboard();reports();}
init();refresh();