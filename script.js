/* =========================================================
   ORDEN DE COMPRA - SAFIPRO
========================================================= */


/* =========================================================
   UTILIDADES
========================================================= */

function $(selector) {
    return document.querySelector(selector);
}


function $all(selector) {
    return Array.from(
        document.querySelectorAll(selector)
    );
}


/* =========================================================
   FORMATO DE DINERO
========================================================= */

function parseMoney(value) {

    if (value === null || value === undefined) {
        return 0;
    }

    let texto = String(value)
        .trim()
        .replace(/\$/g, "")
        .replace(/\s/g, "");

    if (!texto) {
        return 0;
    }


    /*
       Si viene como:
       100.000,50
    */

    if (
        texto.includes(".") &&
        texto.includes(",")
    ) {

        texto =
            texto
                .replace(/\./g, "")
                .replace(",", ".");

    }

    /*
       Si viene como:
       100,50
    */

    else if (texto.includes(",")) {

        texto =
            texto.replace(",", ".");

    }


    const numero =
        Number(texto);


    return Number.isFinite(numero)
        ? numero
        : 0;

}


function money(number) {

    return new Intl.NumberFormat(
        "es-AR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(
        Number(number) || 0
    );

}


/* =========================================================
   NUMERO EN LETRAS
========================================================= */

function unidades(n) {

    const lista = [
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

    return lista[n];

}


function menores100(n) {

    if (n <= 20) {
        return unidades(n);
    }


    if (n < 30) {

        return (
            "veinti" +
            unidades(n - 20)
        );

    }


    const decenas = [
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


    const d =
        Math.floor(n / 10);

    const u =
        n % 10;


    if (u === 0) {
        return decenas[d];
    }


    return (
        decenas[d] +
        " y " +
        unidades(u)
    );

}


function menores1000(n) {

    if (n < 100) {
        return menores100(n);
    }


    if (n === 100) {
        return "cien";
    }


    const centenas = [
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


    const c =
        Math.floor(n / 100);

    const resto =
        n % 100;


    if (resto === 0) {
        return centenas[c];
    }


    return (
        centenas[c] +
        " " +
        menores100(resto)
    );

}


function numeroLetras(n) {

    n =
        Math.floor(
            Math.abs(
                Number(n) || 0
            )
        );


    if (n === 0) {
        return "cero";
    }


    if (n < 1000) {
        return menores1000(n);
    }


    if (n < 1000000) {

        const miles =
            Math.floor(n / 1000);

        const resto =
            n % 1000;


        let texto;

        if (miles === 1) {
            texto = "mil";
        } else {
            texto =
                menores1000(miles) +
                " mil";
        }


        if (resto) {

            texto +=
                " " +
                menores1000(resto);

        }


        return texto;
    }


    if (n < 1000000000) {

        const millones =
            Math.floor(
                n / 1000000
            );

        const resto =
            n % 1000000;


        let texto;

        if (millones === 1) {
            texto = "un millón";
        } else {
            texto =
                menores1000(millones) +
                " millones";
        }


        if (resto) {

            texto +=
                " " +
                numeroLetras(resto);

        }


        return texto;
    }


    return String(n);

}


/* =========================================================
   FECHA
========================================================= */

function fechaHoy() {

    const ahora =
        new Date();


    const dia =
        String(
            ahora.getDate()
        ).padStart(2, "0");


    const mes =
        String(
            ahora.getMonth() + 1
        ).padStart(2, "0");


    const año =
        ahora.getFullYear();


    return (
        dia +
        "/" +
        mes +
        "/" +
        año
    );

}


/* =========================================================
   CREAR RENGLÓN
========================================================= */

function crearRenglon(numero) {

    const tr =
        document.createElement("tr");


    tr.className =
        "renglon";


    tr.innerHTML = `

        <td class="renglon-numero">
            ${numero}
        </td>


        <td>

            <input
                type="number"
                min="0"
                step="any"
                class="campo-cantidad"
                value=""
            >

        </td>


        <td>

            <textarea
                class="descripcion"
                placeholder=""
            ></textarea>


            <input
                type="text"
                class="marca"
                placeholder="Marca: "
            >

        </td>


        <td>

            <input
                type="text"
                class="campo-periodo"
                value=""
            >

        </td>


        <td>

            <input
                type="text"
                class="campo-precio"
                inputmode="decimal"
                placeholder="0,00"
            >

        </td>


        <td>

            <input
                type="text"
                class="campo-total"
                value="0,00"
                readonly
            >

        </td>

    `;


    /*
       Cada vez que cambia cantidad
       o precio, recalculamos.
    */

    tr.querySelector(
        ".campo-cantidad"
    ).addEventListener(
        "input",
        recalcularTodo
    );


    tr.querySelector(
        ".campo-precio"
    ).addEventListener(
        "input",
        recalcularTodo
    );


    /*
       La descripción también actualiza
       el anexo automáticamente.
    */

    tr.querySelector(
        ".descripcion"
    ).addEventListener(
        "input",
        actualizarDetalles
    );


    tr.querySelector(
        ".marca"
    ).addEventListener(
        "input",
        actualizarDetalles
    );


    return tr;

}


/* =========================================================
   AGREGAR RENGLÓN
========================================================= */

function agregarRenglon() {

    const tabla =
        $("#renglones");


    const cantidadActual =
        tabla.querySelectorAll(
            ".renglon"
        ).length;


    const nuevo =
        crearRenglon(
            cantidadActual + 1
        );


    tabla.appendChild(
        nuevo
    );


    renumerarRenglones();

    recalcularTodo();

    actualizarEntregas();

    actualizarDetalles();

}


/* =========================================================
   QUITAR RENGLÓN
========================================================= */

function quitarRenglon() {

    const tabla =
        $("#renglones");


    const renglones =
        tabla.querySelectorAll(
            ".renglon"
        );


    /*
       Nunca dejamos la tabla
       sin ningún renglón.
    */

    if (renglones.length <= 1) {

        alert(
            "La Orden de Compra debe tener al menos un renglón."
        );

        return;

    }


    renglones[
        renglones.length - 1
    ].remove();


    renumerarRenglones();

    recalcularTodo();

    actualizarEntregas();

    actualizarDetalles();

}


/* =========================================================
   RENUMERAR
========================================================= */

function renumerarRenglones() {

    const renglones =
        $all(
            "#renglones .renglon"
        );


    renglones.forEach(
        (renglon, index) => {

            renglon.querySelector(
                ".renglon-numero"
            ).textContent =
                index + 1;

        }
    );

}


/* =========================================================
   CALCULAR RENGLONES
========================================================= */

function recalcularTodo() {

    let total =
        0;


    const renglones =
        $all(
            "#renglones .renglon"
        );


    renglones.forEach(
        renglon => {

            const cantidad =
                Number(
                    renglon.querySelector(
                        ".campo-cantidad"
                    ).value
                ) || 0;


            const precio =
                parseMoney(
                    renglon.querySelector(
                        ".campo-precio"
                    ).value
                );


            const subtotal =
                cantidad * precio;


            renglon.querySelector(
                ".campo-total"
            ).value =
                money(subtotal);


            total +=
                subtotal;

        }
    );


    /*
       TOTAL GENERAL
    */

    $("#totalGeneral")
        .textContent =
            money(total);


    /*
       TOTAL EN LETRAS
    */

    const palabraPeso =
        total === 1
            ? "peso"
            : "pesos";


    $("#totalLetras")
        .textContent =
            numeroLetras(total) +
            " " +
            palabraPeso;


    /*
       TOTAL DEL ANEXO
    */

    $("#totalCompromiso")
        .textContent =
            money(total);


    /*
       MONTOS DE LAS PARTIDAS
    */

    $all(
        ".campo-monto"
    ).forEach(
        campo => {

            campo.value =
                money(total);

        }
    );


    actualizarEntregas();

    actualizarDetalles();

}


/* =========================================================
   CRONOGRAMA
========================================================= */

function crearEntrega(numero, cantidad) {

    const tr =
        document.createElement("tr");


    tr.innerHTML = `

        <td
            class="entrega-numero"
            style="text-align:center;font-weight:bold;"
        >
            ${numero}
        </td>


        <td>

            <input
                class="campo-cantidad-entrega"
                type="number"
                min="0"
                step="any"
                value="${cantidad || ""}"
            >

        </td>


        <td>

            <input
                class="campo-plazo"
                type="text"
            >

        </td>


        <td>

            <textarea
                class="campo-entrega"
            ></textarea>

        </td>

    `;


    return tr;

}


function actualizarEntregas() {

    const principal =
        $("#entregas");


    const secundaria =
        $("#entregasPagina2");


    const renglones =
        $all(
            "#renglones .renglon"
        );


    principal.innerHTML = "";

    secundaria.innerHTML = "";


    renglones.forEach(
        (renglon, index) => {

            const numero =
                index + 1;


            const cantidad =
                renglon.querySelector(
                    ".campo-cantidad"
                ).value;


            const fila1 =
                crearEntrega(
                    numero,
                    cantidad
                );


            const fila2 =
                crearEntrega(
                    numero,
                    cantidad
                );


            principal.appendChild(
                fila1
            );


            secundaria.appendChild(
                fila2
            );

        }
    );

}


/* =========================================================
   DETALLES DEL ANEXO
========================================================= */

function actualizarDetalles() {

    const tbody =
        $("#detalles");


    tbody.innerHTML = "";


    const renglones =
        $all(
            "#renglones .renglon"
        );


    renglones.forEach(
        (renglon, index) => {

            const numero =
                index + 1;


            const descripcion =
                renglon.querySelector(
                    ".descripcion"
                ).value;


            const marca =
                renglon.querySelector(
                    ".marca"
                ).value;


            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td
                    style="
                        text-align:center;
                        font-weight:bold;
                    "
                >
                    ${numero}
                </td>


                <td>

                    <textarea
                        class="detalle-texto"
                    >${descripcion}${marca ? "\n" + marca : ""}</textarea>

                </td>

            `;


            /*
               Si el usuario modifica
               el detalle del anexo,
               queda editable.
            */

            tbody.appendChild(
                tr
            );

        }
    );

}


/* =========================================================
   PARTIDAS PRESUPUESTARIAS
========================================================= */

function crearPartida() {

    const tr =
        document.createElement("tr");


    const campos = [
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


    let html = "";


    campos.forEach(
        campo => {

            html += `

                <td>

                    <input
                        type="text"
                        title="${campo}"
                    >

                </td>

            `;

        }
    );


    html += `

        <td>

            <input
                type="text"
                class="campo-monto"
                value="0,00"
                readonly
            >

        </td>

    `;


    tr.innerHTML =
        html;


    return tr;

}


function agregarPartida() {

    $("#partidas")
        .appendChild(
            crearPartida()
        );


    recalcularTodo();

}


/* =========================================================
   SINCRONIZAR DATOS
========================================================= */

function sincronizarDatos() {

    const fecha =
        $("#fecha").value;


    const numero =
        $("#numeroOC").value;


    const proveedor =
        $("#proveedor").value;


    $all(
        '[data-ref="fecha"]'
    ).forEach(
        campo => {

            campo.value =
                fecha;

        }
    );


    $all(
        '[data-ref="numeroOC"]'
    ).forEach(
        campo => {

            campo.value =
                numero;

        }
    );


    $all(
        '[data-ref="proveedor"]'
    ).forEach(
        campo => {

            campo.value =
                proveedor;

        }
    );

}


/* =========================================================
   DESCARGAR PDF
========================================================= */

function descargarPDF() {

    const documento =
        document.getElementById(
            "documento"
        );


    /*
       El nombre se arma con
       el número de OC.
    */

    let numero =
        $("#numeroOC").value
            .trim();


    if (!numero) {
        numero = "SinNumero";
    }


    const opciones = {

        margin: 0,

        filename:
            "Orden_de_Compra_" +
            numero +
            ".pdf",

        image: {

            type: "jpeg",

            quality: 0.98

        },

        html2canvas: {

            scale: 2,

            useCORS: true,

            allowTaint: true,

            backgroundColor: "#ffffff",

            logging: false

        },

        jsPDF: {

            unit: "mm",

            format: "a4",

            orientation: "portrait"

        },

        pagebreak: {

            mode: [
                "css",
                "legacy"
            ],

            avoid: [
                "tr",
                ".firmas",
                ".texto-legal"
            ]

        }

    };


    /*
       Desactivamos temporalmente
       el foco amarillo.
    */

    document.body.classList.add(
        "generando-pdf"
    );


    html2pdf()

        .set(opciones)

        .from(documento)

        .save()

        .finally(
            () => {

                document.body.classList.remove(
                    "generando-pdf"
                );

            }
        );

}


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* ---------------------------------
           FECHA
        --------------------------------- */

        $("#fecha").value =
            fechaHoy();


        /*
           IMPORTANTE:

           SOLO UN RENGLÓN AL ABRIR.
        */

        $("#renglones")
            .appendChild(
                crearRenglon(1)
            );


        /*
           SOLO UNA PARTIDA AL ABRIR.
        */

        $("#partidas")
            .appendChild(
                crearPartida()
            );


        /*
           BOTÓN AGREGAR RENGLÓN
        */

        $("#agregarRenglon")
            .addEventListener(
                "click",
                agregarRenglon
            );


        /*
           BOTÓN QUITAR RENGLÓN
        */

        $("#quitarRenglon")
            .addEventListener(
                "click",
                quitarRenglon
            );


        /*
           BOTÓN AGREGAR PARTIDA
        */

        $("#agregarPartida")
            .addEventListener(
                "click",
                agregarPartida
            );


        /*
           BOTÓN DESCARGAR PDF
        */

        $("#descargarPDF")
            .addEventListener(
                "click",
                descargarPDF
            );


        /*
           DATOS GENERALES
        */

        $("#fecha")
            .addEventListener(
                "input",
                sincronizarDatos
            );


        $("#numeroOC")
            .addEventListener(
                "input",
                sincronizarDatos
            );


        $("#proveedor")
            .addEventListener(
                "input",
                sincronizarDatos
            );


        /*
           ESTADO INICIAL
        */

        sincronizarDatos();

        recalcularTodo();

        actualizarEntregas();

        actualizarDetalles();

    }
);
