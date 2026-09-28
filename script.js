const $ = (selector, root = document) =>
  root.querySelector(selector);

const $$ = (selector, root = document) =>
  [...root.querySelectorAll(selector)];


/* =========================
   DINERO
========================= */

function moneyNumber(value) {

  if (typeof value !== "string") {
    return Number(value) || 0;
  }

  value = value
    .trim()
    .replace(/\$/g, "")
    .replace(/\s/g, "");

  if (value.includes(",") && value.includes(".")) {
    value = value
      .replace(/\./g, "")
      .replace(",", ".");
  }
  else if (value.includes(",")) {
    value = value.replace(",", ".");
  }

  return Number(value) || 0;
}


function formatMoney(number) {

  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number || 0);

}


/* =========================
   NUMEROS EN LETRAS
========================= */

function numberToWords(number) {

  number = Math.floor(Math.abs(number || 0));

  if (number === 0) {
    return "cero";
  }

  const units = [
    "",
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


  function under1000(number) {

    if (number <= 20) {
      return units[number];
    }

    if (number < 100) {

      if (number % 10 === 0) {
        return tens[number / 10];
      }

      if (number < 30) {
        return "veinti" + units[number - 20];
      }

      return (
        tens[Math.floor(number / 10)] +
        " y " +
        units[number % 10]
      );
    }

    if (number === 100) {
      return "cien";
    }

    if (number < 200) {
      return "ciento " + under1000(number - 100);
    }

    return (
      hundreds[Math.floor(number / 100)] +
      (number % 100
        ? " " + under1000(number % 100)
        : "")
    );
  }


  function group(number, label, singular) {

    if (!number) {
      return "";
    }

    if (number === 1) {
      return singular;
    }

    return under1000(number) + " " + label;
  }


  const parts = [];

  const millions =
    Math.floor(number / 1000000);

  number %= 1000000;

  const thousands =
    Math.floor(number / 1000);

  number %= 1000;


  if (millions) {
    parts.push(
      group(
        millions,
        "millones",
        "un millón"
      )
    );
  }


  if (thousands) {

    if (thousands === 1) {
      parts.push("mil");
    }
    else {
      parts.push(
        under1000(thousands) + " mil"
      );
    }
  }


  if (number) {
    parts.push(
      under1000(number)
    );
  }


  return parts.join(" ");
}


function pluralPeso(number) {

  return number === 1
    ? "peso"
    : "pesos";

}


/* =========================
   TOTAL GENERAL
========================= */

function totalRows() {

  return $$(".main-row").reduce(
    (sum, row) => {

      return (
        sum +
        (
          moneyNumber(
            $(".row-total", row).value
          ) || 0
        )
      );

    },
    0
  );

}


function updateTotals() {

  let total = 0;


  $$(".main-row").forEach(row => {

    const quantity =
      moneyNumber(
        $(".row-qty", row).value
      );

    const price =
      moneyNumber(
        $(".row-price", row).value
      );

    const rowTotal =
      quantity * price;


    $(".row-total", row).value =
      formatMoney(rowTotal);


    total += rowTotal;

  });


  $("#totalGeneral").textContent =
    formatMoney(total);


  $("#totalLetras").textContent =
    numberToWords(total) +
    " " +
    pluralPeso(total);


  $("#compromisoActual").textContent =
    formatMoney(total);


  updateDeliveries();
  updateDetails();
  syncBudgetMonto();

}


/* =========================
   NUMERAR RENGLONES
========================= */

function renumber(
  container,
  selector = ".main-row"
) {

  $$(selector, container).forEach(
    (row, index) => {

      const number = index + 1;

      $(".row-number", row)
        .textContent = number;

      row.dataset.renglon =
        number;

    }
  );

}


/* =========================
   CREAR RENGLON
========================= */

function makeMainRow() {

  const row =
    document.createElement("tr");


  row.className =
    "main-row";

  row.dataset.renglon =
    "1";


  row.innerHTML = `

    <td class="row-number">
      1
    </td>

    <td>
      <input
        class="row-qty numeric"
        type="number"
        min="0"
        step="any"
        value=""
      >
    </td>

    <td>

      <div class="item-area">

        <div class="row-tools no-print">

          <button
            type="button"
            class="btn-delete-row"
          >
            Eliminar
          </button>

        </div>

        <textarea
          class="item-description"
          placeholder=""
        ></textarea>

        <input
          class="item-brand"
          placeholder="Marca: "
        >

      </div>

    </td>

    <td>

      <input
        class="row-period numeric"
        value=""
      >

    </td>

    <td>

      <input
        class="row-price money numeric"
        inputmode="decimal"
        placeholder="0,00"
      >

    </td>

    <td>

      <input
        class="row-total money numeric"
        value="0,00"
        readonly
      >

    </td>

  `;


  $(
    ".row-qty",
    row
  ).addEventListener(
    "input",
    updateTotals
  );


  $(
    ".row-price",
    row
  ).addEventListener(
    "input",
    updateTotals
  );


  $(
    ".btn-delete-row",
    row
  ).addEventListener(
    "click",
    () =>
      removeMainRow(
        $(".btn-delete-row", row)
      )
  );


  return row;

}


/* =========================
   AGREGAR RENGLON
========================= */

function addMainRow() {

  const tbody =
    $("#renglones");

  const row =
    makeMainRow();


  tbody.appendChild(row);

  renumber(tbody);

  updateTotals();

}


/* =========================
   ELIMINAR RENGLON
========================= */

function removeMainRow(button) {

  const rows =
    $$(".main-row");


  if (rows.length === 1) {
    return;
  }


  button
    .closest("tr")
    .remove();


  renumber(
    $("#renglones")
  );


  updateTotals();

}


/* =========================
   CRONOGRAMA DE ENTREGAS
========================= */

function updateDeliveries() {

  const body =
    $("#entregas");

  const existing =
    [...body.querySelectorAll("tr")];

  const rows =
    $$(".main-row");


  while (
    existing.length > rows.length
  ) {

    existing.pop().remove();

  }


  rows.forEach(
    (main, index) => {

      let tr =
        body.querySelectorAll("tr")[index];


      if (!tr) {

        tr =
          document.createElement("tr");


        tr.innerHTML = `

          <td class="delivery-number"></td>

          <td>
            <input
              class="delivery-qty"
              type="number"
              min="0"
              step="any"
            >
          </td>

          <td>
            <input
              class="delivery-deadline"
            >
          </td>

          <td>
            <textarea
              class="delivery-place"
              placeholder=""
            ></textarea>
          </td>

        `;


        body.appendChild(tr);

      }


      $(".delivery-number", tr)
        .textContent =
        index + 1;


      $(".delivery-qty", tr)
        .value =
        $(".row-qty", main).value;

    }
  );

}


/* =========================
   DETALLE DEL ANEXO
========================= */

function updateDetails() {

  const body =
    $("#detalles");

  const rows =
    $$(".main-row");

  const existing =
    [...body.querySelectorAll("tr")];


  while (
    existing.length > rows.length
  ) {

    existing.pop().remove();

  }


  rows.forEach(
    (main, index) => {

      let tr =
        body.querySelectorAll("tr")[index];


      if (!tr) {

        tr =
          document.createElement("tr");


        tr.innerHTML = `

          <td class="detail-number"></td>

          <td>

            <div class="detail-main"></div>

            <div class="detail-separator">
              ------------------------------------Detalle---------------------------------------
            </div>

            <textarea
              class="delivery-detail"
              placeholder=""
            ></textarea>

          </td>

        `;


        body.appendChild(tr);

      }


      $(".detail-number", tr)
        .textContent =
        index + 1;


      const description =
        $(".item-description", main)
          .value
          .trim();


      const brand =
        $(".item-brand", main)
          .value
          .trim();


      $(".detail-main", tr)
        .textContent =
        description +
        (
          brand
            ? "\n" + brand
            : ""
        );

    }
  );

}


/* =========================
   PARTIDAS PRESUPUESTARIAS
========================= */

function addBudgetRow() {

  const tr =
    document.createElement("tr");


  const names = [
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


  tr.innerHTML =
    names
      .map(
        (_, index) =>
          `
          <td>
            <input
              class="budget-field"
              data-index="${index}"
            >
          </td>
          `
      )
      .join("") +

      `

      <td>

        <input
          class="budget-monto money"
          value="0,00"
          readonly
        >

      </td>

      `;


  $("#partidas")
    .appendChild(tr);


  syncBudgetMonto();

}


/* =========================
   MONTO DEL ANEXO
========================= */

function syncBudgetMonto() {

  $$("#partidas .budget-monto")
    .forEach(input => {

      input.value =
        formatMoney(
          totalRows()
        );

    });

}


/* =========================
   CAMPOS COMUNES
========================= */

function copyCommonFields() {

  const fecha =
    $("#fechaEmision").value;

  const numero =
    $("#numeroOC").value;


  $$(
    '[data-copy="fechaEmision"]'
  ).forEach(element => {

    element.value =
      fecha;

  });


  $$(
    '[data-copy="numeroOC"]'
  ).forEach(element => {

    element.value =
      numero;

  });


  $(".print-date");

  $$(".print-date")
    .forEach(element => {

      element.textContent =
        fecha;

    });

}


/* =========================
   FECHA ACTUAL
========================= */

function setToday() {

  const date =
    new Date();


  const value =
    String(
      date.getDate()
    ).padStart(2, "0") +

    "/" +

    String(
      date.getMonth() + 1
    ).padStart(2, "0") +

    "/" +

    date.getFullYear();


  $("#fechaEmision").value =
    value;


  $("#fechaImpresion").value =
    value;


  copyCommonFields();

}


/* =========================
   PROVEEDOR
========================= */

function syncProviderAndMeta() {

  const provider =
    $(".provider-inline")?.value || "";


  $$(".page-3 .provider-inline, .page-4 .provider-inline")
    .forEach(
      (element, index) => {

        if (index > 0) {
          element.value =
            provider;
        }

      }
    );

}


/* =========================
   INICIO
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setToday();


    /* SOLO UN RENGLÓN INICIAL */

    addMainRow();


    /* SOLO UNA PARTIDA INICIAL */

    addBudgetRow();


    /* BOTONES */

    $("#btnAgregarRenglon")
      .addEventListener(
        "click",
        addMainRow
      );


    $("#btnAgregarAnexo")
      .addEventListener(
        "click",
        addBudgetRow
      );


    /* CAMPOS COMUNES */

    $("#fechaEmision")
      .addEventListener(
        "input",
        copyCommonFields
      );


    $("#numeroOC")
      .addEventListener(
        "input",
        copyCommonFields
      );


    /* CAMBIOS GENERALES */

    document.addEventListener(
      "input",
      event => {

        if (
          event.target.matches(
            ".row-qty, .row-price"
          )
        ) {

          updateTotals();

        }


        if (
          event.target.matches(
            ".budget-field"
          )
        ) {

          syncBudgetMonto();

        }


        if (
          event.target.matches(
            ".provider-inline"
          )
        ) {

          syncProviderAndMeta();

        }

      }
    );


    /* ESTADO INICIAL */

    updateTotals();

    updateDeliveries();

    updateDetails();

  }
);
