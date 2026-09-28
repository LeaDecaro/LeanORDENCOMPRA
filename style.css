const $ = s => document.querySelector(s);

const $$ = s => [...document.querySelectorAll(s)];

const rows = $('#rows');
const schedule = $('#schedule');
const parts = $('#parts');
const details = $('#details');


/* =========================================================
   FORMATO DE DINERO
========================================================= */

function money(n){

return new Intl.NumberFormat('es-AR',{
minimumFractionDigits:2,
maximumFractionDigits:2
}).format(Number(n)||0);

}


function num(v){

v = String(v||'')
.trim()
.replace(/\$/g,'')
.replace(/\./g,'')
.replace(',','.');

let n = Number(v);

return Number.isFinite(n) ? n : 0;

}


/* =========================================================
   NÚMEROS A LETRAS
========================================================= */

function words(n){

n = Math.floor(Math.abs(Number(n)||0));

const u = [
'cero',
'uno',
'dos',
'tres',
'cuatro',
'cinco',
'seis',
'siete',
'ocho',
'nueve',
'diez',
'once',
'doce',
'trece',
'catorce',
'quince',
'dieciséis',
'diecisiete',
'dieciocho',
'diecinueve',
'veinte'
];

if(n<=20)
return u[n];

if(n<30)
return'veinti'+u[n-20];

const d=[
'',
'',
'veinte',
'treinta',
'cuarenta',
'cincuenta',
'sesenta',
'setenta',
'ochenta',
'noventa'
];

if(n<100)
return d[Math.floor(n/10)] +
(n%10 ? ' y '+u[n%10] : '');

if(n<1000){

if(n===100)
return'cien';

const c=[
'',
'ciento',
'doscientos',
'trescientos',
'cuatrocientos',
'quinientos',
'seiscientos',
'setecientos',
'ochocientos',
'novecientos'
];

return c[Math.floor(n/100)] +
(n%100 ? ' '+words(n%100) : '');

}

if(n<1e6){

let a=Math.floor(n/1000);
let b=n%1000;

return(
a===1 ? 'mil' : words(a)+' mil'
)+
(b ? ' '+words(b) : '');

}

if(n<1e9){

let a=Math.floor(n/1e6);
let b=n%1e6;

return(
a===1 ? 'un millón' : words(a)+' millones'
)+
(b ? ' '+words(b) : '');

}

return String(n);

}


/* =========================================================
   RENGLONES
========================================================= */

function addRow(){

let i = rows.children.length + 1;

let tr = document.createElement('tr');

tr.innerHTML = `

<td class="rn">
${i}
</td>

<td>
<input
class="qty"
type="number"
min="0"
step="any">
</td>

<td>

<textarea
class="desc"
rows="2"></textarea>

<input
class="brand"
placeholder="Marca: ">

</td>

<td>

<input
class="period">

</td>

<td>

<input
class="price"
inputmode="decimal"
placeholder="0,00">

</td>

<td>

<input
class="rowtotal"
value="0,00"
readonly>

</td>

`;

rows.appendChild(tr);

bindRow(tr);

syncSchedule();

syncDetails();

calc();

}


function bindRow(tr){

$$('input,textarea',tr).forEach(x => {

x.addEventListener('input',()=>{

calc();

syncScheduleQty();

syncDetails();

});

});

}


function removeRow(){

if(rows.children.length<=1){

alert('Debe quedar al menos un renglón.');

return;

}

rows.lastElementChild.remove();

renumber();

syncSchedule();

syncDetails();

calc();

}


function renumber(){

$$('.rn').forEach((x,i)=>{

x.textContent=i+1;

});

}


/* =========================================================
   CRONOGRAMA
========================================================= */

function syncSchedule(){

let old = [...schedule.children].map(x => ({

p:x.querySelector('.plazo')?.value || '',

l:x.querySelector('.lugar')?.value || ''

}));

schedule.innerHTML='';

[...rows.children].forEach((r,i)=>{

let tr=document.createElement('tr');

tr.innerHTML=`

<td style="text-align:center">
${i+1}
</td>

<td>

<input
class="sqty"
value="${r.querySelector('.qty').value||''}">

</td>

<td>

<input
class="plazo"
value="${old[i]?.p||''}">

</td>

<td>

<textarea
class="lugar"
rows="1">${old[i]?.l||''}</textarea>

</td>

`;

schedule.appendChild(tr);

tr.querySelector('.sqty')
.addEventListener('input',e=>{

r.querySelector('.qty').value=e.target.value;

calc();

});

});

}


function syncScheduleQty(){

[...schedule.children].forEach((tr,i)=>{

let q = rows.children[i]?.querySelector('.qty');

if(q)
tr.querySelector('.sqty').value=q.value;

});

}


/* =========================================================
   DETALLE DEL ANEXO
========================================================= */

function syncDetails(){

let old = [...details.children].map(x =>

x.querySelector('.detExtra')?.value || ''

);

details.innerHTML='';

[...rows.children].forEach((r,i)=>{

let tr=document.createElement('tr');

let text =
r.querySelector('.desc').value +
(
r.querySelector('.brand').value
?
'\nMarca: '+r.querySelector('.brand').value
:
''
);

tr.innerHTML=`

<td style="text-align:center">
${i+1}
</td>

<td>

<textarea
class="detMain">${text
.replace(/&/g,'&amp;')
.replace(/</g,'&lt;')}</textarea>

<textarea
class="detExtra"
placeholder="Detalle de entrega / instrucciones">${old[i]||''}</textarea>

</td>

`;

details.appendChild(tr);

});

}


/* =========================================================
   PARTIDAS PRESUPUESTARIAS
========================================================= */

function addPart(){

let tr=document.createElement('tr');

tr.innerHTML =
'<td>'+
Array(16)
.fill('<input>')
.join('</td><td>')+
'</td>'+
'<td>'+
'<input class="pmonto" readonly value="0,00">'+
'</td>';

parts.appendChild(tr);

calc();

}


/* =========================================================
   CÁLCULO DE TOTALES
========================================================= */

function calc(){

let total=0;

[...rows.children].forEach(r=>{

let cantidad =
Number(
r.querySelector('.qty').value
)||0;

let precio =
num(
r.querySelector('.price').value
);

let subtotal =
cantidad * precio;

r.querySelector('.rowtotal').value =
money(subtotal);

total += subtotal;

});

$('#total').textContent =
money(total);

$('#commitTotal').textContent =
money(total);

$('#words').textContent =
words(total)+' '+
(total===1?'peso':'pesos');

$$('.pmonto').forEach(x=>{

x.value=money(total);

});

}


/* =========================================================
   SINCRONIZACIÓN DE CABECERA
========================================================= */

function sync(){

let d=$('#fecha').value;

let n=$('#numero').value;

let p=$('#proveedor').value;

let shown =
d
?
d.split('-').reverse().join('/')
:
'';

let ids=[
'annDate',
'detDate',
'printDate'
];

ids.forEach(id=>{

$('#'+id).textContent=shown;

});

$$('.footDate').forEach(x=>{

x.textContent=shown;

});

$('#annNum').textContent=n;

$('#detNum').textContent=n;

$$('.syncProv').forEach(x=>{

x.value=p;

});

}


/* =========================================================
   INICIO
========================================================= */

function init(){

let d=new Date();

let iso=d.toISOString().slice(0,10);

$('#fecha').value=iso;


/*
   AL ABRIR:
   EXACTAMENTE 1 RENGLÓN
*/

addRow();


/*
   AL ABRIR:
   EXACTAMENTE 1 PARTIDA
*/

addPart();


/*
   BOTONES
*/

$('#addRow').onclick=addRow;

$('#delRow').onclick=removeRow;

$('#addPart').onclick=addPart;

$('#addPart2').onclick=addPart;


/*
   CAMPOS
*/

$('#fecha').onchange=sync;

$('#numero').oninput=sync;

$('#proveedor').oninput=sync;


/*
   PDF / IMPRESIÓN
*/

$('#pdf').onclick=()=>{

sync();

calc();

window.print();

};


sync();

}


document.addEventListener(
'DOMContentLoaded',
init
);
