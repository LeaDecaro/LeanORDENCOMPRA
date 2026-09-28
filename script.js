"use strict";

const $ = (s, root=document) =>
    root.querySelector(s);

const $$ = (s, root=document) =>
    [...root.querySelectorAll(s)];


/* =====================================================
   DINERO
===================================================== */

function money(n){

    return new Intl.NumberFormat(
        "es-AR",
        {
            minimumFractionDigits:2,
            maximumFractionDigits:2
        }
    ).format(
        Number(n) || 0
    );

}


function parseMoney(v){

    let s =
        String(v ?? "")
            .trim()
            .replace(/\s|\$/g,"");

    if(!s){
        return 0;
    }

    if(
        s.includes(".") &&
        s.includes(",")
    ){

        s =
            s
                .replace(/\./g,"")
                .replace(",", ".");

    }
    else if(
        s.includes(",")
    ){

        s =
            s.replace(",", ".");

    }

    const n =
        Number(s);

    return Number.isFinite(n)
        ? n
        : 0;

}


/* =====================================================
   FECHA
===================================================== */

function today(){

    const d =
        new Date();

    return `${d.getFullYear()}-${
        String(d.getMonth()+1).padStart(2,"0")
    }-${
        String(d.getDate()).padStart(2,"0")
    }`;

}


function dateAR(v){

    if(!v){
        return "";
    }

    const p =
        v.split("-");

    return p.length === 3
        ? `${p[2]}/${p[1]}/${p[0]}`
        : v;

}


/* =====================================================
   NUMEROS A LETRAS
===================================================== */

const U = [

    "cero",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "dieciséis",
    "diecisiete",
    "dieciocho",
    "diecinueve",
    "veinte"

];


function w100(n){

    if(n <= 20){
        return U[n];
    }

    if(n < 30){
        return "veinti" + U[n-20];
    }

    const d = [

        "",
        "",
        "veinte",
        "treinta",
        "cuarenta",
        "cincuenta",
        "sesenta",
        "setenta",
        "ochenta",
        "noventa"

    ];

    return d[Math.floor(n/10)] +
        (
            n % 10
                ? ` y ${U[n%10]}`
                : ""
        );

}


function w1000(n){

    if(n < 100){
        return w100(n);
    }

    if(n === 100){
        return "cien";
    }

    const c = [

        "",
        "ciento",
        "doscientos",
        "trescientos",
        "cuatrocientos",
        "quinientos",
        "seiscientos",
        "setecientos",
        "ochocientos",
        "novecientos"

    ];

    return c[Math.floor(n/100)] +
        (
            n % 100
                ? ` ${w100(n%100)}`
                : ""
        );

}


function words(n){

    n =
        Math.floor(
            Math.abs(
                Number(n) || 0
            )
        );


    if(n === 0){
        return "cero";
    }


    if(n < 1000){
        return w1000(n);
    }


    if(n < 1000000){

        const a =
            Math.floor(n/1000);

        const b =
            n % 1000;

        return (
            a === 1
                ? "mil"
                : `${words(a)} mil`
        ) +
        (
            b
                ? ` ${w1000(b)}`
                : ""
        );

    }


    if(n < 1000000000){

        const a =
            Math.floor(n/1000000);

        const b =
            n % 1000000;

        return (
            a === 1
                ? "un millón"
                : `${words(a)} millones`
        ) +
        (
            b
                ? ` ${words(b)}`
                : ""
        );

    }


    return String(n);

}


/* =====================================================
   RENGLONES
===================================================== */

function newRow(index){

    const tr =
        document.createElement("tr");

    tr.className =
        "renglon";

    tr.dataset.detail =
        "";


    tr.innerHTML = `

        <td class="reng-num">
            ${index}
        </td>


        <td>

            <input
                class="campo-cantidad"
                type="number"
                min="0"
                step="any"
            >

        </td>


        <td>

            <textarea
                class="descripcion"
                rows="2"
            ></textarea>


            <input
                class="marca"
                type="text"
                placeholder="Marca: "
            >

        </td>


        <td>

            <input
                class="campo-periodo"
                type="text"
            >

        </td>


        <td>

            <input
                class="campo-precio"
                type="text"
                inputmode="decimal"
                placeholder="0,00"
            >

        </td>


        <td>

            <input
                class="campo-total"
                type="text"
                value="0,00"
                readonly
            >

        </td>

    `;


    $(".campo-cantidad",tr)
        .addEventListener(
            "input",
            ()=>{

                updateTotals();

                updateCronograma(false);

                renderDetailPages();

            }
        );


    $(".campo-precio",tr)
        .addEventListener(
            "input",
            updateTotals
        );


    $(".descripcion",tr)
        .addEventListener(
            "input",
            renderDetailPages
        );


    $(".marca",tr)
        .addEventListener(
            "input",
            renderDetailPages
        );


    return tr;

}


function renumber(){

    $$("#renglones .renglon")
        .forEach(
            (r,i)=>{

                $(".reng-num",r)
                    .textContent =
                    i + 1;

            }
        );

}


function addRenglon(){

    const n =
        $$("#renglones .renglon")
            .length + 1;


    $("#renglones")
        .appendChild(
            newRow(n)
        );


    renumber();

    updateCronograma(true);

    updateTotals();

    renderDetailPages();

}


function removeRenglon(){

    const rows =
        $$("#renglones .renglon");


    if(rows.length === 1){

        alert(
            "Debe quedar al menos un renglón."
        );

        return;

    }


    rows[
        rows.length - 1
    ].remove();


    renumber();

    updateCronograma(true);

    updateTotals();

    renderDetailPages();

}


/* =====================================================
   CRONOGRAMA
===================================================== */

function updateCronograma(rebuild=true){

    const body =
        $("#cronograma");


    const old =
        [
            ...body.querySelectorAll("tr")
        ]
        .map(
            tr=>({

                plazo:
                    $(".entrega-plazo",tr)
                        ?.value || "",

                lugar:
                    $(".entrega-lugar",tr)
                        ?.value || ""

            })
        );


    body.innerHTML = "";


    $$("#renglones .renglon")
        .forEach(
            (row,i)=>{

                const tr =
                    document.createElement(
                        "tr"
                    );


                const qty =
                    $(".campo-cantidad",row)
                        .value || "";


                tr.innerHTML = `

                    <td
                        style="text-align:center"
                    >
                        ${i+1}
                    </td>


                    <td>

                        <input
                            class="entrega-cantidad"
                            type="text"
                            value="${qty}"
                        >

                    </td>


                    <td>

                        <input
                            class="entrega-plazo"
                            type="text"
                            value="${escapeAttr(
                                old[i]?.plazo || ""
                            )}"
                        >

                    </td>


                    <td>

                        <textarea
                            class="entrega-lugar"
                            rows="1"
                        >${escapeHtml(
                            old[i]?.lugar || ""
                        )}</textarea>

                    </td>

                `;


                $(".entrega-cantidad",tr)
                    .addEventListener(
                        "input",
                        e=>{

                            $(".campo-cantidad",row)
                                .value =
                                e.target.value;


                            updateTotals();

                            renderDetailPages();

                        }
                    );


                body.appendChild(tr);

            }
        );

}


function escapeHtml(v){

    return String(v ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;");

}


function escapeAttr(v){

    return String(v ?? "")
        .replace(/&/g,"&amp;")
        .replace(/"/g,"&quot;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;");

}


/* =====================================================
   PARTIDAS
===================================================== */

const budgetCols = [

    "Ejer",
    "Juri",
    "SA",
    "Unor",
    "Cpn1",
    "Cpn2",
    "Cpn3",
    "Fina",
    "Func",
    "SFunc",
    "INC",
    "Ppal",
    "Ppar",
    "Spar",
    "Fufi",
    "Ubge"

];


function newPartida(){

    const tr =
        document.createElement(
            "tr"
        );


    tr.innerHTML =

        budgetCols
            .map(
                ()=>`
                    <td>
                        <input type="text">
                    </td>
                `
            )
            .join("") +

        `
            <td>

                <input
                    class="campo-monto"
                    type="text"
                    value="0,00"
                    readonly
                >

            </td>
        `;


    return tr;

}


function addPartida(){

    $("#partidas")
        .appendChild(
            newPartida()
        );


    updateTotals();

}


/* =====================================================
   TOTALES Y CABECERA
===================================================== */

function updateTotals(){

    let total = 0;


    $$("#renglones .renglon")
        .forEach(
            row=>{

                const q =
                    Number(
                        $(".campo-cantidad",row)
                            .value
                    ) || 0;


                const p =
                    parseMoney(
                        $(".campo-precio",row)
                            .value
                    );


                const t =
                    q * p;


                $(".campo-total",row)
                    .value =
                    money(t);


                total += t;

            }
        );


    $("#totalGeneral")
        .textContent =
        money(total);


    $("#totalLetras")
        .textContent =

        `${words(total)} ${
            total === 1
                ? "peso"
                : "pesos"
        }`;


    $("#totalCompromiso")
        .textContent =
        money(total);


    $$(".campo-monto")
        .forEach(
            i=>{

                i.value =
                    money(total);

            }
        );

}


function syncHeader(){

    const fecha =
        $("#fechaEmision")
            .value;


    const numero =
        $("#numeroOC")
            .value || "";


    const prov =
        $("#proveedor")
            .value || "";


    $("#fechaPie")
        .textContent =
        dateAR(fecha);


    $$(".fechaPieRef")
        .forEach(
            e=>{

                e.textContent =
                    dateAR(fecha);

            }
        );


    $("#fechaAnexo")
        .textContent =
        dateAR(fecha);


    $("#numeroAnexo")
        .textContent =
        numero;


    $$("[data-sync=proveedor]")
        .forEach(
            e=>{

                e.value =
                    prov;

            }
        );

}


/* =====================================================
   DATOS PARA ANEXO
===================================================== */

function getRowData(){

    return $$("#renglones .renglon")
        .map(
            (row,i)=>({

                n:
                    i + 1,

                desc:
                    $(".descripcion",row)
                        .value || "",

                marca:
                    $(".marca",row)
                        .value || "",

                detail:
                    row.dataset.detail || ""

            })
        );

}


/* =====================================================
   PAGINA DE DETALLE
===================================================== */

function detailPageTemplate(pageNumber){

    const section =
        document.createElement(
            "section"
        );


    section.className =
        "pagina pagina-detalle";


    section.innerHTML = `

        <header class="cabecera">

            <div class="logo-wrap">

                <img
                    class="logo-gobierno"
                    alt="Gobierno de la Provincia del Neuquén"
                    src="data:image/jpeg;base64,${LOGO_B64}"
                >

            </div>


            <div class="ministerio">

                <div>
                    MINISTERIO DE JUVENTUD, DEPORTE Y CULTURA
                </div>

                <div>
                    CUIT: 30718390326
                </div>

            </div>

        </header>


        <div class="cabecera-linea"></div>


        <div class="anexo-top">

            <div></div>

            <div class="fecha-numero compacto">

                <div>
                    Fecha Emisión
                    <span class="fechaDetalle"></span>
                </div>

                <div>
                    Número
                    <span class="numeroDetalle"></span>
                    / 1
                </div>

            </div>

        </div>


        <h2>
            ORDEN DE COMPRA
        </h2>


        <h3>
            Anexo
        </h3>


        <div class="datos-anexo detalle-cabecera">

            <div>

                <b>Actuación Contable:</b>

                <input
                    class="editable linea"
                    type="text"
                >

            </div>


            <div>

                <b>Contratación directa Nro.</b>

                <input
                    class="editable linea corta"
                    type="text"
                >

            </div>


            <div>

                <b>Norma legal de Adjudicación:</b>

                <input
                    class="editable linea norma"
                    value="Ley Nº2141"
                >

            </div>


            <div>

                <b>Proveedor:</b>

                <input
                    class="editable linea proveedor"
                    data-sync="proveedor"
                    type="text"
                >

            </div>

        </div>


        <table class="tabla tabla-detalle">

            <colgroup>

                <col class="det-reng">
                <col class="det-item">

            </colgroup>


            <thead>

                <tr>

                    <th>
                        Renglon
                    </th>

                    <th>
                        Item Solicitado
                    </th>

                </tr>

            </thead>


            <tbody class="detalle-body"></tbody>

        </table>


        <footer class="pie">

            <span>
                SAFIPRO - Sistema de Contrataciones de la Provincia del Neuquén
            </span>

            <span>
                Página ${pageNumber}
            </span>

            <span>
                Fecha Impresión
                <span class="fechaPieRef"></span>
            </span>

        </footer>

    `;


    return section;

}


/* =====================================================
   RENGLON DEL ANEXO

   El detalle queda PEGADO a la descripción.
===================================================== */

function detailRow(item,index){

    const tr =
        document.createElement(
            "tr"
        );


    tr.className =
        "detalle-row-wrap";


    tr.innerHTML = `

        <td
            style="
                text-align:center;
                vertical-align:top;
                padding:1.5mm
            "
        >
            ${item.n}
        </td>


        <td>

            <div class="detalle-content">

                <div class="detalle-descripcion">

                    ${escapeHtml(
                        item.desc
                    )}

                </div>


                ${
                    item.marca
                        ? `
                            <div class="detalle-marca">
                                Marca:
                                ${escapeHtml(item.marca)}
                            </div>
                          `
                        : ""
                }


                <div class="detalle-linea">
                    ------------------------------------Detalle---------------------------------------
                </div>


                <textarea
                    class="detalle-editable"
                    data-index="${index}"
                    placeholder="Escriba aquí el detalle de entrega / instrucciones"
                >${escapeHtml(
                    item.detail
                )}</textarea>


                <div class="detalle-print">

                    ${escapeHtml(
                        item.detail
                    )}

                </div>

            </div>

        </td>

    `;


    const ta =
        $(".detalle-editable",tr);


    ta.addEventListener(
        "input",
        ()=>{

            const source =
                $$("#renglones .renglon")[index];


            if(source){

                source.dataset.detail =
                    ta.value;

            }


            autoGrow(ta);

        }
    );


    return tr;

}


function autoGrow(el){

    el.style.height =
        "auto";


    el.style.height =
        Math.max(
            el.scrollHeight,
            45
        ) + "px";

}


/* =====================================================
   PAGINADO DEL ANEXO

   Cada página mide exactamente A4.
   El renglón se pasa completo a la página siguiente
   cuando no entra.
===================================================== */

function renderDetailPages(){

    const host =
        $("#detallePaginas");


    if(!host){
        return;
    }


    host.innerHTML =
        "";


    const data =
        getRowData();


    let pageNo =
        4;


    let page =
        detailPageTemplate(
            pageNo
        );


    host.appendChild(
        page
    );


    syncDetailHeader(
        page
    );


    const body =
        $(".detalle-body",page);


    data.forEach(
        (item,index)=>{

            const row =
                detailRow(
                    item,
                    index
                );


            body.appendChild(
                row
            );


            /*
             * Como la página tiene
             * altura A4 fija, podemos
             * comprobar si se desbordó.
             */

            const over =
                page.scrollHeight >
                (
                    page.clientHeight - 55
                );


            if(
                over &&
                body.children.length > 1
            ){

                body.removeChild(
                    row
                );


                pageNo++;


                page =
                    detailPageTemplate(
                        pageNo
                    );


                host.appendChild(
                    page
                );


                syncDetailHeader(
                    page
                );


                $(".detalle-body",page)
                    .appendChild(
                        row
                    );

            }

        }
    );


    $$(".detalle-editable",host)
        .forEach(
            autoGrow
        );

}


/* =====================================================
   CABECERA DE CADA PAGINA DEL ANEXO
===================================================== */

function syncDetailHeader(page){

    const fecha =
        $("#fechaEmision")
            .value;


    const numero =
        $("#numeroOC")
            .value || "";


    $(".fechaDetalle",page)
        .textContent =
        dateAR(fecha);


    $(".numeroDetalle",page)
        .textContent =
        numero;


    $(".fechaPieRef",page)
        .textContent =
        dateAR(fecha);


    $$(
        '[data-sync="proveedor"]',
        page
    )
    .forEach(
        e=>{

            e.value =
                $("#proveedor")
                    .value || "";

        }
    );

}


/* =====================================================
   PDF / IMPRESION

   Se utiliza la impresion nativa del navegador.
   No html2pdf.
===================================================== */

function printPDF(){

    syncHeader();

    updateTotals();

    updateCronograma(false);

    renderDetailPages();

    window.print();

}


/* =====================================================
   LOGO
===================================================== */

const LOGO_B64 = "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";


document.addEventListener(
    "DOMContentLoaded",
    ()=>{

        /* Cargar logo en todos los encabezados */

        $$(".logo-gobierno")
            .forEach(
                img=>{

                    img.src =
                        "data:image/jpeg;base64," +
                        LOGO_B64;

                }
            );


        /* Fecha inicial */

        $("#fechaEmision")
            .value =
            today();


        /* EXACTAMENTE UN RENGLON */

        $("#renglones")
            .appendChild(
                newRow(1)
            );


        /* EXACTAMENTE UNA PARTIDA */

        $("#partidas")
            .appendChild(
                newPartida()
            );


        /* Botones */

        $("#btnAgregarRenglon")
            .addEventListener(
                "click",
                addRenglon
            );


        $("#btnQuitarRenglon")
            .addEventListener(
                "click",
                removeRenglon
            );


        $("#btnAgregarPartida")
            .addEventListener(
                "click",
                addPartida
            );


        $("#btnPDF")
            .addEventListener(
                "click",
                printPDF
            );


        /* Fecha */

        $("#fechaEmision")
            .addEventListener(
                "change",
                ()=>{

                    syncHeader();

                    renderDetailPages();

                }
            );


        /* Numero */

        $("#numeroOC")
            .addEventListener(
                "input",
                ()=>{

                    syncHeader();

                    renderDetailPages();

                }
            );


        /* Proveedor */

        $("#proveedor")
            .addEventListener(
                "input",
                ()=>{

                    syncHeader();

                    renderDetailPages();

                }
            );


        /* Inicialización */

        updateCronograma(true);

        updateTotals();

        syncHeader();

        renderDetailPages();

    }
);
