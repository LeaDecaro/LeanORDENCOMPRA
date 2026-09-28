const $ = selector =>
  document.querySelector(selector);


const $$ = selector =>
  [...document.querySelectorAll(selector)];


const rowsEl =
  $("#renglones");


const scheduleEl =
  $("#cronograma");


const partsEl =
  $("#partidas");


const detailPages =
  $("#detailPages");


/* =====================================================
   DINERO
===================================================== */

function money(value){

  return new Intl.NumberFormat(
    "es-AR",
    {
      minimumFractionDigits:2,
      maximumFractionDigits:2
    }
  ).format(
    Number(value) || 0
  );

}


function numberValue(value){

  let text =
    String(value || "")
      .trim()
      .replace(/\$/g,"")
      .replace(/\./g,"")
      .replace(",", ".");


  const number =
    Number(text);


  return Number.isFinite(number)
    ? number
    : 0;

}


/* =====================================================
   NUMERO A LETRAS
===================================================== */

const units = [

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


function toWords(number){

  let n =
    Math.floor(
      Math.abs(
        Number(number) || 0
      )
    );


  if(n <= 20){

    return units[n];

  }


  const tens = [

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


  if(n < 30){

    return "veinti" +
      units[n - 20];

  }


  if(n < 100){

    return tens[
      Math.floor(n / 10)
    ] +
      (
        n % 10
          ? " y " + units[n % 10]
          : ""
      );

  }


  if(n < 1000){

    if(n === 100){

      return "cien";

    }


    const hundreds = [

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


    return hundreds[
      Math.floor(n / 100)
    ] +
      (
        n % 100
          ? " " + toWords(n % 100)
          : ""
      );

  }


  if(n < 1000000){

    const thousands =
      Math.floor(n / 1000);


    const rest =
      n % 1000;


    return (

      thousands === 1
        ? "mil"
        : toWords(thousands) + " mil"

    ) +

      (

        rest
          ? " " + toWords(rest)
          : ""

      );

  }


  if(n < 1000000000){

    const millions =
      Math.floor(n / 1000000);


    const rest =
      n % 1000000;


    return (

      millions === 1
        ? "un millón"
        : toWords(millions) + " millones"

    ) +

      (

        rest
          ? " " + toWords(rest)
          : ""

      );

  }


  return String(n);

}


/* =====================================================
   RENGLONES
===================================================== */

function addRow(){

  const tr =
    document.createElement("tr");


  /*
    Guardamos el detalle del anexo
    directamente en el renglón.
  */

  tr.dataset.detail = "";


  tr.innerHTML = `

    <td class="rn"></td>

    <td>

      <input
        class="qty"
        type="number"
        min="0"
        step="any"
      >

    </td>


    <td>

      <textarea
        class="desc"
        rows="3"
      ></textarea>


      <input
        class="marca"
        placeholder="Marca:"
      >

    </td>


    <td>

      <input
        class="period"
      >

    </td>


    <td>

      <input
        class="price"
        inputmode="decimal"
        placeholder="0,00"
      >

    </td>


    <td>

      <input
        class="subtotal"
        value="0,00"
        readonly
      >

    </td>

  `;


  rowsEl.appendChild(tr);


  bindRow(tr);


  renumber();


  updateAll();

}


function removeRow(){

  if(
    rowsEl.children.length <= 1
  ){

    alert(
      "Debe quedar al menos un renglón."
    );

    return;

  }


  rowsEl.lastElementChild.remove();


  renumber();


  updateAll();

}


function renumber(){

  $$(".rn").forEach(
    (element,index)=>{

      element.textContent =
        index + 1;

    }
  );

}


function bindRow(tr){

  $$(
    "input,textarea",
    tr
  ).forEach(
    element=>{

      element.addEventListener(
        "input",
        updateAll
      );

    }
  );

}


/* =====================================================
   TOTAL
===================================================== */

function updateTotals(){

  let total = 0;


  [...rowsEl.children]
    .forEach(row=>{

      const quantity =
        Number(
          row.querySelector(
            ".qty"
          ).value
        ) || 0;


      const price =
        numberValue(
          row.querySelector(
            ".price"
          ).value
        );


      const subtotal =
        quantity * price;


      row.querySelector(
        ".subtotal"
      ).value =
        money(subtotal);


      total += subtotal;

    });


  $("#totalGeneral")
    .textContent =
    money(total);


  $("#totalLetras")
    .textContent =

      toWords(total) +
      " " +
      (
        total === 1
          ? "peso"
          : "pesos"
      );


  $("#compromisoActual")
    .textContent =
    money(total);


  $$(".pmonto")
    .forEach(
      input=>{

        input.value =
          money(total);

      }
    );

}


/* =====================================================
   CRONOGRAMA
===================================================== */

function syncSchedule(){

  const old =
    [...scheduleEl.children]
      .map(row=>({

        plazo:
          row.querySelector(
            ".plazo"
          )?.value || "",

        lugar:
          row.querySelector(
            ".lugar"
          )?.value || ""

      }));


  scheduleEl.innerHTML = "";


  [...rowsEl.children]
    .forEach(
      (row,index)=>{

        const tr =
          document.createElement(
            "tr"
          );


        tr.innerHTML = `

          <td>
            ${index + 1}
          </td>


          <td>

            <input
              class="sqty"
              value="${
                row.querySelector(
                  ".qty"
                ).value || ""
              }"
            >

          </td>


          <td>

            <input
              class="plazo"
              value="${
                old[index]?.plazo || ""
              }"
            >

          </td>


          <td>

            <textarea
              class="lugar"
              rows="1"
            >${
              old[index]?.lugar || ""
            }</textarea>

          </td>

        `;


        scheduleEl.appendChild(tr);


        tr.querySelector(
          ".sqty"
        ).addEventListener(
          "input",
          event=>{

            row.querySelector(
              ".qty"
            ).value =
              event.target.value;


            updateTotals();


            rebuildDetailPages();

          }
        );

      }
    );

}


/* =====================================================
   PARTIDAS
===================================================== */

function addPartida(){

  const tr =
    document.createElement(
      "tr"
    );


  let cells = "";


  for(
    let i = 0;
    i < 16;
    i++
  ){

    cells += `
      <td>
        <input>
      </td>
    `;

  }


  cells += `

    <td>

      <input
        class="pmonto"
        readonly
        value="0,00"
      >

    </td>

  `;


  tr.innerHTML =
    cells;


  partsEl.appendChild(tr);


  updateTotals();

}


/* =====================================================
   DATOS DEL ANEXO
===================================================== */

function currentRows(){

  return [

    ...rowsEl.children

  ].map(
    (row,index)=>({

      n:
        index + 1,

      desc:
        row.querySelector(
          ".desc"
        ).value || "",

      marca:
        row.querySelector(
          ".marca"
        ).value || "",

      detail:
        row.dataset.detail || ""

    })
  );

}


/* =====================================================
   ESCAPE
===================================================== */

function escapeHtml(value){

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    );

}


/* =====================================================
   PAGINADO DEL ANEXO
=====================================================

   IMPORTANTE:

   No se reserva una caja gigante para
   "Detalle de entrega".

   Cada renglón ocupa solamente
   el espacio que necesita.

   Cuando no entra otro renglón,
   se crea otra hoja.

===================================================== */

function rebuildDetailPages(){

  detailPages.innerHTML = "";


  const data =
    currentRows();


  if(!data.length){

    return;

  }


  /*
    Altura aproximada disponible
    dentro de una hoja A4.
  */

  const usableHeight =
    245;


  let currentPage =
    createDetailPage(3);


  detailPages.appendChild(
    currentPage
  );


  let usedHeight = 0;


  data.forEach(
    (item,index)=>{

      const block =
        createDetailRow(
          item,
          index
        );


      currentPage
        .querySelector(
          ".detail-body"
        )
        .appendChild(block);


      /*
        Medimos la altura real
        del bloque.
      */

      const px =
        block.getBoundingClientRect()
          .height || 40;


      const mm =
        px * 25.4 / 96;


      /*
        Si no entra, lo sacamos
        y creamos otra página.
      */

      if(

        usedHeight + mm >
          usableHeight &&

        currentPage.querySelectorAll(
          ".detail-row"
        ).length > 1

      ){

        block.remove();


        currentPage =
          createDetailPage(
            3 +
            detailPages.children.length
          );


        detailPages.appendChild(
          currentPage
        );


        currentPage
          .querySelector(
            ".detail-body"
          )
          .appendChild(block);


        usedHeight =
          mm;

      }

      else{

        usedHeight +=
          mm;

      }

    }
  );

}


/* =====================================================
   CREA PAGINA DEL ANEXO
===================================================== */

function createDetailPage(
  pageNumber
){

  const section =
    document.createElement(
      "section"
    );


  section.className =
    "page detail-page";


  section.innerHTML = `

    <header class="doc-header">

      <div class="brand">

        <div class="shield">
          ✦
        </div>

        <div class="gov">

          <strong>
            GOBIERNO<br>
            DE LA PROVINCIA<br>
            DEL NEUQUÉN
          </strong>

        </div>

      </div>


      <div class="ministry">

        <strong>
          MINISTERIO DE JUVENTUD, DEPORTE Y CULTURA
        </strong>

        <br>

        <strong>
          CUIT: 30718390326
        </strong>

      </div>

    </header>


    <div class="top-rule"></div>


    <div class="ann-top">

      <div></div>

      <div>

        Fecha Emisión
        <span class="fecha-pie"></span>

        <br>

        Número
        <span class="numero-pie"></span>
        / 1

      </div>

    </div>


    <div class="detail-title">
      ORDEN DE COMPRA
    </div>


    <div class="detail-subtitle">
      Anexo
    </div>


    <div class="fields">

      <div>
        <b>Actuación Contable:</b>
        <input>
      </div>


      <div>
        <b>Contratación directa Nro.</b>
        <input class="short">
      </div>


      <div>
        <b>Norma legal de Adjudicación:</b>
        <input value="Ley Nº2141">
      </div>


      <div>
        <b>Proveedor:</b>
        <input class="provider sync-provider">
      </div>

    </div>


    <table class="detail-table">

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


      <tbody class="detail-body"></tbody>

    </table>


    <footer>

      SAFIPRO - Sistema de Contrataciones de la Provincia del Neuquén

      <span>
        Página ${pageNumber}
      </span>

      <span class="fecha-pie"></span>

    </footer>

  `;


  return section;

}


/* =====================================================
   CREA RENGLON DEL ANEXO
===================================================== */

function createDetailRow(
  item,
  index
){

  const row =
    document.createElement(
      "div"
    );


  row.className =
    "detail-row";


  row.innerHTML = `

    <div class="detail-num">

      ${item.n}

    </div>


    <div class="detail-content">

      <div class="detail-label">
        Item Solicitado
      </div>


      <div class="detail-print-desc">

        ${
          escapeHtml(
            item.desc
          )
        }

        ${
          item.marca
            ? "\nMarca: " +
              escapeHtml(
                item.marca
              )
            : ""
        }

      </div>


      <div class="detail-edit">

        <div class="detail-label">

          Detalle de entrega / instrucciones

        </div>


        <textarea
          class="detail-instructions-editor"
          rows="3"
          placeholder="Escriba aquí el detalle de entrega / instrucciones"
        >${
          escapeHtml(
            item.detail
          )
        }</textarea>

      </div>


      <div class="detail-print">

        <div class="detail-label">

          Detalle de entrega / instrucciones

        </div>


        <div class="detail-print-instructions">

          ${
            escapeHtml(
              item.detail
            )
          }

        </div>

      </div>

    </div>

  `;


  const editor =
    row.querySelector(
      ".detail-instructions-editor"
    );


  /*
    Lo que se escribe en el anexo
    queda guardado en el renglón.
  */

  editor.addEventListener(
    "input",
    ()=>{

      const source =
        rowsEl.children[index];


      if(source){

        source.dataset.detail =
          editor.value;

      }


      const printed =
        row.querySelector(
          ".detail-print-instructions"
        );


      if(printed){

        printed.textContent =
          editor.value;

      }

    }
  );


  return row;

}


/* =====================================================
   CABECERA
===================================================== */

function syncHeader(){

  const date =
    $("#fecha").value;


  const shown =
    date
      ? date
        .split("-")
        .reverse()
        .join("/")
      : "";


  $$(".fecha-pie")
    .forEach(
      element=>{

        element.textContent =
          shown;

      }
    );


  $("#fechaPrint")
    .textContent =
    shown;


  $$(".numero-pie")
    .forEach(
      element=>{

        element.textContent =
          $("#numero").value || "";

      }
    );


  $$(".sync-provider")
    .forEach(
      element=>{

        element.value =
          $("#proveedor").value || "";

      }
    );

}


/* =====================================================
   ACTUALIZACION GENERAL
===================================================== */

function updateAll(){

  renumber();

  updateTotals();

  syncSchedule();

  syncHeader();

  rebuildDetailPages();

}


/* =====================================================
   BOTONES
===================================================== */

$("#btnAddRow")
  .addEventListener(
    "click",
    addRow
  );


$("#btnRemoveRow")
  .addEventListener(
    "click",
    removeRow
  );


$("#btnAddPartida")
  .addEventListener(
    "click",
    addPartida
  );


/* =====================================================
   CABECERA EDITABLE
===================================================== */

$("#fecha")
  .addEventListener(
    "change",
    syncHeader
  );


$("#numero")
  .addEventListener(
    "input",
    syncHeader
  );


$("#proveedor")
  .addEventListener(
    "input",
    syncHeader
  );


/* =====================================================
   PDF
===================================================== */

$("#btnPDF")
  .addEventListener(
    "click",
    ()=>{

      syncHeader();

      updateTotals();

      rebuildDetailPages();

      /*
        No usamos html2pdf.

        El navegador genera el A4 directamente.
        Al imprimir desaparecen los botones.
      */

      window.print();

    }
  );


/* =====================================================
   INICIO
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  ()=>{

    const now =
      new Date();


    const localDate =
      new Date(
        now.getTime() -
        now.getTimezoneOffset() * 60000
      )
      .toISOString()
      .slice(0,10);


    $("#fecha").value =
      localDate;


    /*
      EXACTAMENTE UN RENGLON
    */

    addRow();


    /*
      EXACTAMENTE UNA PARTIDA
    */

    addPartida();


    syncHeader();

  }
);
